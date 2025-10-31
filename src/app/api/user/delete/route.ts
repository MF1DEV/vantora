import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import { logAuditEvent, getClientIp, getUserAgent } from '@/lib/utils/audit'
import { requireCsrfToken } from '@/lib/utils/csrf'

export async function DELETE(request: NextRequest) {
  try {
    // Validate CSRF token
    try {
      await requireCsrfToken(request)
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      )
    }

    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify password for account deletion (extra security)
    let body;
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }
    
    const { password } = body

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required to delete your account' },
        { status: 400 }
      )
    }

    // Verify the password by attempting to sign in
    const { error: passwordError } = await supabase.auth.signInWithPassword({
      email: user.email || '',
      password,
    })

    if (passwordError) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 401 }
      )
    }

    // Log account deletion before deleting the user
    await logAuditEvent({
      userId: user.id,
      eventType: 'account_delete',
      eventData: { email: user.email },
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
    })

    // Use service role client to call the delete function
    const serviceRoleClient = createServiceRoleClient()
    
    // Call the database function to delete user and all data
    const { error: deleteError } = await serviceRoleClient.rpc('delete_user_account', {
      user_id: user.id
    })

    if (deleteError) {
      console.error('Error deleting user account:', deleteError)
      return NextResponse.json(
        { error: `Failed to delete account: ${deleteError.message}` },
        { status: 500 }
      )
    }

    // Sign out the user
    await supabase.auth.signOut()

    return NextResponse.json(
      { message: 'Account deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
