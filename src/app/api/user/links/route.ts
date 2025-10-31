import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import { linkSchema, validateRequest } from '@/lib/utils/validation'
import { z } from 'zod'

// Get user's links
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: links, error } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', user.id)
      .order('position')

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ links }, { status: 200 })
  } catch (error) {
    console.error('Links fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create or update user's links
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // If it's a single link, validate it
    if (body.title && body.url) {
      const validation = await validateRequest(linkSchema, body)
      
      if (!validation.success) {
        return NextResponse.json({ error: validation.error }, { status: 400 })
      }

      // Insert or update single link
      const linkData = {
        ...validation.data,
        user_id: user.id,
        position: body.position || 0,
      }

      const { error } = body.id
        ? await supabase.from('links').update(linkData).eq('id', body.id).eq('user_id', user.id)
        : await supabase.from('links').insert(linkData)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json(
        { message: 'Link saved successfully' },
        { status: 200 }
      )
    }
    
    // If it's bulk update (array of links)
    if (Array.isArray(body.links)) {
      const linksArray = body.links

      // Validate each link
      for (const link of linksArray) {
        const validation = await validateRequest(linkSchema, link)
        if (!validation.success) {
          return NextResponse.json(
            { error: `Invalid link: ${validation.error}` },
            { status: 400 }
          )
        }
      }

      // Update links in a transaction
      const { error } = await supabase.from('links').upsert(
        linksArray.map((link: any, index: number) => ({
          ...link,
          user_id: user.id,
          position: index
        }))
      )

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json(
        { message: 'Links updated successfully' },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Links update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete a link
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const linkId = searchParams.get('id')
    
    if (!linkId) {
      return NextResponse.json(
        { error: 'Link ID is required' },
        { status: 400 }
      )
    }

    // Validate UUID format
    const uuidSchema = z.string().uuid()
    const validation = uuidSchema.safeParse(linkId)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid link ID format' },
        { status: 400 }
      )
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { error } = await supabase
      .from('links')
      .delete()
      .match({ id: linkId, user_id: user.id })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Link deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Link deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
