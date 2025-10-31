'use client'

import { ExternalLink, Lock } from 'lucide-react'
import { getButtonStyleClass, getAccentColorClasses } from '@/lib/utils/theme'
import { SocialIcon, SocialPlatform } from '@/components/dashboard/SocialMediaIcons'
import { ButtonStyle, BorderRadius, Animation } from '@/types/link'

interface LinkButtonProps {
  title: string
  url: string
  icon?: string
  onClick?: () => void
  isProtected?: boolean
  thumbnail?: string
  badge?: string
  badgeColor?: string
  buttonStyle?: string | ButtonStyle
  accentColor?: string
  customButtonColor?: string
  borderRadius?: BorderRadius
  animation?: Animation
  linkType?: string
  socialPlatform?: string | null
  iconOnly?: boolean
}

export function LinkButton({ 
  title, 
  url, 
  icon, 
  onClick, 
  isProtected,
  thumbnail,
  badge,
  badgeColor,
  buttonStyle = 'solid',
  accentColor = 'blue',
  customButtonColor,
  borderRadius = 'rounded',
  animation = 'none',
  linkType,
  socialPlatform,
  iconOnly = false
}: LinkButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (isProtected) {
      e.preventDefault()
    }
    onClick?.()
  }

  // Determine icon to display
  const displayIcon = linkType === 'social' && socialPlatform ? (
    <SocialIcon platform={socialPlatform as SocialPlatform} className="w-6 h-6" />
  ) : icon ? (
    <span className="text-xl md:text-2xl flex-shrink-0">{icon}</span>
  ) : null

  // If icon-only mode (for social media section)
  if (iconOnly) {
    return <>{displayIcon}</>
  }

  // Get border radius classes
  const radiusClasses = {
    'none': 'rounded-none',
    'sm': 'rounded-sm',
    'rounded': 'rounded-lg',
    'lg': 'rounded-xl',
    'full': 'rounded-full',
  }

  // Get button style classes
  const getButtonClasses = () => {
    const baseColor = customButtonColor || accentColor
    const radius = radiusClasses[borderRadius as BorderRadius] || radiusClasses.rounded
    
    switch (buttonStyle as ButtonStyle) {
      case 'outline':
        return `border-2 ${customButtonColor ? '' : 'border-current'} bg-transparent hover:bg-white/5 ${radius}`
      case 'soft-shadow':
        return `shadow-lg hover:shadow-xl ${customButtonColor ? 'shadow-current/20' : 'shadow-blue-500/20'} bg-white/5 hover:bg-white/10 border border-white/10 ${radius}`
      case 'neon-glow':
        return `shadow-lg shadow-current/50 hover:shadow-current/70 bg-white/5 hover:bg-white/10 border-2 border-current ${radius}`
      case 'solid':
      default:
        return `bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 ${radius}`
    }
  }

  // Get animation classes
  const animationClasses = {
    'none': '',
    'pulse': 'hover:animate-pulse',
    'bounce': 'hover:animate-bounce',
    'glow': 'hover:animate-pulse hover:shadow-lg hover:shadow-current/50',
  }

  // Get theme classes
  const roundingClass = getButtonStyleClass(buttonStyle as string)
  const accentClasses = getAccentColorClasses(accentColor)
  
  // Use custom button color if provided
  const colorStyle = customButtonColor 
    ? { color: customButtonColor, borderColor: customButtonColor }
    : undefined

  const buttonClasses = getButtonClasses()
  const animClass = animationClasses[animation as Animation] || ''

  // If has thumbnail, use card style
  if (thumbnail) {
    return (
      <a
        href={isProtected ? '#' : url}
        target={isProtected ? undefined : "_blank"}
        rel={isProtected ? undefined : "noopener noreferrer"}
        onClick={handleClick}
        className={`group w-full overflow-hidden ${buttonClasses} ${animClass} transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] touch-manipulation`}
        style={colorStyle}
      >
        {/* Thumbnail */}
        <div className="relative h-40 overflow-hidden">
          <img 
            src={thumbnail} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          {badge && (
            <span
              className="absolute top-3 right-3 px-2 py-1 rounded-md text-xs font-bold text-white shadow-lg"
              style={{ backgroundColor: badgeColor || '#ef4444' }}
            >
              {badge}
            </span>
          )}
          {isProtected && (
            <div className="absolute top-3 left-3 p-2 bg-black/50 backdrop-blur-sm rounded-lg">
              <Lock size={16} className="text-white" />
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {displayIcon}
            <span className="font-medium text-white truncate">{title}</span>
          </div>
          <ExternalLink size={18} className="text-slate-400 group-hover:text-white transition-colors flex-shrink-0 ml-2" />
        </div>
      </a>
    )
  }

  // Default button style with customization
  return (
    <a
      href={isProtected ? '#' : url}
      target={isProtected ? undefined : "_blank"}
      rel={isProtected ? undefined : "noopener noreferrer"}
      onClick={handleClick}
      className={`group w-full px-5 py-4 md:px-6 flex items-center justify-between ${buttonClasses} ${animClass} transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] touch-manipulation relative`}
      style={colorStyle}
    >
      {badge && (
        <span
          className="absolute -top-2 -right-2 px-2 py-1 rounded-md text-xs font-bold text-white shadow-lg"
          style={{ backgroundColor: badgeColor || '#ef4444' }}
        >
          {badge}
        </span>
      )}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {displayIcon}
        <span className="font-medium text-white truncate">{title}</span>
        {isProtected && (
          <Lock size={16} className="text-blue-400 flex-shrink-0" />
        )}
      </div>
      <ExternalLink size={18} className="text-slate-400 group-hover:text-white transition-colors flex-shrink-0 ml-2" />
    </a>
  )
}