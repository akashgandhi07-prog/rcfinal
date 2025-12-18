import { supabase } from './client'
import type { User, UCATMock, ParentStudentLink, MentorStudentLink, MentorComment, PortfolioActivity, UniversityStrategy, UserUpdate, ActivityLog, LoginAttempt, Message, MessageWithUsers, Resource, ResourceCreate, ResourceUpdate, StudentDocument, RecentChange } from './types'
// FeatureName removed - feature toggles simplified
import { logger } from '@/lib/utils/logger'
// Activity logging removed to simplify codebase

// ============================================
// USER QUERIES
// ============================================

// Cache for current user to prevent redundant calls
let userCache: { user: User | null; timestamp: number; userId: string | null } = {
  user: null,
  timestamp: 0,
  userId: null,
}
const CACHE_TTL = 5000 // 5 seconds cache

export async function getCurrentUser(forceRefresh = false): Promise<User | null> {
  try {
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !authUser) {
      // Clear cache if auth fails
      userCache = { user: null, timestamp: 0, userId: null }
      return null
    }

    // Check cache if not forcing refresh
    const now = Date.now()
    if (
      !forceRefresh &&
      userCache.user &&
      userCache.userId === authUser.id &&
      now - userCache.timestamp < CACHE_TTL
    ) {
      return userCache.user
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (error) {
      // Check for RLS recursion - this is a critical error that needs fixing
      if (error.code === '42P17' || error.message?.includes('infinite recursion')) {
        logger.error('RLS infinite recursion detected. Please apply RLS fix script.', error, { userId: authUser.id })
        // Don't cache errors
        return null
      }
      logger.error('Error fetching user', error, { userId: authUser.id })
      return null
    }

    // Update cache
    userCache = {
      user: data as User,
      timestamp: now,
      userId: authUser.id,
    }

    return data as User
  } catch (error) {
    logger.error('Error in getCurrentUser', error)
    return null
  }
}

// Clear user cache (useful after updates)
export function clearUserCache(): void {
  userCache = { user: null, timestamp: 0, userId: null }
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      logger.error('Error fetching user by ID', error, { userId })
      return null
    }

    return data as User
  } catch (error) {
    logger.error('Error in getUserById', error, { userId })
    return null
  }
}

export async function updateUser(
  userId: string,
  updates: UserUpdate
): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      logger.error('Error updating user', error, { userId })
      return null
    }

    // Clear cache if this is the current user
    if (userCache.userId === userId) {
      clearUserCache()
    }

    // Log user updates (track what changed) - don't await to avoid blocking
    const changes: Record<string, { old: unknown; new: unknown }> = {}
    Object.keys(updates).forEach((key) => {
      changes[key] = {
        old: `[previous value]`,
        new: updates[key as keyof typeof updates],
      }
    })

    return data as User
  } catch (error) {
    logger.error('Error in updateUser', error, { userId })
    return null
  }
}

export async function getLinkedStudents(parentId: string): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('parent_student_links')
      .select('student_id')
      .eq('parent_id', parentId)

    if (error || !data) {
      logger.error('Error fetching linked students', error, { parentId })
      return []
    }

    const studentIds = data.map((link) => link.student_id)

    if (studentIds.length === 0) {
      return []
    }

    const { data: students, error: studentsError } = await supabase
      .from('users')
      .select('*')
      .in('id', studentIds)

    if (studentsError) {
      logger.error('Error fetching students', studentsError, { parentId, studentIds })
      return []
    }

    return (students || []) as User[]
  } catch (error) {
    logger.error('Error in getLinkedStudents', error, { parentId })
    return []
  }
}

export async function getAllStudents(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'student')
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Error fetching all students', error)
      return []
    }

    return (data || []) as User[]
  } catch (error) {
    logger.error('Error in getAllStudents', error)
    return []
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Error fetching all users', error)
      return []
    }

    return (data || []) as User[]
  } catch (error) {
    logger.error('Error in getAllUsers', error)
    return []
  }
}

// ============================================
// ADMIN RELATIONSHIP QUERIES
// ============================================

export interface UserRelationship {
  student: User
  parents: User[]
  mentors: User[]
}

export async function getAllUserRelationships(): Promise<UserRelationship[]> {
  try {
    // Get all students
    const students = await getAllStudents()
    
    // Get all parent-student links
    const { data: parentLinks, error: parentLinksError } = await supabase
      .from('parent_student_links')
      .select('parent_id, student_id')
    
    if (parentLinksError) {
      logger.error('Error fetching parent links', parentLinksError)
    }
    
    // Get all mentor-student links
    const { data: mentorLinks, error: mentorLinksError } = await supabase
      .from('mentor_student_links')
      .select('mentor_id, student_id')
    
    if (mentorLinksError) {
      logger.error('Error fetching mentor links', mentorLinksError)
    }
    
    // Get all parents and mentors
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('*')
      .in('role', ['parent', 'mentor'])
    
    if (usersError) {
      logger.error('Error fetching parents/mentors', usersError)
      return []
    }
    
    const parentsMap = new Map<string, User>()
    const mentorsMap = new Map<string, User>()
    
    allUsers?.forEach(user => {
      if (user.role === 'parent') {
        parentsMap.set(user.id, user as User)
      } else if (user.role === 'mentor') {
        mentorsMap.set(user.id, user as User)
      }
    })
    
    // Build relationships
    const relationships: UserRelationship[] = students.map(student => {
      const parents = (parentLinks || [])
        .filter(link => link.student_id === student.id)
        .map(link => parentsMap.get(link.parent_id))
        .filter((p): p is User => p !== undefined)
      
      const mentors = (mentorLinks || [])
        .filter(link => link.student_id === student.id)
        .map(link => mentorsMap.get(link.mentor_id))
        .filter((m): m is User => m !== undefined)
      
      return {
        student,
        parents,
        mentors,
      }
    })
    
    return relationships
  } catch (error) {
    logger.error('Error in getAllUserRelationships', error)
    return []
  }
}

// ============================================
// FEATURE TOGGLE QUERIES - SIMPLIFIED
// ============================================

// Feature toggles removed - all features enabled by default
export async function isFeatureEnabled(): Promise<boolean> {
  return true // Always enabled
}

// ============================================
// PARENT-STUDENT LINK QUERIES
// ============================================

export async function createParentStudentLink(
  parentId: string,
  studentId: string
): Promise<ParentStudentLink | null> {
  try {
    const { data, error } = await supabase
      .from('parent_student_links')
      .insert({
        parent_id: parentId,
        student_id: studentId,
      })
      .select()
      .single()

    if (error) {
      logger.error('Error creating parent-student link', error, { parentId, studentId })
      return null
    }


    return data as ParentStudentLink
  } catch (error) {
    logger.error('Error in createParentStudentLink', error, { parentId, studentId })
    return null
  }
}

export async function deleteParentStudentLink(
  parentId: string,
  studentId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('parent_student_links')
      .delete()
      .eq('parent_id', parentId)
      .eq('student_id', studentId)

    if (error) {
      logger.error('Error deleting parent-student link', error, { parentId, studentId })
      return false
    }


    return true
  } catch (error) {
    logger.error('Error in deleteParentStudentLink', error, { parentId, studentId })
    return false
  }
}

// ============================================
// UCAT MOCKS QUERIES
// ============================================

export async function getUCATMocks(userId: string): Promise<UCATMock[]> {
  try {
    const { data, error } = await supabase
      .from('ucat_mocks')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true })

    if (error) {
      console.error('Error fetching UCAT mocks:', error)
      return []
    }

    return (data || []) as UCATMock[]
  } catch (error) {
    logger.error('Error in getUCATMocks', error, { userId })
    return []
  }
}

export async function createUCATMock(
  userId: string,
  mock: Omit<UCATMock, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<UCATMock | null> {
  try {
    // Validate scores
    const scores = [mock.vr_score, mock.dm_score, mock.qr_score, mock.ar_score]
    const validScores = scores.every(score => score === null || (score >= 300 && score <= 900))
    
    if (!validScores) {
      logger.error('Invalid UCAT scores', new Error('Score validation failed'), { userId, scores })
      return null
    }

    const totalScore = scores.reduce((sum: number, score) => sum + (score || 0), 0)
    const mockData = {
      ...mock,
      user_id: userId,
      total_score: totalScore,
    }

    const { data, error } = await supabase
      .from('ucat_mocks')
      .insert(mockData)
      .select()
      .single()

    if (error) {
      logger.error('Error creating UCAT mock', error, { userId })
      return null
    }


    return data as UCATMock
  } catch (error) {
    logger.error('Error in createUCATMock', error, { userId })
    return null
  }
}

export async function updateUCATMock(
  mockId: string,
  updates: Partial<Omit<UCATMock, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<UCATMock | null> {
  try {
    const { data, error } = await supabase
      .from('ucat_mocks')
      .update(updates)
      .eq('id', mockId)
      .select()
      .single()

    if (error) {
      logger.error('Error updating UCAT mock', error, { mockId })
      return null
    }

    // Log the update
    const changes: Record<string, { old: unknown; new: unknown }> = {}
    Object.keys(updates).forEach((key) => {
      changes[key] = {
        old: `[previous value]`,
        new: updates[key as keyof typeof updates],
      }
    })

    return data as UCATMock
  } catch (error) {
    logger.error('Error in updateUCATMock', error, { mockId })
    return null
  }
}

export async function deleteUCATMock(mockId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('ucat_mocks')
      .delete()
      .eq('id', mockId)

    if (error) {
      logger.error('Error deleting UCAT mock', error, { mockId })
      return false
    }


    return true
  } catch (error) {
    logger.error('Error in deleteUCATMock', error, { mockId })
    return false
  }
}

// ============================================
// PORTFOLIO ACTIVITIES QUERIES
// ============================================

export async function getPortfolioActivities(userId: string): Promise<PortfolioActivity[]> {
  try {
    const { data, error } = await supabase
      .from('portfolio_activities')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false })

    if (error) {
      logger.error('Error fetching portfolio activities', error, { userId })
      return []
    }

    return (data || []) as PortfolioActivity[]
  } catch (error) {
    console.error('Error in getPortfolioActivities:', error)
    return []
  }
}

export async function createPortfolioActivity(
  userId: string,
  activity: Omit<PortfolioActivity, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<PortfolioActivity | null> {
  try {
    const { data, error } = await supabase
      .from('portfolio_activities')
      .insert({
        ...activity,
        user_id: userId,
      })
      .select()
      .single()

    if (error) {
      logger.error('Error creating portfolio activity', error, { userId, category: activity.category })
      return null
    }


    return data as PortfolioActivity
  } catch (error) {
    console.error('Error in createPortfolioActivity:', error)
    return null
  }
}

export async function updatePortfolioActivity(
  activityId: string,
  updates: Partial<Omit<PortfolioActivity, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<PortfolioActivity | null> {
  try {
    const { data, error } = await supabase
      .from('portfolio_activities')
      .update(updates)
      .eq('id', activityId)
      .select()
      .single()

    if (error) {
      logger.error('Error updating portfolio activity', error, { activityId })
      return null
    }

    // Log the update
    const changes: Record<string, { old: unknown; new: unknown }> = {}
    Object.keys(updates).forEach((key) => {
      changes[key] = {
        old: `[previous value]`,
        new: updates[key as keyof typeof updates],
      }
    })

    return data as PortfolioActivity
  } catch (error) {
    console.error('Error in updatePortfolioActivity:', error)
    return null
  }
}

export async function deletePortfolioActivity(activityId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('portfolio_activities')
      .delete()
      .eq('id', activityId)

    if (error) {
      logger.error('Error deleting portfolio activity', error, { activityId })
      return false
    }


    return true
  } catch (error) {
    console.error('Error in deletePortfolioActivity:', error)
    return false
  }
}

// ============================================
// UNIVERSITY STRATEGY QUERIES
// ============================================

export async function getUniversityStrategies(userId: string): Promise<UniversityStrategy[]> {
  try {
    const { data, error } = await supabase
      .from('university_strategies')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Error fetching university strategies', error, { userId })
      return []
    }

    return (data || []) as UniversityStrategy[]
  } catch (error) {
    logger.error('Error in getUniversityStrategies', error, { userId })
    return []
  }
}

export async function createUniversityStrategy(
  userId: string,
  strategy: Omit<UniversityStrategy, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<UniversityStrategy | null> {
  try {
    // Check shortlist limit (max 4)
    if (strategy.status === 'shortlist') {
      const existing = await getUniversityStrategies(userId)
      const shortlistCount = existing.filter(s => s.status === 'shortlist').length
      if (shortlistCount >= 4) {
        logger.warn('Shortlist limit reached', { userId, shortlistCount })
        return null
      }
    }

    const { data, error } = await supabase
      .from('university_strategies')
      .insert({
        ...strategy,
        user_id: userId,
      })
      .select()
      .single()

    if (error) {
      logger.error('Error creating university strategy', error, { userId, status: strategy.status })
      return null
    }


    return data as UniversityStrategy
  } catch (error) {
    logger.error('Error in createUniversityStrategy', error, { userId })
    return null
  }
}

export async function updateUniversityStrategy(
  strategyId: string,
  updates: Partial<Omit<UniversityStrategy, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<UniversityStrategy | null> {
  try {
    // Check shortlist limit if moving to shortlist
    if (updates.status === 'shortlist') {
      const current = await supabase
        .from('university_strategies')
        .select('user_id')
        .eq('id', strategyId)
        .single()

      if (current.data) {
        const existing = await getUniversityStrategies(current.data.user_id)
        const shortlistCount = existing.filter(s => s.status === 'shortlist' && s.id !== strategyId).length
        if (shortlistCount >= 4) {
          logger.warn('Shortlist limit reached on update', { strategyId, shortlistCount })
          return null
        }
      }
    }

    const { data, error } = await supabase
      .from('university_strategies')
      .update(updates)
      .eq('id', strategyId)
      .select()
      .single()

    if (error) {
      logger.error('Error updating university strategy', error, { strategyId })
      return null
    }

    // Log the update
    const changes: Record<string, { old: unknown; new: unknown }> = {}
    Object.keys(updates).forEach((key) => {
      changes[key] = {
        old: `[previous value]`,
        new: updates[key as keyof typeof updates],
      }
    })

    return data as UniversityStrategy
  } catch (error) {
    logger.error('Error in updateUniversityStrategy', error, { strategyId })
    return null
  }
}

export async function deleteUniversityStrategy(strategyId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('university_strategies')
      .delete()
      .eq('id', strategyId)

    if (error) {
      logger.error('Error deleting university strategy', error, { strategyId })
      return false
    }


    return true
  } catch (error) {
    logger.error('Error in deleteUniversityStrategy', error, { strategyId })
    return false
  }
}

// ============================================
// MENTOR-STUDENT LINK QUERIES
// ============================================

export async function createMentorStudentLink(
  mentorId: string,
  studentId: string
): Promise<MentorStudentLink | null> {
  try {
    const { data, error } = await supabase
      .from('mentor_student_links')
      .insert({
        mentor_id: mentorId,
        student_id: studentId,
      })
      .select()
      .single()

    if (error) {
      logger.error('Error creating mentor-student link', error, { mentorId, studentId })
      return null
    }


    return data as MentorStudentLink
  } catch (error) {
    logger.error('Error in createMentorStudentLink', error, { mentorId, studentId })
    return null
  }
}

export async function deleteMentorStudentLink(
  mentorId: string,
  studentId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('mentor_student_links')
      .delete()
      .eq('mentor_id', mentorId)
      .eq('student_id', studentId)

    if (error) {
      logger.error('Error deleting mentor-student link', error, { mentorId, studentId })
      return false
    }


    return true
  } catch (error) {
    logger.error('Error in deleteMentorStudentLink', error, { mentorId, studentId })
    return false
  }
}

export async function getLinkedStudentsForMentor(mentorId: string): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('mentor_student_links')
      .select('student_id')
      .eq('mentor_id', mentorId)

    if (error || !data) {
      logger.error('Error fetching linked students for mentor', error, { mentorId })
      return []
    }

    const studentIds = data.map((link) => link.student_id)

    if (studentIds.length === 0) {
      return []
    }

    const { data: students, error: studentsError } = await supabase
      .from('users')
      .select('*')
      .in('id', studentIds)

    if (studentsError) {
      logger.error('Error fetching students', studentsError, { mentorId, studentIds })
      return []
    }

    return (students || []) as User[]
  } catch (error) {
    logger.error('Error in getLinkedStudentsForMentor', error, { mentorId })
    return []
  }
}

export async function getMentorsForStudent(studentId: string): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('mentor_student_links')
      .select('mentor_id')
      .eq('student_id', studentId)

    if (error || !data) {
      logger.error('Error fetching mentors for student', error, { studentId })
      return []
    }

    const mentorIds = data.map((link) => link.mentor_id)

    if (mentorIds.length === 0) {
      return []
    }

    const { data: mentors, error: mentorsError } = await supabase
      .from('users')
      .select('*')
      .in('id', mentorIds)

    if (mentorsError) {
      logger.error('Error fetching mentors', mentorsError, { studentId, mentorIds })
      return []
    }

    return (mentors || []) as User[]
  } catch (error) {
    logger.error('Error in getMentorsForStudent', error, { studentId })
    return []
  }
}

export async function getParentsForStudent(studentId: string): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('parent_student_links')
      .select('parent_id')
      .eq('student_id', studentId)

    if (error || !data) {
      logger.error('Error fetching parents for student', error, { studentId })
      return []
    }

    const parentIds = data.map((link) => link.parent_id)

    if (parentIds.length === 0) {
      return []
    }

    const { data: parents, error: parentsError } = await supabase
      .from('users')
      .select('*')
      .in('id', parentIds)

    if (parentsError) {
      logger.error('Error fetching parents', parentsError, { studentId, parentIds })
      return []
    }

    return (parents || []) as User[]
  } catch (error) {
    logger.error('Error in getParentsForStudent', error, { studentId })
    return []
  }
}

// ============================================
// MENTOR COMMENTS QUERIES
// ============================================

export async function createMentorComment(
  mentorId: string,
  studentId: string,
  section: string,
  commentText: string,
  commentType: 'feedback' | 'plan' | 'suggestion' = 'feedback',
  sectionItemId?: string | null
): Promise<MentorComment | null> {
  try {
    const { data, error } = await supabase
      .from('mentor_comments')
      .insert({
        mentor_id: mentorId,
        student_id: studentId,
        section,
        section_item_id: sectionItemId || null,
        comment_text: commentText,
        comment_type: commentType,
      })
      .select()
      .single()

    if (error) {
      logger.error('Error creating mentor comment', error, { mentorId, studentId, section })
      return null
    }


    return data as MentorComment
  } catch (error) {
    logger.error('Error in createMentorComment', error, { mentorId, studentId, section })
    return null
  }
}

export async function getMentorComments(
  studentId: string,
  section?: string,
  sectionItemId?: string | null
): Promise<(MentorComment & { mentor?: { full_name: string | null; email: string } })[]> {
  try {
    let query = supabase
      .from('mentor_comments')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })

    if (section) {
      query = query.eq('section', section)
    }

    if (sectionItemId) {
      query = query.eq('section_item_id', sectionItemId)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Error fetching mentor comments', error, { studentId, section, sectionItemId })
      return []
    }

    if (!data || data.length === 0) {
      return []
    }

    // Fetch mentor details for each comment
    const mentorIds = [...new Set(data.map((c: MentorComment) => c.mentor_id))]
    const { data: mentors, error: mentorsError } = await supabase
      .from('users')
      .select('id, full_name, email')
      .in('id', mentorIds)

    if (mentorsError) {
      logger.error('Error fetching mentors', mentorsError)
    }

    const mentorMap = new Map((mentors || []).map((m: any) => [m.id, { full_name: m.full_name, email: m.email }]))

    return data.map((comment: MentorComment) => ({
      ...comment,
      mentor: mentorMap.get(comment.mentor_id),
    })) as (MentorComment & { mentor?: { full_name: string | null; email: string } })[]
  } catch (error) {
    logger.error('Error in getMentorComments', error, { studentId, section, sectionItemId })
    return []
  }
}

export async function updateMentorComment(
  commentId: string,
  commentText: string
): Promise<MentorComment | null> {
  try {
    const { data, error } = await supabase
      .from('mentor_comments')
      .update({ comment_text: commentText })
      .eq('id', commentId)
      .select()
      .single()

    if (error) {
      logger.error('Error updating mentor comment', error, { commentId })
      return null
    }


    return data as MentorComment
  } catch (error) {
    logger.error('Error in updateMentorComment', error, { commentId })
    return null
  }
}

export async function deleteMentorComment(commentId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('mentor_comments')
      .delete()
      .eq('id', commentId)

    if (error) {
      logger.error('Error deleting mentor comment', error, { commentId })
      return false
    }


    return true
  } catch (error) {
    logger.error('Error in deleteMentorComment', error, { commentId })
    return false
  }
}

// ============================================
// ACTIVITY LOG QUERIES (Admin Only)
// ============================================

export async function getActivityLogs(options?: {
  limit?: number
  offset?: number
  userId?: string
  actionType?: string
  resourceType?: string
  startDate?: string
  endDate?: string
}): Promise<ActivityLog[]> {
  try {
    let query = supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })

    if (options?.userId) {
      query = query.eq('user_id', options.userId)
    }

    if (options?.actionType) {
      query = query.eq('action_type', options.actionType)
    }

    if (options?.resourceType) {
      query = query.eq('resource_type', options.resourceType)
    }

    if (options?.startDate) {
      query = query.gte('created_at', options.startDate)
    }

    if (options?.endDate) {
      query = query.lte('created_at', options.endDate)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Error fetching activity logs', error)
      return []
    }

    return (data || []) as ActivityLog[]
  } catch (error) {
    logger.error('Error in getActivityLogs', error)
    return []
  }
}

// ============================================
// RECENT CHANGES & ACTIVITY QUERIES
// ============================================

export async function getRecentChanges(hours: number = 24): Promise<RecentChange[]> {
  try {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
    
    // Get recent signups
    const { data: recentSignups } = await supabase
      .from('users')
      .select('id, email, full_name, created_at, approval_status, role')
      .gte('created_at', since)
      .order('created_at', { ascending: false })

    // Get recent comments
    const { data: recentComments } = await supabase
      .from('mentor_comments')
      .select('id, student_id, created_at, comment_text, mentor_id, users!mentor_comments_mentor_id_fkey(email, full_name)')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(50)

    // Get recent UCAT mocks
    const { data: recentUCAT } = await supabase
      .from('ucat_mocks')
      .select('id, user_id, created_at, mock_name, users!ucat_mocks_user_id_fkey(email, full_name)')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(50)

    // Get recent portfolio activities
    const { data: recentPortfolio } = await supabase
      .from('portfolio_activities')
      .select('id, user_id, created_at, organization, activity_type, users!portfolio_activities_user_id_fkey(email, full_name)')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(50)

    // Get recent activity logs
    const { data: recentActivityLogs } = await supabase
      .from('activity_log')
      .select('*')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(100)

    const changes: RecentChange[] = []

    // Process signups
    if (recentSignups) {
      recentSignups.forEach(user => {
        changes.push({
          id: `signup-${user.id}`,
          type: 'signup',
          userId: user.id,
          userEmail: user.email,
          userName: user.full_name,
          description: `New ${user.role} signup: ${user.email} (${user.approval_status})`,
          timestamp: user.created_at,
          metadata: { approval_status: user.approval_status, role: user.role },
        })
      })
    }

    // Process comments
    if (recentComments) {
      recentComments.forEach((comment: any) => {
        const mentor = comment.users as any
        changes.push({
          id: `comment-${comment.id}`,
          type: 'comment',
          userId: comment.student_id,
          userEmail: mentor?.email || 'Unknown',
          userName: mentor?.full_name || null,
          resourceId: comment.id,
          description: `New comment from ${mentor?.full_name || mentor?.email || 'mentor'}: ${comment.comment_text.substring(0, 50)}...`,
          timestamp: comment.created_at,
          metadata: { mentor_id: comment.mentor_id, student_id: comment.student_id },
        })
      })
    }

    // Process UCAT mocks
    if (recentUCAT) {
      recentUCAT.forEach((mock: any) => {
        const user = mock.users as any
        changes.push({
          id: `ucat-${mock.id}`,
          type: 'ucat',
          userId: mock.user_id,
          userEmail: user?.email || 'Unknown',
          userName: user?.full_name || null,
          resourceId: mock.id,
          description: `New UCAT mock added: ${mock.mock_name}`,
          timestamp: mock.created_at,
          metadata: { mock_name: mock.mock_name },
        })
      })
    }

    // Process portfolio activities
    if (recentPortfolio) {
      recentPortfolio.forEach((activity: any) => {
        const user = activity.users as any
        changes.push({
          id: `portfolio-${activity.id}`,
          type: 'portfolio',
          userId: activity.user_id,
          userEmail: user?.email || 'Unknown',
          userName: user?.full_name || null,
          resourceId: activity.id,
          description: `New ${activity.activity_type} activity: ${activity.organization}`,
          timestamp: activity.created_at,
          metadata: { activity_type: activity.activity_type, organization: activity.organization },
        })
      })
    }

    // Process activity logs for profile updates and status changes
    if (recentActivityLogs) {
      recentActivityLogs.forEach((log: any) => {
        if (log.action_type === 'update' && log.resource_type === 'user') {
          changes.push({
            id: `activity-${log.id}`,
            type: 'profile',
            userId: log.resource_id || '',
            userEmail: log.user_email || 'Unknown',
            userName: null,
            resourceId: log.resource_id || undefined,
            description: log.description || 'Profile updated',
            timestamp: log.created_at,
            metadata: log.metadata || {},
          })
        } else if (log.action_type === 'approve' || log.action_type === 'reject') {
          changes.push({
            id: `status-${log.id}`,
            type: 'approval',
            userId: log.resource_id || '',
            userEmail: log.user_email || 'Unknown',
            userName: null,
            resourceId: log.resource_id || undefined,
            description: log.description || 'Status changed',
            timestamp: log.created_at,
            metadata: log.metadata || {},
          })
        }
      })
    }

    // Sort by timestamp (newest first)
    return changes.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  } catch (error) {
    logger.error('Error fetching recent changes', error)
    return []
  }
}

export async function getPendingApprovals(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('approval_status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Error fetching pending approvals', error)
      return []
    }

    return (data || []) as User[]
  } catch (error) {
    logger.error('Error in getPendingApprovals', error)
    return []
  }
}

export async function getLoginAttempts(options?: {
  limit?: number
  offset?: number
  email?: string
  success?: boolean
  startDate?: string
  endDate?: string
}): Promise<LoginAttempt[]> {
  try {
    let query = supabase
      .from('login_attempts')
      .select('*')
      .order('created_at', { ascending: false })

    if (options?.email) {
      query = query.eq('email', options.email)
    }

    if (options?.success !== undefined) {
      query = query.eq('success', options.success)
    }

    if (options?.startDate) {
      query = query.gte('created_at', options.startDate)
    }

    if (options?.endDate) {
      query = query.lte('created_at', options.endDate)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Error fetching login attempts', error)
      return []
    }

    return (data || []) as LoginAttempt[]
  } catch (error) {
    logger.error('Error in getLoginAttempts', error)
    return []
  }
}

export async function getUserActivitySummary(userId?: string): Promise<{
  user_email: string | null
  total_activities: number
  last_activity: string | null
  login_count: number
  last_login: string | null
}[]> {
  try {
    const { data, error } = await supabase.rpc('get_user_activity_summary', {
      p_user_id: userId || null,
    })

    if (error) {
      logger.error('Error fetching user activity summary', error)
      return []
    }

    return (data || []) as {
      user_email: string | null
      total_activities: number
      last_activity: string | null
      login_count: number
      last_login: string | null
    }[]
  } catch (error) {
    logger.error('Error in getUserActivitySummary', error)
    return []
  }
}

// ============================================
// RESOURCE LIBRARY QUERIES
// ============================================

export async function getResources(options?: {
  resourceType?: string
  course?: 'medicine' | 'dentistry' | 'veterinary'
  searchQuery?: string
  universityName?: string
}): Promise<Resource[]> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return []
    }

    let query = supabase
      .from('resources')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    // Filter by resource type
    if (options?.resourceType) {
      query = query.eq('resource_type', options.resourceType)
    }

    // Filter by course visibility based on user's target course
    if (options?.course) {
      if (options.course === 'medicine') {
        query = query.eq('visible_to_medicine', true)
      } else if (options.course === 'dentistry') {
        query = query.eq('visible_to_dentistry', true)
      } else if (options.course === 'veterinary') {
        query = query.eq('visible_to_veterinary', true)
      }
    } else if (currentUser.target_course) {
      // Auto-filter by user's course
      if (currentUser.target_course === 'medicine') {
        query = query.eq('visible_to_medicine', true)
      } else if (currentUser.target_course === 'dentistry') {
        query = query.eq('visible_to_dentistry', true)
      } else if (currentUser.target_course === 'veterinary') {
        query = query.eq('visible_to_veterinary', true)
      }
    }

    // Filter by university name (for university guides)
    if (options?.universityName) {
      query = query.ilike('university_name', `%${options.universityName}%`)
    }

    // Search functionality
    if (options?.searchQuery) {
      query = query.or(`title.ilike.%${options.searchQuery}%,description.ilike.%${options.searchQuery}%,searchable_content.ilike.%${options.searchQuery}%`)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Error fetching resources', error, { options })
      return []
    }

    return (data || []) as Resource[]
  } catch (error) {
    logger.error('Error in getResources', error, { options })
    return []
  }
}

export async function getAllResourcesForAdmin(): Promise<Resource[]> {
  try {
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Error fetching all resources for admin', error)
      return []
    }

    return (data || []) as Resource[]
  } catch (error) {
    logger.error('Error in getAllResourcesForAdmin', error)
    return []
  }
}

export async function createResource(
  resource: ResourceCreate
): Promise<Resource | null> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'admin') {
      logger.error('Unauthorized resource creation attempt', new Error('Not admin'), { userId: currentUser?.id })
      return null
    }

    const { data, error } = await supabase
      .from('resources')
      .insert({
        ...resource,
        created_by: currentUser.id,
      })
      .select()
      .single()

    if (error) {
      logger.error('Error creating resource', error, { resource })
      return null
    }


    return data as Resource
  } catch (error) {
    logger.error('Error in createResource', error, { resource })
    return null
  }
}

export async function updateResource(
  resourceId: string,
  updates: ResourceUpdate
): Promise<Resource | null> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'admin') {
      logger.error('Unauthorized resource update attempt', new Error('Not admin'), { userId: currentUser?.id, resourceId })
      return null
    }

    const { data, error } = await supabase
      .from('resources')
      .update(updates)
      .eq('id', resourceId)
      .select()
      .single()

    if (error) {
      logger.error('Error updating resource', error, { resourceId, updates })
      return null
    }

    // Log the update
    const changes: Record<string, { old: unknown; new: unknown }> = {}
    Object.keys(updates).forEach((key) => {
      changes[key] = {
        old: `[previous value]`,
        new: updates[key as keyof typeof updates],
      }
    })

    return data as Resource
  } catch (error) {
    logger.error('Error in updateResource', error, { resourceId, updates })
    return null
  }
}

export async function deleteResource(resourceId: string): Promise<boolean> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'admin') {
      logger.error('Unauthorized resource deletion attempt', new Error('Not admin'), { userId: currentUser?.id, resourceId })
      return false
    }

    // Get resource to delete file from storage
    const { data: resource } = await supabase
      .from('resources')
      .select('file_url')
      .eq('id', resourceId)
      .single()

    // Delete file from storage if exists
    if (resource?.file_url) {
      const filePath = resource.file_url.split('/').slice(-2).join('/') // Extract bucket/path from URL
      const { error: storageError } = await supabase.storage
        .from('resources')
        .remove([filePath])

      if (storageError) {
        logger.error('Error deleting file from storage', storageError, { resourceId, filePath })
        // Continue with resource deletion even if file deletion fails
      }
    }

    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', resourceId)

    if (error) {
      logger.error('Error deleting resource', error, { resourceId })
      return false
    }


    return true
  } catch (error) {
    logger.error('Error in deleteResource', error, { resourceId })
    return false
  }
}

export async function uploadResourceFile(file: File): Promise<{ url: string; path: string } | null> {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser || currentUser.role !== 'admin') {
      logger.error('Unauthorized file upload attempt', new Error('Not admin'), { userId: currentUser?.id })
      return null
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `${currentUser.id}/${fileName}`

    const { data, error } = await supabase.storage
      .from('resources')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      logger.error('Error uploading file', error, { fileName, filePath })
      return null
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('resources')
      .getPublicUrl(filePath)

    return {
      url: publicUrl,
      path: filePath,
    }
  } catch (error) {
    logger.error('Error in uploadResourceFile', error)
    return null
  }
}

// ============================================
// MESSAGE QUERIES
// ============================================

export async function createMessage(
  senderId: string,
  recipientId: string | null,
  studentId: string | null,
  messageText: string,
  subject: string | null = null,
  parentId: string | null = null,
  threadId: string | null = null
): Promise<Message | null> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        recipient_id: recipientId,
        student_id: studentId,
        message_text: messageText,
        subject: subject,
        parent_id: parentId,
        thread_id: threadId, // Will be auto-set to id if null by trigger
        is_read: false,
      })
      .select()
      .single()

    if (error) {
      logger.error('Error creating message', error, { senderId, recipientId, studentId })
      return null
    }


    return data as Message
  } catch (error) {
    logger.error('Error in createMessage', error, { senderId, recipientId, studentId })
    return null
  }
}

export async function getMessagesForUser(
  userId: string,
  studentId?: string | null
): Promise<MessageWithUsers[]> {
  try {
    let query = supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
      .order('created_at', { ascending: false })

    // If studentId is provided, filter by student context
    if (studentId) {
      query = query.eq('student_id', studentId)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Error fetching messages', error, { userId, studentId })
      return []
    }

    if (!data || data.length === 0) {
      return []
    }

    // Get unique user IDs
    const userIds = new Set<string>()
    data.forEach((msg: Message) => {
      userIds.add(msg.sender_id)
      if (msg.recipient_id) userIds.add(msg.recipient_id)
      if (msg.student_id) userIds.add(msg.student_id)
    })

    // Fetch user details
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, full_name, email, role')
      .in('id', Array.from(userIds))

    if (usersError) {
      logger.error('Error fetching users for messages', usersError)
    }

    const userMap = new Map((users || []).map((u: any) => [u.id, u]))

    // Build threaded structure
    const messages = data.map((msg: Message) => ({
      ...msg,
      sender: userMap.get(msg.sender_id),
      recipient: msg.recipient_id ? userMap.get(msg.recipient_id) : undefined,
      student: msg.student_id ? userMap.get(msg.student_id) : undefined,
      replies: [] as MessageWithUsers[],
    })) as MessageWithUsers[]

    // Group by thread_id and build reply chains
    const threadMap = new Map<string, MessageWithUsers[]>()
    messages.forEach((msg) => {
      if (!threadMap.has(msg.thread_id)) {
        threadMap.set(msg.thread_id, [])
      }
      threadMap.get(msg.thread_id)!.push(msg)
    })

    // Build reply chains
    const result: MessageWithUsers[] = []
    threadMap.forEach((threadMessages) => {
      // Find root messages (no parent)
      const rootMessages = threadMessages.filter((m) => !m.parent_id)
      
      // Build reply trees
      const buildReplies = (parent: MessageWithUsers): void => {
        const replies = threadMessages.filter((m) => m.parent_id === parent.id)
        parent.replies = replies.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
        parent.replies.forEach(buildReplies)
      }

      rootMessages.forEach((root) => {
        buildReplies(root)
        result.push(root)
      })
    })

    // Sort by most recent activity in thread
    return result.sort((a, b) => {
      const getLatestTime = (msg: MessageWithUsers): number => {
        const replyTimes = msg.replies?.map(getLatestTime) || []
        return Math.max(
          new Date(msg.created_at).getTime(),
          ...replyTimes
        )
      }
      return getLatestTime(b) - getLatestTime(a)
    })
  } catch (error) {
    logger.error('Error in getMessagesForUser', error, { userId, studentId })
    return []
  }
}

export async function getMessageThread(
  threadId: string
): Promise<MessageWithUsers | null> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })

    if (error) {
      logger.error('Error fetching message thread', error, { threadId })
      return null
    }

    if (!data || data.length === 0) {
      return null
    }

    // Get unique user IDs
    const userIds = new Set<string>()
    data.forEach((msg: Message) => {
      userIds.add(msg.sender_id)
      if (msg.recipient_id) userIds.add(msg.recipient_id)
      if (msg.student_id) userIds.add(msg.student_id)
    })

    // Fetch user details
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, full_name, email, role')
      .in('id', Array.from(userIds))

    if (usersError) {
      logger.error('Error fetching users for thread', usersError)
    }

    const userMap = new Map((users || []).map((u: any) => [u.id, u]))

    // Build threaded structure
    const messages = data.map((msg: Message) => ({
      ...msg,
      sender: userMap.get(msg.sender_id),
      recipient: msg.recipient_id ? userMap.get(msg.recipient_id) : undefined,
      student: msg.student_id ? userMap.get(msg.student_id) : undefined,
      replies: [] as MessageWithUsers[],
    })) as MessageWithUsers[]

    // Find root message
    const rootMessage = messages.find((m) => !m.parent_id)
    if (!rootMessage) {
      return messages[0] // Fallback to first message
    }

    // Build reply tree
    const buildReplies = (parent: MessageWithUsers): void => {
      const replies = messages.filter((m) => m.parent_id === parent.id)
      parent.replies = replies.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
      parent.replies.forEach(buildReplies)
    }

    buildReplies(rootMessage)
    return rootMessage
  } catch (error) {
    logger.error('Error in getMessageThread', error, { threadId })
    return null
  }
}

export async function markMessageAsRead(messageId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId)

    if (error) {
      logger.error('Error marking message as read', error, { messageId })
      return false
    }

    return true
  } catch (error) {
    logger.error('Error in markMessageAsRead', error, { messageId })
    return false
  }
}

export async function markThreadAsRead(threadId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('thread_id', threadId)
      .neq('sender_id', userId) // Don't mark own messages as read

    if (error) {
      logger.error('Error marking thread as read', error, { threadId, userId })
      return false
    }

    return true
  } catch (error) {
    logger.error('Error in markThreadAsRead', error, { threadId, userId })
    return false
  }
}

export async function getUnreadMessageCount(userId: string, studentId?: string | null): Promise<number> {
  try {
    let query = supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('is_read', false)

    if (studentId) {
      query = query.eq('student_id', studentId)
    }

    const { count, error } = await query

    if (error) {
      logger.error('Error getting unread message count', error, { userId, studentId })
      return 0
    }

    return count || 0
  } catch (error) {
    logger.error('Error in getUnreadMessageCount', error, { userId, studentId })
    return 0
  }
}

// ============================================
// STUDENT DOCUMENTS QUERIES
// ============================================

export async function getStudentDocuments(
  userId: string,
  category?: 'personal_statement' | 'cv' | 'grades' | 'other'
): Promise<StudentDocument[]> {
  try {
    let query = supabase
      .from('student_documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Error fetching student documents', error, { userId, category })
      return []
    }

    return (data || []) as StudentDocument[]
  } catch (error) {
    logger.error('Error in getStudentDocuments', error, { userId, category })
    return []
  }
}

export async function createStudentDocument(
  userId: string,
  uploadedBy: string,
  document: {
    category: 'personal_statement' | 'cv' | 'grades' | 'other'
    title: string
    description?: string | null
    file_path: string
    file_name: string
    file_size: number
    mime_type: string
  }
): Promise<StudentDocument | null> {
  try {
    const { data, error } = await supabase
      .from('student_documents')
      .insert({
        user_id: userId,
        uploaded_by: uploadedBy,
        category: document.category,
        title: document.title,
        description: document.description || null,
        file_path: document.file_path,
        file_name: document.file_name,
        file_size: document.file_size,
        mime_type: document.mime_type,
        version: 1,
      })
      .select()
      .single()

    if (error) {
      logger.error('Error creating student document', error, { userId, document })
      return null
    }


    return data as StudentDocument
  } catch (error) {
    logger.error('Error in createStudentDocument', error, { userId, document })
    return null
  }
}

export async function updateStudentDocument(
  documentId: string,
  updates: {
    title?: string
    description?: string | null
  }
): Promise<StudentDocument | null> {
  try {
    const { data, error } = await supabase
      .from('student_documents')
      .update(updates)
      .eq('id', documentId)
      .select()
      .single()

    if (error) {
      logger.error('Error updating student document', error, { documentId })
      return null
    }


    return data as StudentDocument
  } catch (error) {
    logger.error('Error in updateStudentDocument', error, { documentId })
    return null
  }
}

export async function deleteStudentDocument(documentId: string): Promise<boolean> {
  try {
    // First get the document to delete the file
    const { data: document, error: fetchError } = await supabase
      .from('student_documents')
      .select('file_path')
      .eq('id', documentId)
      .single()

    if (fetchError || !document) {
      logger.error('Error fetching document for deletion', fetchError, { documentId })
      return false
    }

    // Delete from database
    const { error } = await supabase
      .from('student_documents')
      .delete()
      .eq('id', documentId)

    if (error) {
      logger.error('Error deleting student document', error, { documentId })
      return false
    }

    // Delete file from storage (non-blocking)
    const { error: storageError } = await supabase.storage
      .from('student-documents')
      .remove([document.file_path])

    if (storageError) {
      logger.error('Error deleting file from storage', storageError, { filePath: document.file_path })
      // Don't fail the whole operation if storage delete fails
    }


    return true
  } catch (error) {
    logger.error('Error in deleteStudentDocument', error, { documentId })
    return false
  }
}
