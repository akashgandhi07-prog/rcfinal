// Activity logging utility for tracking user actions
// All logs are stored in Supabase activity_log table

import { supabase } from "@/lib/supabase/client"

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

interface ActivityMetadata {
  [key: string]: unknown
  ip_address?: string
  user_agent?: string
  changes?: Record<string, { old: unknown; new: unknown }>
  details?: string
}

/**
 * Log a user activity to the database
 */
export async function logActivity(
  actionType: ActionType,
  resourceType: ResourceType,
  options?: {
    resourceId?: string
    description?: string
    metadata?: ActivityMetadata
  }
): Promise<void> {
  try {
    // Get client info if available
    const metadata: ActivityMetadata = {
      ...options?.metadata,
    }

    if (typeof window !== 'undefined') {
      // Add browser info if available
      if (!metadata.user_agent) {
        metadata.user_agent = navigator.userAgent
      }
    }

    // Call Supabase function to log activity
    const { error } = await supabase.rpc('log_activity', {
      p_action_type: actionType,
      p_resource_type: resourceType,
      p_resource_id: options?.resourceId || null,
      p_description: options?.description || null,
      p_metadata: metadata || null,
    })

    if (error) {
      console.error('Failed to log activity:', error)
      // Don't throw - logging failures shouldn't break the app
    }
  } catch (error) {
    console.error('Error logging activity:', error)
    // Silently fail - logging is non-critical
  }
}

/**
 * Log a login event
 */
export async function logLogin(userEmail: string): Promise<void> {
  await logActivity('login', 'user', {
    description: `User logged in: ${userEmail}`,
    metadata: {
      user_email: userEmail,
    },
  })
}

/**
 * Log a logout event
 */
export async function logLogout(userEmail: string): Promise<void> {
  await logActivity('logout', 'user', {
    description: `User logged out: ${userEmail}`,
    metadata: {
      user_email: userEmail,
    },
  })
}

/**
 * Log a data creation event
 */
export async function logCreate(
  resourceType: ResourceType,
  resourceId: string,
  description?: string
): Promise<void> {
  await logActivity('create', resourceType, {
    resourceId,
    description: description || `Created ${resourceType}: ${resourceId}`,
  })
}

/**
 * Log a data update event
 */
export async function logUpdate(
  resourceType: ResourceType,
  resourceId: string,
  changes: Record<string, { old: unknown; new: unknown }>,
  description?: string
): Promise<void> {
  await logActivity('update', resourceType, {
    resourceId,
    description: description || `Updated ${resourceType}: ${resourceId}`,
    metadata: {
      changes,
    },
  })
}

/**
 * Log a data deletion event
 */
export async function logDelete(
  resourceType: ResourceType,
  resourceId: string,
  description?: string
): Promise<void> {
  await logActivity('delete', resourceType, {
    resourceId,
    description: description || `Deleted ${resourceType}: ${resourceId}`,
  })
}

/**
 * Log a view event (for tracking what users are viewing)
 */
export async function logView(
  resourceType: ResourceType,
  resourceId?: string,
  description?: string
): Promise<void> {
  await logActivity('view', resourceType, {
    resourceId,
    description: description || `Viewed ${resourceType}${resourceId ? `: ${resourceId}` : ''}`,
  })
}

/**
 * Log a login attempt (successful or failed) to login_attempts table
 */
export async function logLoginAttempt(
  email: string,
  success: boolean,
  ipAddress?: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('login_attempts')
      .insert({
        email,
        success,
        ip_address: ipAddress || null,
      })

    if (error) {
      console.error('Failed to log login attempt:', error)
      // Don't throw - logging failures shouldn't break the app
    }
  } catch (error) {
    console.error('Error logging login attempt:', error)
    // Silently fail - logging is non-critical
  }
}

