'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LinkButton } from './LinkButton'
import PasswordPrompt from './PasswordPrompt'

export default function ProfileLinks({ username }: { username: string }) {
  const [links, setLinks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [passwordPrompt, setPasswordPrompt] = useState<{
    isOpen: boolean
    linkId: string
    linkTitle: string
    linkUrl: string
  }>({ isOpen: false, linkId: '', linkTitle: '', linkUrl: '' })
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

  const handleLinkClick = (link: any) => {
    if (link.is_protected) {
      setPasswordPrompt({
        isOpen: true,
        linkId: link.id,
        linkTitle: link.title,
        linkUrl: link.url,
      })
    } else {
      trackClick(link.id)
      window.open(link.url, '_blank')
    }
  }

  const handlePasswordSubmit = async (password: string) => {
    try {
      const response = await fetch('/api/links/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          link_id: passwordPrompt.linkId,
          password,
        }),
      })

      const data = await response.json()

      if (response.ok && data.verified) {
        trackClick(passwordPrompt.linkId)
        window.open(passwordPrompt.linkUrl, '_blank')
        setPasswordPrompt({ isOpen: false, linkId: '', linkTitle: '', linkUrl: '' })
        return true
      }
      
      return false
    } catch (error) {
      console.error('Password verification error:', error)
      return false
    }
  }

  return (
    <>
      <div className="space-y-3">
        {links.map((link, index) => (
          <div
            key={link.id}
            className="animate-fade-in-up opacity-0"
            style={{
              animationDelay: `${index * 0.1}s`,
              animationFillMode: 'forwards'
            }}
          >
            <LinkButton
              title={link.title}
              url={link.url}
              icon={link.icon}
              onClick={() => handleLinkClick(link)}
              isProtected={link.is_protected}
            />
          </div>
        ))}
      </div>

      <PasswordPrompt
        isOpen={passwordPrompt.isOpen}
        linkTitle={passwordPrompt.linkTitle}
        onClose={() => setPasswordPrompt({ isOpen: false, linkId: '', linkTitle: '', linkUrl: '' })}
        onSubmit={handlePasswordSubmit}
      />
    </>
  )
}