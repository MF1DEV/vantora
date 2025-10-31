'use client'

import { useEffect } from 'react'

interface AnalyticsTrackerProps {
  userId: string
  eventType: 'view' | 'click'
  linkId?: string
}

export default function AnalyticsTracker({ userId, eventType, linkId }: AnalyticsTrackerProps) {
  useEffect(() => {
    // Track the event when component mounts
    const trackEvent = async () => {
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            link_id: linkId || null,
            event_type: eventType,
          }),
        })
      } catch (error) {
        console.error('Failed to track analytics:', error)
      }
    }

    trackEvent()
  }, [userId, eventType, linkId])

  return null // This component doesn't render anything
}
