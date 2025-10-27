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
      color: 'from-red-600 to-red-700',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    },
    { 
      name: 'LinkedIn', 
      placeholder: 'in/username',
      baseUrl: 'https://linkedin.com/',
      color: 'from-blue-700 to-blue-800',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      )
    },
    { 
      name: 'GitHub', 
      placeholder: 'username',
      baseUrl: 'https://github.com/',
      color: 'from-gray-800 to-gray-900',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      )
    },
    { 
      name: 'Twitch', 
      placeholder: 'username',
      baseUrl: 'https://twitch.tv/',
      color: 'from-purple-700 to-purple-800',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
        </svg>
      )
    },
    { 
      name: 'Discord', 
      placeholder: 'invite-code',
      baseUrl: 'https://discord.gg/',
      color: 'from-indigo-600 to-indigo-700',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
        </svg>
      )
    },
    { 
      name: 'Spotify', 
      placeholder: 'artist/id or playlist/id',
      baseUrl: 'https://open.spotify.com/',
      color: 'from-green-600 to-green-700',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
        </svg>
      )
    },
    { 
      name: 'Facebook', 
      placeholder: 'username',
      baseUrl: 'https://facebook.com/',
      color: 'from-blue-600 to-blue-700',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    { 
      name: 'Snapchat', 
      placeholder: 'username',
      baseUrl: 'https://snapchat.com/add/',
      color: 'from-yellow-400 to-yellow-500',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-1.5.3-1.5.3-1.5.3 0 .3.3 0 .3-.3 0-.3.3 0 .3 1.5 0 2.1 1.2 2.1 1.5 0 .3-.3.3-.3.3-.3 0-.3-.3-.3-.3-.3-.3-.6-.3-.9 0-.3.3-.9.6-1.8.6-.3 0-.6 0-.9-.3 0 0 0 .3.3.3 1.5 0 3 0 3.9.6.9.6 1.2 1.5 1.2 2.4 0 .3 0 .6-.3.9-.3.3-.6.3-.9.3-.3 0-.6 0-.9-.3-.3-.3-.3-.6-.3-.9 0-1.5-.3-2.7-.9-3.6-.6-.9-1.5-1.5-2.4-1.8l-.3-.3c0-.3 0-.6.3-.9.3-.3.6-.3.9-.3.6 0 1.2.3 1.5.9.3.6.3 1.2 0 1.8 0 .3-.3.6-.6.6-.3 0-.6-.3-.6-.6 0-.6.3-1.2.9-1.2.3 0 .6.3.6.6 0 .3-.3.6-.6.6-.3 0-.6-.3-.6-.6 0-.9-.6-1.5-1.5-1.5s-1.5.6-1.5 1.5c0 .3.3.6.6.6.3 0 .6-.3.6-.6 0-.3.3-.6.6-.6.3 0 .6.3.6.6 0 .6-.3 1.2-.9 1.2-.6 0-1.2-.6-1.2-1.2 0-.9.6-1.5 1.5-1.5.3 0 .6.3.6.6 0 .3-.3.6-.6.6-.3 0-.6-.3-.6-.6 0-.9-.6-1.5-1.5-1.5s-1.5.6-1.5 1.5l.3.3c-.9.3-1.8.9-2.4 1.8-.6.9-.9 2.1-.9 3.6 0 .3 0 .6-.3.9-.3.3-.6.3-.9.3-.3 0-.6 0-.9-.3-.3-.3-.3-.6-.3-.9 0-.9.3-1.8 1.2-2.4.9-.6 2.4-.6 3.9-.6.3 0 .3-.3.3-.3-.3.3-.6.3-.9.3-.9 0-1.5-.3-1.8-.6-.3-.3-.6-.3-.9 0 0 0 0 .3-.3.3-.3 0-.3 0-.3-.3 0-.3.6-1.5 2.1-1.5.3 0 .3-.3 0-.3-.3 0-.3-.3 0-.3.3 0 .3-1.5.3-1.5.199-.012.401-.06.401-.09-.008-.165-.018-.33-.03-.51l-.003-.06c-.104-1.628-.23-3.654.299-4.847C7.86 1.068 11.216.793 12.206.793z"/>
        </svg>
      )
    },
    { 
      name: 'Pinterest', 
      placeholder: 'username',
      baseUrl: 'https://pinterest.com/',
      color: 'from-red-600 to-red-700',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
        </svg>
      )
    },
  ]

  const [selectedPlatform, setSelectedPlatform] = useState<typeof socialPlatforms[0] | null>(null)
  const [username, setUsername] = useState('')

  const handleQuickAdd = () => {
    if (!selectedPlatform || !username.trim()) return

    const fullUrl = selectedPlatform.baseUrl + username.trim()
    onAddLink(selectedPlatform.name, fullUrl)
    
    // Reset
    setUsername('')
    setSelectedPlatform(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-300">Quick Add Social Media</h3>
      </div>

      {/* Platform Selection */}
      <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-2">
        {socialPlatforms.map((platform) => (
          <button
            key={platform.name}
            onClick={() => setSelectedPlatform(platform)}
            className={`p-3 rounded-lg border-2 transition flex flex-col items-center ${
              selectedPlatform?.name === platform.name
                ? 'border-blue-500 bg-slate-800'
                : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
            }`}
          >
            <div className="mb-2 text-white">{platform.icon}</div>
            <div className="text-xs text-white font-medium text-center">{platform.name}</div>
          </button>
        ))}
      </div>

      {/* Username Input */}
      {selectedPlatform && (
        <div className="space-y-2 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
          <div className={`text-sm font-medium bg-gradient-to-r ${selectedPlatform.color} bg-clip-text text-transparent flex items-center gap-2`}>
            {selectedPlatform.icon}
            <span>{selectedPlatform.name}</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder={selectedPlatform.placeholder}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500 transition"
              autoFocus
            />
            <button
              onClick={handleQuickAdd}
              disabled={!username.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
          <div className="text-xs text-slate-500">
            Will create: {selectedPlatform.baseUrl}{username || selectedPlatform.placeholder}
          </div>
        </div>
      )}
    </div>
  )
}