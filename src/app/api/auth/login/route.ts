import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import { loginSchema, validateRequest } from '@/lib/utils/validation'

export async function POST(request: NextRequest) {
  try {
    const requestUrl = new URL(request.url)
    const supabase = await createClient()

    // Parse and validate request body
    const body = await request.json()
    const validation = await validateRequest(loginSchema, body)

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { email, password } = validation.data

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({
      message: 'Logged in successfully',
    }, {
      status: 200,
      headers: {
        'Location': requestUrl.origin
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
