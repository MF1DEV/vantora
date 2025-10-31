'use client'

import { useEffect } from 'react'
import { applyCustomTheme, loadGoogleFont } from '@/lib/utils/customTheme'

interface CustomThemeProviderProps {
  profile: any
  children: React.ReactNode
}

export default function CustomThemeProvider({ profile, children }: CustomThemeProviderProps) {
  useEffect(() => {
    try {
      // Load custom fonts
      if (profile?.font_heading) {
        loadGoogleFont(profile.font_heading)
      }
      if (profile?.font_body && profile.font_body !== profile.font_heading) {
        loadGoogleFont(profile.font_body)
      }
    } catch (error) {
      console.error('Error loading custom fonts:', error)
    }
  }, [profile])

  let customStyles = {}
  try {
    customStyles = applyCustomTheme(profile)
  } catch (error) {
    console.error('Error applying custom theme:', error)
    // Use default styles
  }

  return (
    <div style={customStyles} className="min-h-screen">
      {children}
    </div>
  )
}
