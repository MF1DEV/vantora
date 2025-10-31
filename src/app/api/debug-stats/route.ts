import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ 
        error: 'SUPABASE_SERVICE_ROLE_KEY not set in environment variables',
        hint: 'Add this in Vercel: Settings → Environment Variables'
      }, { status: 500 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get actual profile data (just usernames, no sensitive info)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('username, created_at')
      .order('created_at', { ascending: false })

    // Get links data
    const { data: links, error: linksError } = await supabase
      .from('links')
      .select('id, title, user_id, is_active, click_count, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      success: true,
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      },
      data: {
        profiles: {
          count: profiles?.length || 0,
          data: profiles || [],
          error: profilesError
        },
        links: {
          count: links?.length || 0,
          data: links || [],
          error: linksError
        }
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
