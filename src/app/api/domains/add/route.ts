import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { domain } = await request.json()

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate domain format
    const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i
    if (!domainRegex.test(domain)) {
      return NextResponse.json({ error: 'Invalid domain format' }, { status: 400 })
    }

    // Check if domain already exists
    const { data: existing } = await supabase
      .from('custom_domains')
      .select('id')
      .eq('domain', domain)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Domain already in use' }, { status: 400 })
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')

    // Insert domain
    const { data: newDomain, error: insertError } = await supabase
      .from('custom_domains')
      .insert({
        user_id: user.id,
        domain,
        verification_token: verificationToken,
      })
      .select()
      .single()

    if (insertError) throw insertError

    return NextResponse.json({ domain: newDomain })
  } catch (error) {
    console.error('Add domain error:', error)
    return NextResponse.json(
      { error: 'Failed to add domain' },
      { status: 500 }
    )
  }
}
