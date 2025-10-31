import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { link_id, password } = await request.json()

    if (!link_id || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get link with password hash
    const { data: link, error } = await supabase
      .from('links')
      .select('id, is_protected, password_hash')
      .eq('id', link_id)
      .single()

    if (error || !link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    if (!link.is_protected || !link.password_hash) {
      return NextResponse.json({ error: 'Link is not password protected' }, { status: 400 })
    }

    // Verify password
    const isValid = await bcrypt.compare(password, link.password_hash)

    if (!isValid) {
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
    }

    return NextResponse.json({ success: true, verified: true })
  } catch (error) {
    console.error('Password verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify password' },
      { status: 500 }
    )
  }
}
