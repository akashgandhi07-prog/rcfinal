// Database Types for Regent's Private Client Portal

export type UserRole = 'admin' | 'student' | 'parent' | 'mentor'
export type TargetCourse = 'medicine' | 'dentistry' | 'veterinary'
export type OnboardingStatus = 'pending' | 'complete'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'
export type FeeStatus = 'home' | 'international' | 'unsure'

export interface User {
  id: string
  email: string
  role: UserRole
  full_name: string | null
  target_course: TargetCourse | null
  entry_year: number | null
  country: string | null
  fee_status: FeeStatus | null
  onboarding_status: OnboardingStatus
  approval_status: ApprovalStatus
  date_of_birth: string | null
  home_address: string | null
  contact_number: string | null
  parent_name: string | null
  parent_phone: string | null
  parent_email: string | null
  parent2_name: string | null
  parent2_phone: string | null
  parent2_email: string | null
  school_name: string | null
  gcse_summary: string | null
  a_level_predictions: string | null
  consultant_assigned: string | null
  contract_status: string | null
  client_id: string | null
  created_at: string
  updated_at: string
}

// Type-safe update interface
export interface UserUpdate {
  role?: UserRole
  full_name?: string | null
  date_of_birth?: string | null
  home_address?: string | null
  contact_number?: string | null
  parent_name?: string | null
  parent_phone?: string | null
  parent_email?: string | null
  parent2_name?: string | null
  parent2_phone?: string | null
  parent2_email?: string | null
  school_name?: string | null
  gcse_summary?: string | null
  a_level_predictions?: string | null
  target_course?: TargetCourse | null
  entry_year?: number | null
  country?: string | null
  fee_status?: FeeStatus | null
  onboarding_status?: OnboardingStatus
  consultant_assigned?: string | null
  contract_status?: string | null
  client_id?: string | null
  approval_status?: ApprovalStatus
}

export interface ParentStudentLink {
  id: string
  parent_id: string
  student_id: string
  created_at: string
}

export interface MentorStudentLink {
  id: string
  mentor_id: string
  student_id: string
  created_at: string
}

export interface MentorComment {
  id: string
  mentor_id: string
  student_id: string
  section: string // 'dashboard', 'profile', 'portfolio', 'ucat', 'strategy', 'interview', 'work_experience', 'volunteering', 'supracurricular'
  section_item_id: string | null
  comment_text: string
  comment_type: 'feedback' | 'plan' | 'suggestion'
  created_at: string
  updated_at: string
}

export type CommentType = 'feedback' | 'plan' | 'suggestion'
export type CommentSection = 'dashboard' | 'profile' | 'portfolio' | 'ucat' | 'strategy' | 'interview' | 'work_experience' | 'volunteering' | 'supracurricular' | 'documents'

export interface FeatureToggle {
  id: string
  user_id: string
  feature_name: string
  enabled: boolean
  created_at: string
  updated_at: string
}

export interface UCATMock {
  id: string
  user_id: string
  date: string
  mock_name: string
  vr_score: number | null
  dm_score: number | null
  qr_score: number | null
  ar_score: number | null
  total_score: number | null
  sjt_band: string | null
  created_at: string
  updated_at: string
}

export interface PortfolioActivity {
  id: string
  user_id: string
  category: 'work' | 'volunteering' | 'reading' | 'extracurricular'
  organization: string
  role: string
  start_date: string
  end_date: string | null
  notes: string | null
  verified: boolean
  created_at: string
  updated_at: string
}

export interface UniversityStrategy {
  id: string
  user_id: string
  university_id: string
  university_name: string
  course_code: string
  entrance_req: string | null
  status: 'shortlist' | 'applied'
  created_at: string
  updated_at: string
}

// Feature names enum
export enum FeatureName {
  INTERVIEW_PREP = 'interview_prep',
  UCAT_TRACKER = 'ucat_tracker',
  PORTFOLIO_BUILDER = 'portfolio_builder',
  UNIVERSITY_STRATEGY = 'university_strategy',
}

// Activity Log
export interface ActivityLog {
  id: string
  user_id: string | null
  user_email: string | null
  action_type: string
  resource_type: string
  resource_id: string | null
  description: string | null
  metadata: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface LoginAttempt {
  id: string
  email: string
  ip_address: string | null
  success: boolean
  created_at: string
}

export interface StudentDocument {
  id: string
  user_id: string
  uploaded_by: string
  category: 'personal_statement' | 'cv' | 'grades' | 'other'
  title: string
  description: string | null
  file_path: string
  file_name: string
  file_size: number
  mime_type: string
  version: number
  created_at: string
  updated_at: string
}

// Resource Library Types
export type ResourceType = 'knowledge_base' | 'video_library' | 'template_library' | 'university_guides'

export interface Resource {
  id: string
  title: string
  description: string | null
  resource_type: ResourceType
  file_url: string | null
  file_name: string | null
  file_size: number | null
  file_type: string | null
  external_url: string | null
  thumbnail_url: string | null
  visible_to_medicine: boolean
  visible_to_dentistry: boolean
  visible_to_veterinary: boolean
  tags: string[] | null
  searchable_content: string | null
  university_name: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  is_active: boolean
}

export interface ResourceCreate {
  title: string
  description?: string | null
  resource_type: ResourceType
  file_url?: string | null
  file_name?: string | null
  file_size?: number | null
  file_type?: string | null
  external_url?: string | null
  thumbnail_url?: string | null
  visible_to_medicine?: boolean
  visible_to_dentistry?: boolean
  visible_to_veterinary?: boolean
  tags?: string[] | null
  searchable_content?: string | null
  university_name?: string | null
}

export interface ResourceUpdate {
  title?: string
  description?: string | null
  resource_type?: ResourceType
  file_url?: string | null
  file_name?: string | null
  file_size?: number | null
  file_type?: string | null
  external_url?: string | null
  thumbnail_url?: string | null
  visible_to_medicine?: boolean
  visible_to_dentistry?: boolean
  visible_to_veterinary?: boolean
  tags?: string[] | null
  searchable_content?: string | null
  university_name?: string | null
  is_active?: boolean
}

// Message types for direct messaging
export interface Message {
  id: string
  thread_id: string
  parent_id: string | null
  sender_id: string
  recipient_id: string | null
  student_id: string | null
  subject: string | null
  message_text: string
  is_read: boolean
  created_at: string
  updated_at: string
}

// Extended message with sender/recipient user info
export interface MessageWithUsers extends Message {
  sender?: User
  recipient?: User
  student?: User
  replies?: MessageWithUsers[]
}

// Recent change interface for admin dashboard
export interface RecentChange {
  id: string
  type: 'signup' | 'comment' | 'ucat' | 'portfolio' | 'profile' | 'approval' | 'status_change'
  userId: string
  userEmail: string
  userName: string | null
  resourceId?: string
  description: string
  timestamp: string
  metadata?: Record<string, unknown>
}
