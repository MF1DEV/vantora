'use client'

import { type SocialLinks } from '@/types/user'
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
  type Icon as LucideIcon
} from 'lucide-react'

interface SocialMediaLinksProps {
  links: Record<string, string>
  readonly?: boolean
  className?: string
}

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

export default function SocialMediaLinks({ links, readonly = false, className = '' }: SocialMediaLinksProps) {
  return (
    <div className={`flex gap-3 justify-center flex-wrap ${className}`}>
      {Object.entries(links).map(([platform, url]) => {
        if (!url) return null
        const Icon = SOCIAL_ICONS[platform.toLowerCase()]
        if (!Icon) return null

        return (
          <a
            key={platform}
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
      })}
    </div>
  )
}