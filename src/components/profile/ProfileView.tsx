'use client'

import { Card } from '@/components/ui/Card'
import { useProfile } from '@/hooks/useProfile'
import ProfileLinks from './ProfileLinks'
import SocialMediaLinks from '../dashboard/SocialMediaLinks'

export default function ProfileView() {
  const { profile, loading } = useProfile()

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 w-32 rounded-full bg-slate-700 mx-auto mb-4" />
        <div className="h-6 w-48 bg-slate-700 mx-auto mb-2 rounded" />
        <div className="h-4 w-32 bg-slate-700 mx-auto mb-6 rounded" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-slate-700 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <Card className="w-full max-w-md mx-auto p-6">
      <div className="text-center mb-6">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.username}
            className="h-32 w-32 rounded-full mx-auto mb-4 object-cover"
          />
        ) : (
          <div className="h-32 w-32 rounded-full bg-slate-700 mx-auto mb-4 flex items-center justify-center text-4xl">
            {profile.username?.[0]?.toUpperCase()}
          </div>
        )}
        <h1 className="text-2xl font-bold mb-1">{profile.display_name || profile.username}</h1>
        {profile.bio && <p className="text-slate-400">{profile.bio}</p>}
      </div>

      {profile.social_links && <SocialMediaLinks links={profile.social_links} readonly />}
      
      <div className="mt-6">
        <ProfileLinks username={profile.username} />
      </div>
    </Card>
  )
}
