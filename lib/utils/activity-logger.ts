// Activity logging utility - simplified to no-ops
// Activity logging has been removed to avoid RLS recursion issues and simplify the codebase

export type ActionType = 
  | 'login' 
  | 'logout' 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'view' 
  | 'export'
  | 'approve'
  | 'reject'
  | 'link'
  | 'unlink'
  | 'email'
  | 'impersonate'
  | 'bulk_operation'

export type ResourceType = 
  | 'user' 
  | 'ucat_mock' 
  | 'portfolio_activity' 
  | 'university_strategy' 
  | 'mentor_comment'
  | 'parent_student_link'
  | 'mentor_student_link'
  | 'profile'
  | 'dashboard'
  | 'email'
  | 'notification'
  | 'resource'
  | 'message'

// All logging functions are now no-ops to avoid RLS issues and simplify the codebase
export async function logActivity(): Promise<void> {
  // No-op - activity logging removed
}

export async function logLogin(): Promise<void> {
  // No-op
}

export async function logLogout(): Promise<void> {
  // No-op
}

export async function logCreate(): Promise<void> {
  // No-op
}

export async function logUpdate(): Promise<void> {
  // No-op
}

export async function logDelete(): Promise<void> {
  // No-op
}

export async function logView(): Promise<void> {
  // No-op
}

export async function logLoginAttempt(): Promise<void> {
  // No-op
}

export async function logEmailSent(): Promise<void> {
  // No-op
}

export async function logImpersonation(): Promise<void> {
  // No-op
}

export async function logBulkOperation(): Promise<void> {
  // No-op
}
