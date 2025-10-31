import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import { logAuditEvent, getClientIp, getUserAgent } from '@/lib/utils/audit'

export async function DELETE(request: NextRequest) {
  try {
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
    const body = await request.json()
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

    // Delete user data in order (cascading deletes)
    // 1. Delete analytics data
    const { error: analyticsError } = await supabase
      .from('analytics')
      .delete()
      .eq('user_id', user.id)

    if (analyticsError) {
      console.error('Error deleting analytics:', analyticsError)
    }

    // 2. Delete links
    const { error: linksError } = await supabase
      .from('links')
      .delete()
      .eq('user_id', user.id)

    if (linksError) {
      console.error('Error deleting links:', linksError)
    }

    // 3. Delete profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id)

    if (profileError) {
      console.error('Error deleting profile:', profileError)
    }

    // Log account deletion before deleting the user
    await logAuditEvent({
      userId: user.id,
      eventType: 'account_delete',
      eventData: { email: user.email },
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
    })

    // 4. Delete auth user (this is the final step)
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(
      user.id
    )

    if (deleteUserError) {
      console.error('Error deleting user account:', deleteUserError)
      return NextResponse.json(
        { error: 'Failed to delete account. Please contact support.' },
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
