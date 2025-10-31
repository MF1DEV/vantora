'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LinkButton } from './LinkButton'
import PasswordPrompt from './PasswordPrompt'

export default function ProfileLinks({ username, buttonStyle, accentColor, customButtonColor, layout = 'classic' }: { 
  username: string
  buttonStyle?: string
  accentColor?: string
  customButtonColor?: string
  layout?: string
}) {
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
          // Filter visible links based on scheduling
          const visibleLinks = data?.filter(link => {
            // If no scheduling, show the link
            if (!link.scheduled_start && !link.scheduled_end && !link.recurring_schedule) {
              return true
            }

            // Check if link is currently scheduled to be visible
            const now = new Date()
            const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' })
            const currentTime = now.toTimeString().slice(0, 5) // HH:MM

            // Check date range
            if (link.scheduled_start && new Date(link.scheduled_start) > now) return false
            if (link.scheduled_end && new Date(link.scheduled_end) < now) return false

            // Check time range
            if (link.time_start && currentTime < link.time_start) return false
            if (link.time_end && currentTime > link.time_end) return false

            // Check recurring schedule
            if (link.recurring_schedule && Array.isArray(link.recurring_schedule)) {
              if (!link.recurring_schedule.includes(currentDay)) return false
            }

            return true
          }) || []

          setLinks(visibleLinks)
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

  // Separate social and regular links
  const socialLinks = links.filter(link => link.link_type === 'social')
  const regularLinks = links.filter(link => link.link_type !== 'social')

  return (
    <>
      {/* Social Media Icons - Icon-only buttons */}
      {socialLinks.length > 0 && (
        <div className="flex justify-center gap-3 mb-6">
          {socialLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => handleLinkClick(link)}
              className="w-12 h-12 rounded-full bg-slate-800/50 border-2 border-slate-700 hover:border-slate-600 hover:scale-110 transition-all flex items-center justify-center group"
              title={link.title}
            >
              <LinkButton
                title=""
                url={link.url}
                icon={link.icon}
                onClick={() => {}}
                isProtected={link.is_protected}
                linkType={link.link_type}
                socialPlatform={link.social_platform}
                iconOnly={true}
              />
            </button>
          ))}
        </div>
      )}

      {/* Regular Links - Full buttons */}
      <div className={
        layout === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' :
        layout === 'masonry' ? 'columns-1 sm:columns-2 gap-3 space-y-3' :
        layout === 'card' ? 'space-y-4' :
        'space-y-3' // classic default
      }>
        {regularLinks.map((link, index) => (
          <div
            key={link.id}
            className={`animate-fade-in-up opacity-0 ${layout === 'masonry' ? 'break-inside-avoid' : ''}`}
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
              thumbnail={link.thumbnail_url}
              badge={link.badge}
              badgeColor={link.badge_color}
              buttonStyle={link.button_style || buttonStyle}
              accentColor={link.custom_color || accentColor}
              customButtonColor={customButtonColor}
              borderRadius={link.border_radius}
              animation={link.animation}
              linkType={link.link_type}
              socialPlatform={link.social_platform}
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