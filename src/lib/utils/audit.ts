import { createClient } from '@/lib/supabase/server'

export type AuditEventType =
  | 'login'
  | 'logout'
  | 'register'
  | 'password_change'
  | 'profile_update'
  | 'link_create'
  | 'link_update'
  | 'link_delete'
  | 'account_delete'
  | 'failed_login'
  | 'suspicious_activity'
  | '2fa_enabled'
  | '2fa_disabled'
  | 'data_export'

interface AuditLogData {
  userId?: string
  eventType: AuditEventType
  eventData?: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

/**
 * Log a security audit event
 */
export async function logAuditEvent({
  userId,
  eventType,
  eventData = {},
  ipAddress,
  userAgent,
}: AuditLogData): Promise<void> {
  try {
    // Use service role client to bypass RLS for logging
    const supabaseServiceRole = await createClient()

    const { error } = await supabaseServiceRole.from('audit_logs').insert({
      user_id: userId || null,
      event_type: eventType,
      event_data: eventData,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
    })

    if (error) {
      console.error('Failed to log audit event:', error)
    }
  } catch (error) {
    console.error('Error logging audit event:', error)
  }
}

/**
 * Get client IP address from request headers
 */
export function getClientIp(request: Request): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  return realIp || undefined
}

/**
 * Get user agent from request headers
 */
export function getUserAgent(request: Request): string | undefined {
  return request.headers.get('user-agent') || undefined
}
