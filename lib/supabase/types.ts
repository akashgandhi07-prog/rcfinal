// Database Types for Regent's Private Client Portal

export type UserRole = 'admin' | 'student' | 'parent'
export type TargetCourse = 'medicine' | 'dentistry' | 'veterinary'
export type OnboardingStatus = 'pending' | 'complete'

export interface User {
  id: string
  email: string
  role: UserRole
  full_name: string | null
  target_course: TargetCourse | null
  onboarding_status: OnboardingStatus
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
  onboarding_status?: OnboardingStatus
  consultant_assigned?: string | null
  contract_status?: string | null
  client_id?: string | null
}

export interface ParentStudentLink {
  id: string
  parent_id: string
  student_id: string
  created_at: string
}

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
