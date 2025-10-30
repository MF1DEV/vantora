'use client'

import {
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Twitch,
  Github,
  Linkedin,
  Mail,
  Globe,
  type LucideIcon
} from 'lucide-react'

const SOCIAL_ICONS: Record<string, LucideIcon> = {
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
  youtube: Youtube,
  twitch: Twitch,
  github: Github,
  linkedin: Linkedin,
  email: Mail,
  website: Globe
}

interface SocialIconProps {
  platform: string
  url: string
  readonly?: boolean
}

export default function SocialIcon({ platform, url, readonly = false }: SocialIconProps) {
  const Icon = SOCIAL_ICONS[platform.toLowerCase()]
  if (!Icon) return null

  return (
    <a
      href={platform === 'email' ? `mailto:${url}` : url}
      target="_blank"
      rel="noopener noreferrer"
      className={`text-slate-400 hover:text-white transition-colors ${
        readonly ? 'cursor-pointer' : 'cursor-default'
      }`}
    >
      <Icon size={20} />
    </a>
  )
}