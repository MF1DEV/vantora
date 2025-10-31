// Apply custom theme styles to profile
export function applyCustomTheme(profile: any) {
  if (!profile) return {}

  const customColors = profile.custom_colors || {}
  const backgroundType = profile.background_type || 'gradient'
  const backgroundColor = profile.background_color || '#0f172a'
  const backgroundGradient = profile.background_gradient || {
    type: 'linear',
    angle: 135,
    colors: ['#0f172a', '#1e293b'],
  }

  let backgroundStyle = {}

  switch (backgroundType) {
    case 'solid':
      backgroundStyle = { backgroundColor }
      break
    case 'gradient':
      backgroundStyle = {
        background: `linear-gradient(${backgroundGradient.angle}deg, ${backgroundGradient.colors.join(', ')})`,
      }
      break
    case 'image':
      if (profile.background_image_url) {
        backgroundStyle = {
          backgroundImage: `url(${profile.background_image_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      }
      break
    case 'video':
      // Video backgrounds handled separately in component
      break
  }

  return {
    ...backgroundStyle,
    '--color-accent': customColors.accent || '#3b82f6',
    '--color-button': customColors.button || '#3b82f6',
    '--color-button-text': customColors.buttonText || '#ffffff',
    '--color-text': customColors.text || '#ffffff',
    '--color-text-secondary': customColors.textSecondary || '#94a3b8',
    '--font-heading': profile.font_heading || 'Inter',
    '--font-body': profile.font_body || 'Inter',
  } as React.CSSProperties
}

// Get button style classes based on button_style setting
export function getButtonStyleClass(buttonStyle: string): string {
  const styles: Record<string, string> = {
    rounded: 'rounded-lg',
    pill: 'rounded-full',
    square: 'rounded-none',
    soft: 'rounded-2xl',
    outlined: 'rounded-lg border-2 bg-transparent',
    gradient: 'rounded-lg bg-gradient-to-r from-blue-500 to-purple-600',
    neon: 'rounded-lg shadow-lg shadow-blue-500/50',
    glass: 'rounded-lg backdrop-blur-sm bg-white/10',
    minimal: 'rounded-md',
  }

  return styles[buttonStyle] || 'rounded-lg'
}

// Load Google Fonts dynamically
export function loadGoogleFont(fontName: string) {
  if (typeof document === 'undefined') return

  const linkId = `font-${fontName.replace(/\s/g, '-')}`
  
  // Check if already loaded
  if (document.getElementById(linkId)) return

  const link = document.createElement('link')
  link.id = linkId
  link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(' ', '+')}:wght@400;600;700&display=swap`
  link.rel = 'stylesheet'
  document.head.appendChild(link)
}
