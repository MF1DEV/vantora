import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProfileLinks from '@/components/profile/ProfileLinks'
import SocialMediaLinks from '@/components/dashboard/SocialMediaLinks'
import AudioPlayer from '@/components/profile/AudioPlayer'
import AnalyticsTracker from '@/components/analytics/AnalyticsTracker'
import { getBackgroundClass } from '@/lib/utils/theme'

interface Link {
  id: string
  title: string
  url: string
  position: number
}

interface Profile {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
  theme_background: string | null
  theme_button_style: string | null
  theme_accent_color: string | null
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) {
    notFound()
  }

  const { data: links } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', profile.id)
    .eq('is_active', true)
    .order('position', { ascending: true })
  
  // Fetch view count
  const viewCount = profile.total_views || 0

  const background = profile.theme_background || 'gradient-blue'
  const buttonStyle = profile.theme_button_style || 'rounded'
  const accentColor = profile.theme_accent_color || 'blue'
  const bgClass = getBackgroundClass(background)

  return (
    <div className={`min-h-screen text-white relative overflow-hidden ${bgClass}`}>
      {/* Client-side analytics tracking */}
      <AnalyticsTracker userId={profile.id} eventType="view" />
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs - More prominent, fewer elements */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
        
        {/* Subtle grid pattern - only on desktop */}
        <div className="hidden md:block absolute inset-0 opacity-30" style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="absolute top-6 left-6 md:top-8 md:left-8 z-10">
        <a href="/" className="flex items-center space-x-2 text-slate-400 hover:text-white transition">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
          <span className="text-sm font-semibold">vantora.id</span>
        </a>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="backdrop-blur-sm border border-white/10 rounded-3xl p-6 sm:p-8 md:p-12 animate-scale-in">
          <div className="flex flex-col items-center text-center mb-8">
            {profile.avatar_url ? (
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/10 mb-4 animate-fade-in animation-delay-100">
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name || profile.username}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4 animate-fade-in animation-delay-100" />
            )}
            <h1 className="text-3xl font-bold text-white mb-2 animate-fade-in animation-delay-200">
              {profile.display_name || profile.username}
            </h1>
            <p className="text-slate-400 mb-4 animate-fade-in animation-delay-300">@{profile.username}</p>
            {profile.bio && (
              <p className="text-slate-300 max-w-md mb-4 animate-fade-in animation-delay-400">{profile.bio}</p>
            )}
            
            {/* Social Media Links */}
            {profile.social_links && Object.keys(profile.social_links).length > 0 && (
              <div className="flex gap-3 justify-center mt-4 animate-fade-in animation-delay-500">
                <SocialMediaLinks links={profile.social_links} readonly />
              </div>
            )}
          </div>

          <ProfileLinks 
            username={profile.username}
          />

<div className="mt-12 pt-6 border-t border-slate-700">
            {/* Visitor Counter */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 rounded-lg border border-slate-700">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="text-sm font-medium text-slate-300">
                  {viewCount.toLocaleString()} views
                </span>
              </div>
            </div>
            
            <p className="text-slate-500 text-sm text-center">
              Create your own link page at{' '}
              <a href="/" className="text-blue-400 hover:underline">
                vantora.id
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Background Music Player */}
      {profile.music_enabled && profile.background_music_url && (
        <AudioPlayer 
          musicUrl={profile.background_music_url} 
          volume={profile.music_volume || 0.5}
          autoPlay={true}
        />
      )}
    </div>
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, bio, username, avatar_url')
    .eq('username', username)
    .single()

  if (!profile) {
    return {
      title: 'Profile Not Found | Vantora',
      description: 'This profile does not exist on Vantora',
    }
  }

  const title = `${profile.display_name || profile.username} | Vantora`
  const description = profile.bio || `Check out ${profile.display_name || profile.username}'s links on Vantora`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: 'Vantora',
      images: profile.avatar_url ? [{
        url: profile.avatar_url,
        width: 800,
        height: 800,
      }] : [],
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: profile.avatar_url ? [profile.avatar_url] : [],
    },
  }
}