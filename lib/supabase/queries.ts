import { supabase } from './client'
import type { User, UCATMock, FeatureToggle, ParentStudentLink, PortfolioActivity, UniversityStrategy, UserUpdate } from './types'
import { FeatureName } from './types'
import { logger } from '@/lib/utils/logger'

// ============================================
// USER QUERIES
// ============================================

export async function getCurrentUser(): Promise<User | null> {
  try {
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return null
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()

  if (error) {
    logger.error('Error fetching user', error, { userId: authUser.id })
    return null
  }

  return data as User
  } catch (error) {
    logger.error('Error in getCurrentUser', error)
    return null
  }
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
// FEATURE TOGGLE QUERIES
// ============================================

export async function getFeatureToggles(
  userId: string
): Promise<FeatureToggle[]> {
  try {
    const { data, error } = await supabase
      .from('feature_toggles')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      logger.error('Error fetching feature toggles', error, { userId })
      return []
    }

    return (data || []) as FeatureToggle[]
  } catch (error) {
    logger.error('Error in getFeatureToggles', error, { userId })
    return []
  }
}

export async function isFeatureEnabled(
  userId: string,
  featureName: FeatureName
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('feature_toggles')
      .select('enabled')
      .eq('user_id', userId)
      .eq('feature_name', featureName)
      .single()

    if (error || !data) {
      // Default to enabled if toggle doesn't exist
      return true
    }

    return data.enabled
  } catch (error) {
    logger.error('Error in isFeatureEnabled', error, { userId, featureName })
    return true
  }
}

export async function setFeatureToggle(
  userId: string,
  featureName: FeatureName,
  enabled: boolean
): Promise<FeatureToggle | null> {
  try {
    const { data, error } = await supabase
      .from('feature_toggles')
      .upsert(
        {
          user_id: userId,
          feature_name: featureName,
          enabled,
        },
        {
          onConflict: 'user_id,feature_name',
        }
      )
      .select()
      .single()

    if (error) {
      logger.error('Error setting feature toggle', error, { userId, featureName, enabled })
      return null
    }

    return data as FeatureToggle
  } catch (error) {
    logger.error('Error in setFeatureToggle', error, { userId, featureName, enabled })
    return null
  }
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
