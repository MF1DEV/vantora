'use client'

import { ExternalLink, Lock } from 'lucide-react'
import { getButtonStyleClass, getAccentColorClasses } from '@/lib/utils/theme'

interface LinkButtonProps {
  title: string
  url: string
  icon?: string
  onClick?: () => void
  isProtected?: boolean
  thumbnail?: string
  badge?: string
  badgeColor?: string
  buttonStyle?: string
  accentColor?: string
  customButtonColor?: string
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
  buttonStyle = 'rounded',
  accentColor = 'blue',
  customButtonColor
}: LinkButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (isProtected) {
      e.preventDefault()
    }
    onClick?.()
  }

  // Get theme classes
  const roundingClass = getButtonStyleClass(buttonStyle)
  const accentClasses = getAccentColorClasses(accentColor)
  
  // Use custom button color if provided (from advanced theme), otherwise use accent color classes
  const buttonColorStyle = customButtonColor 
    ? { backgroundColor: customButtonColor }
    : undefined
  
  const buttonBgClass = customButtonColor 
    ? '' 
    : `${accentClasses.bg} ${accentClasses.hover}`

  // If has thumbnail, use card style
  if (thumbnail) {
    return (
      <a
        href={isProtected ? '#' : url}
        target={isProtected ? undefined : "_blank"}
        rel={isProtected ? undefined : "noopener noreferrer"}
        onClick={handleClick}
        className={`group w-full overflow-hidden bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 hover:border-white/20 ${roundingClass} transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg touch-manipulation`}
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
            {icon && (
              <span className="text-xl md:text-2xl flex-shrink-0">{icon}</span>
            )}
            <span className="font-medium text-white truncate">{title}</span>
          </div>
          <ExternalLink size={18} className="text-slate-400 group-hover:text-white transition-colors flex-shrink-0 ml-2" />
        </div>
      </a>
    )
  }

  // Default button style with theme support
  return (
    <a
      href={isProtected ? '#' : url}
      target={isProtected ? undefined : "_blank"}
      rel={isProtected ? undefined : "noopener noreferrer"}
      onClick={handleClick}
      style={buttonColorStyle}
      className={`group w-full px-5 py-4 md:px-6 flex items-center justify-between ${buttonBgClass} border border-white/10 hover:border-white/20 ${roundingClass} transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg touch-manipulation relative`}
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
        {icon && (
          <span className="text-xl md:text-2xl flex-shrink-0">{icon}</span>
        )}
        <span className="font-medium text-white truncate">{title}</span>
        {isProtected && (
          <Lock size={16} className="text-blue-400 flex-shrink-0" />
        )}
      </div>
      <ExternalLink size={18} className="text-slate-400 group-hover:text-white transition-colors flex-shrink-0 ml-2" />
    </a>
  )
}