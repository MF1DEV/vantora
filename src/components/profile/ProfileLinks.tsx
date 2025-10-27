'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LinkButton } from './LinkButton'

export default function ProfileLinks({ username }: { username: string }) {
  const [links, setLinks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchLinks() {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .single()

        if (!profile) {
          setLinks([])
          return
        }

        const { data, error } = await supabase
          .from('links')
          .select('*')
          .eq('user_id', profile.id)
          .order('position')

        if (error) {
          console.error('Error fetching links:', error)
          setLinks([])
        } else {
          setLinks(data || [])
        }
      } catch (error) {
        console.error('Error in ProfileLinks:', error)
        setLinks([])
      } finally {
        setLoading(false)
      }
    }

    if (username) {
      fetchLinks()
    }
  }, [username])

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-slate-700 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  const trackClick = async (linkId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single()

      if (!profile) return

      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: profile.id,
          link_id: linkId,
          event_type: 'click',
        }),
      })
    } catch (error) {
      console.error('Error tracking click:', error)
    }
  }

  return (
    <div className="space-y-3">
      {links.map((link) => (
        <LinkButton
          key={link.id}
          title={link.title}
          url={link.url}
          icon={link.icon}
          onClick={() => trackClick(link.id)}
        />
      ))}
    </div>
  )
}