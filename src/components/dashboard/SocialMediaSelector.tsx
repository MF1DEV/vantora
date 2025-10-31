'use client'

import { 
  Twitter, Instagram, Facebook, Linkedin, Github, 
  Youtube, Music, Twitch, MessageCircle, Send,
  Phone, Camera, Hash, Pin, Edit,
  Dribbble, Headphones, DollarSign
} from 'lucide-react'

export type SocialPlatform = 
  | 'twitter' | 'instagram' | 'facebook' | 'linkedin' | 'github'
  | 'youtube' | 'tiktok' | 'twitch' | 'discord' | 'telegram'
  | 'whatsapp' | 'snapchat' | 'reddit' | 'pinterest' | 'medium'
  | 'behance' | 'dribbble' | 'spotify' | 'soundcloud' | 'patreon'

interface SocialIconProps {
  platform: SocialPlatform
  className?: string
  color?: string
}

const platformColors: Record<SocialPlatform, string> = {
  twitter: '#1DA1F2',
  instagram: '#E4405F',
  facebook: '#1877F2',
  linkedin: '#0A66C2',
  github: '#181717',
  youtube: '#FF0000',
  tiktok: '#000000',
  twitch: '#9146FF',
  discord: '#5865F2',
  telegram: '#26A5E4',
  whatsapp: '#25D366',
  snapchat: '#FFFC00',
  reddit: '#FF4500',
  pinterest: '#E60023',
  medium: '#000000',
  behance: '#1769FF',
  dribbble: '#EA4C89',
  spotify: '#1DB954',
  soundcloud: '#FF5500',
  patreon: '#FF424D',
}

const platformNames: Record<SocialPlatform, string> = {
  twitter: 'Twitter / X',
  instagram: 'Instagram',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  github: 'GitHub',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  twitch: 'Twitch',
  discord: 'Discord',
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
  snapchat: 'Snapchat',
  reddit: 'Reddit',
  pinterest: 'Pinterest',
  medium: 'Medium',
  behance: 'Behance',
  dribbble: 'Dribbble',
  spotify: 'Spotify',
  soundcloud: 'SoundCloud',
  patreon: 'Patreon',
}

export function SocialIcon({ platform, className = 'w-6 h-6', color }: SocialIconProps) {
  const iconColor = color || platformColors[platform]

  const icons: Record<SocialPlatform, React.ReactNode> = {
    twitter: <Twitter className={className} style={{ color: iconColor }} />,
    instagram: <Instagram className={className} style={{ color: iconColor }} />,
    facebook: <Facebook className={className} style={{ color: iconColor }} />,
    linkedin: <Linkedin className={className} style={{ color: iconColor }} />,
    github: <Github className={className} style={{ color: iconColor }} />,
    youtube: <Youtube className={className} style={{ color: iconColor }} />,
    tiktok: <Music className={className} style={{ color: iconColor }} />,
    twitch: <Twitch className={className} style={{ color: iconColor }} />,
    discord: <MessageCircle className={className} style={{ color: iconColor }} />,
    telegram: <Send className={className} style={{ color: iconColor }} />,
    whatsapp: <Phone className={className} style={{ color: iconColor }} />,
    snapchat: <Camera className={className} style={{ color: iconColor }} />,
    reddit: <Hash className={className} style={{ color: iconColor }} />,
    pinterest: <Pin className={className} style={{ color: iconColor }} />,
    medium: <Edit className={className} style={{ color: iconColor }} />,
    behance: <Hash className={className} style={{ color: iconColor }} />,
    dribbble: <Dribbble className={className} style={{ color: iconColor }} />,
    spotify: <Headphones className={className} style={{ color: iconColor }} />,
    soundcloud: <Headphones className={className} style={{ color: iconColor }} />,
    patreon: <DollarSign className={className} style={{ color: iconColor }} />,
  }

  return icons[platform]
}

interface SocialPlatformSelectorProps {
  selectedPlatform: SocialPlatform | null
  onSelect: (platform: SocialPlatform) => void
}

export function SocialPlatformSelector({ selectedPlatform, onSelect }: SocialPlatformSelectorProps) {
  const platforms: SocialPlatform[] = [
    'twitter', 'instagram', 'facebook', 'linkedin', 'github',
    'youtube', 'tiktok', 'twitch', 'discord', 'telegram',
    'whatsapp', 'snapchat', 'reddit', 'pinterest', 'medium',
    'behance', 'dribbble', 'spotify', 'soundcloud', 'patreon'
  ]

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-white">
        Select Social Platform
      </label>
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {platforms.map((platform) => (
          <button
            key={platform}
            type="button"
            onClick={() => onSelect(platform)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all ${
              selectedPlatform === platform
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
            }`}
            title={platformNames[platform]}
          >
            <SocialIcon platform={platform} className="w-5 h-5" />
            <span className="text-[10px] text-slate-400 capitalize truncate w-full text-center">
              {platform}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export { platformColors, platformNames }
