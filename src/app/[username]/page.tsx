import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProfileLinks from '@/components/profile/ProfileLinks'

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
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (!profile) {
    notFound()
  }

  // Fetch links
  const { data: links } = await supabase
    .from('links')
    .select('*')
    .eq('user_id', profile.id)
    .eq('is_active', true)
    .order('position', { ascending: true })

  // Track profile view (analytics)
  await supabase.from('analytics').insert({
    user_id: profile.id,
    event_type: 'view',
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white relative overflow-hidden">
      {/* Animated stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.7 + 0.3
            }}
          />
        ))}
      </div>

      {/* Vantora branding */}
      <div className="absolute top-8 left-8 z-10">
        <a href="/" className="flex items-center space-x-2 text-slate-400 hover:text-white transition">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
          <span className="text-sm font-semibold">vantora.id</span>
        </a>
      </div>

      {/* Profile Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-20">
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-3xl p-8 md:p-12">
          {/* Profile Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">
              {profile.display_name || profile.username}
            </h1>
            <p className="text-slate-400 mb-4">@{profile.username}</p>
            {profile.bio && (
              <p className="text-slate-300 max-w-md">{profile.bio}</p>
            )}
          </div>

          {/* Links */}
          <ProfileLinks links={links || []} userId={profile.id} />

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-slate-700 text-center">
            <p className="text-slate-500 text-sm">
              Create your own link page at{' '}
              <a href="/" className="text-blue-400 hover:underline">
                vantora.id
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, bio, username')
    .eq('username', username)
    .single()

  if (!profile) {
    return {
      title: 'Profile Not Found',
    }
  }

  return {
    title: `${profile.display_name || profile.username} | Vantora`,
    description: profile.bio || `Check out ${profile.display_name || profile.username}'s links on Vantora`,
  }
}