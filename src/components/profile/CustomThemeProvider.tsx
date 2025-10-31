'use client'

import { useEffect } from 'react'
import { applyCustomTheme, loadGoogleFont } from '@/lib/utils/customTheme'

interface CustomThemeProviderProps {
  profile: any
  children: React.ReactNode
}

export default function CustomThemeProvider({ profile, children }: CustomThemeProviderProps) {
  useEffect(() => {
    // Load custom fonts
    if (profile.font_heading) {
      loadGoogleFont(profile.font_heading)
    }
    if (profile.font_body && profile.font_body !== profile.font_heading) {
      loadGoogleFont(profile.font_body)
    }
  }, [profile])

  const customStyles = applyCustomTheme(profile)

  return (
    <div style={customStyles} className="min-h-screen">
      {children}
    </div>
  )
}
