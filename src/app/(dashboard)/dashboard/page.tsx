'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Loader2, Check, Copy, ExternalLink, Download, Settings, Palette, BarChart3, Users, Sparkles, TrendingUp, Target, CheckCircle2, Circle } from 'lucide-react'
import Link from 'next/link'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import AvatarUpload from '@/components/dashboard/AvatarUpload'
import DraggableLink from '@/components/dashboard/DraggableLink'
import EmojiPicker from '@/components/dashboard/EmojiPicker'
import LinkThumbnailUploader from '@/components/dashboard/LinkThumbnailUploader'
import { AppearanceCustomizer } from '@/components/dashboard/AppearanceCustomizer'

import LinkCategorySelector from '@/components/dashboard/LinkCategorySelector'
import { SocialPlatformSelector, SocialPlatform, platformUrlBuilders, platformPlaceholders } from '@/components/dashboard/SocialMediaIcons'
import EnhancedScheduler from '@/components/dashboard/EnhancedScheduler'
import PasswordProtection from '@/components/dashboard/PasswordProtection'
import { LoadingSpinner } from '@/components/ui/Loading'
import { useToast } from '@/components/ui/Toast'
import { Sparkline } from '@/components/dashboard/Sparkline'
import { Confetti } from '@/components/ui/Confetti'

interface Link {
  id: string
  title: string
  url: string
  position: number
  is_active: boolean
  icon?: string
  is_scheduled?: boolean
  scheduled_start?: string | null
  scheduled_end?: string | null
  click_count?: number
  thumbnail_url?: string | null
  badge?: string | null
  badge_color?: string | null
  category?: string | null
  link_type?: string
  social_platform?: string | null
}

export default function DashboardPage() {
  const supabase = createClient()
  const { showToast } = useToast()
  const [profile, setProfile] = useState<any>(null)
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [addingLink, setAddingLink] = useState(false)
  const [newLink, setNewLink] = useState({ 
    title: '', 
    url: '', 
    icon: '',
    isScheduled: false,
    scheduledStart: '',
    scheduledEnd: '',
    timeStart: '',
    timeEnd: '',
    recurringDays: [] as number[],
    isProtected: false,
    password: '',
    thumbnail: '',
    category: '',
    linkType: 'regular' as 'regular' | 'social',
    socialPlatform: null as string | null,
    buttonStyle: 'solid' as 'solid' | 'outline' | 'soft-shadow' | 'neon-glow',
    customColor: '',
    borderRadius: 'rounded' as 'none' | 'sm' | 'rounded' | 'lg' | 'full',
    animation: 'none' as 'none' | 'pulse' | 'bounce' | 'glow'
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  // Mock sparkline data - in real app, fetch from analytics
  const [sparklineData] = useState({
    links: [3, 5, 4, 6, 5, 7, links.length || 8],
    clicks: [45, 52, 48, 61, 58, 65, links.reduce((sum, l) => sum + (l.click_count || 0), 0) || 70],
    views: [120, 135, 128, 145, 142, 158, 165]
  })

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  )

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    setProfile(profileData)

    const { data: linksData } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', user.id)
      .order('position', { ascending: true })

    if (linksData) {
      const linksWithClicks = await Promise.all(
        linksData.map(async (link) => {
          const { count } = await supabase
            .from('analytics')
            .select('*', { count: 'exact', head: true })
            .eq('link_id', link.id)
            .eq('event_type', 'click')
          
          return { ...link, click_count: count || 0 }
        })
      )
      setLinks(linksWithClicks)
    } else {
      setLinks([])
    }

    setLoading(false)
  }

  const getExistingCategories = () => {
    const categories = links
      .map(link => link.category)
      .filter((cat): cat is string => !!cat && cat.trim() !== '')
    return Array.from(new Set(categories))
  }

  const copyProfileLink = () => {
    const url = `${window.location.origin}/${profile?.username}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    showToast('success', 'Profile link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const validateUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const addLink = async () => {
    setErrors({})
    
    if (!newLink.title.trim()) {
      setErrors({ title: 'Title is required' })
      return
    }

    if (!newLink.url.trim()) {
      setErrors({ url: newLink.linkType === 'social' ? 'Username is required' : 'URL is required' })
      return
    }

    // Build the full URL for social media links
    let finalUrl = newLink.url.trim()
    if (newLink.linkType === 'social' && newLink.socialPlatform) {
      const platform = newLink.socialPlatform as SocialPlatform
      // Only build URL if it's not already a full URL (for Discord/Spotify)
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = platformUrlBuilders[platform](finalUrl)
      }
    } else {
      // For regular links, add https:// if missing
      if (finalUrl && !finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl
      }
    }

    if (!validateUrl(finalUrl)) {
      setErrors({ url: 'Please enter a valid URL or username' })
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setAddingLink(true)

    let passwordHash = null
    if (newLink.isProtected && newLink.password) {
      const response = await fetch('/api/links/hash-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newLink.password }),
      })
      const data = await response.json()
      passwordHash = data.hash
    }

    let recurringSchedule = null
    if (newLink.recurringDays.length > 0) {
      recurringSchedule = {
        type: 'days_of_week',
        days: newLink.recurringDays
      }
    }

    const { error } = await supabase
      .from('links')
      .insert({
        user_id: user.id,
        title: newLink.title.trim(),
        url: finalUrl,
        icon: newLink.icon || null,
        position: links.length,
        is_scheduled: newLink.isScheduled,
        scheduled_start: newLink.isScheduled && newLink.scheduledStart ? new Date(newLink.scheduledStart).toISOString() : null,
        scheduled_end: newLink.isScheduled && newLink.scheduledEnd ? new Date(newLink.scheduledEnd).toISOString() : null,
        time_start: newLink.timeStart || null,
        time_end: newLink.timeEnd || null,
        recurring_schedule: recurringSchedule,
        is_protected: newLink.isProtected,
        password_hash: passwordHash,
        thumbnail_url: newLink.thumbnail || null,
        category: newLink.category || null,
        ...(newLink.linkType && { link_type: newLink.linkType }),
        ...(newLink.socialPlatform && { social_platform: newLink.socialPlatform }),
        ...(newLink.buttonStyle && { button_style: newLink.buttonStyle }),
        ...(newLink.customColor && { custom_color: newLink.customColor }),
        ...(newLink.borderRadius && { border_radius: newLink.borderRadius }),
        ...(newLink.animation && { animation: newLink.animation }),
      })

    setAddingLink(false)

    if (error) {
      console.error('Failed to add link:', error)
      showToast('error', `Failed to add link: ${error.message}`)
      setErrors({ general: error.message || 'Failed to add link. Please try again.' })
    } else {
      setNewLink({ 
        title: '', 
        url: '', 
        icon: '', 
        isScheduled: false, 
        scheduledStart: '', 
        scheduledEnd: '',
        timeStart: '',
        timeEnd: '',
        recurringDays: [],
        isProtected: false,
        password: '',
        thumbnail: '',
        category: '',
        linkType: 'regular',
        socialPlatform: null,
        buttonStyle: 'solid',
        customColor: '',
        borderRadius: 'rounded',
        animation: 'none'
      })
      setShowConfetti(true)
      showToast('success', 'Link added successfully!')
      loadData()
    }
  }

  const deleteLink = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return

    const { error } = await supabase
      .from('links')
      .delete()
      .eq('id', id)

    if (error) {
      showToast('error', 'Failed to delete link')
    } else {
      showToast('success', 'Link deleted')
      loadData()
    }
  }

  const toggleLink = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from('links')
      .update({ is_active: !currentState })
      .eq('id', id)

    if (!error) {
      showToast('success', currentState ? 'Link Hidden' : 'Link Activated', currentState ? 'Link is now hidden from your profile' : 'Link is now visible on your profile')
      loadData()
    }
  }

  const updateLink = async (id: string, updates: Partial<Link>) => {
    const { error } = await supabase
      .from('links')
      .update(updates)
      .eq('id', id)

    if (!error) {
      showToast('success', 'Link updated')
      loadData()
    } else {
      showToast('error', 'Failed to update link')
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex((link) => link.id === active.id)
      const newIndex = links.findIndex((link) => link.id === over.id)
      const newLinks = arrayMove(links, oldIndex, newIndex)

      setLinks(newLinks)

      const updates = newLinks.map((link, index) => 
        supabase.from('links').update({ position: index }).eq('id', link.id)
      )

      await Promise.all(updates)
      showToast('success', 'Links reordered')
    }
  }

  const updateProfile = async () => {
    if (!profile) return
    
    setSaving(true)
    
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: profile.display_name,
        bio: profile.bio,
      })
      .eq('id', profile.id)

    setSaving(false)

    if (error) {
      showToast('error', 'Failed to save profile')
    } else {
      showToast('success', 'Profile saved!')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        
        {/* Header with Quick Actions */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-sm sm:text-base text-slate-400">Welcome back, {profile?.display_name || profile?.username}!</p>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={copyProfileLink}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-blue-500 rounded-lg text-xs sm:text-sm font-medium text-white transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400" />
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Copy Link</span>
                  <span className="sm:hidden">Copy</span>
                </>
              )}
            </button>
            
            <Link
              href={`/${profile?.username}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs sm:text-sm font-medium text-white transition"
            >
              <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">View Profile</span>
              <span className="sm:hidden">View</span>
            </Link>
          </div>
        </div>

        {/* Welcome Banner with Profile Completion */}
        {(() => {
          const completionChecks = [
            { completed: !!profile?.avatar_url, label: 'Add profile photo' },
            { completed: !!profile?.display_name, label: 'Set display name' },
            { completed: !!profile?.bio, label: 'Write a bio' },
            { completed: links.length > 0, label: 'Add your first link' },
            { completed: links.length >= 3, label: 'Add 3+ links' },
            { completed: links.some(l => l.link_type === 'social'), label: 'Add social media' }
          ];
          const completedCount = completionChecks.filter(c => c.completed).length;
          const progress = (completedCount / completionChecks.length) * 100;
          
          return progress < 100 ? (
            <div className="mb-6 sm:mb-8 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl" />
              <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 flex items-center gap-2">
                      Complete Your Profile
                      <span className="text-sm font-normal text-slate-400">({completedCount}/{completionChecks.length})</span>
                    </h2>
                    <p className="text-slate-400 text-sm sm:text-base">
                      {progress >= 80 
                        ? '🎉 Almost there! Just a few more steps.' 
                        : progress >= 50
                        ? '👏 Great progress! Keep going.'
                        : '👋 Welcome! Let\'s get your profile set up.'}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-out rounded-full relative overflow-hidden"
                      style={{ width: `${progress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {Math.round(progress)}% complete
                  </p>
                </div>

                {/* Checklist */}
                <div className="grid sm:grid-cols-2 gap-2">
                  {completionChecks.map((check, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        check.completed
                          ? 'bg-green-500/10 border border-green-500/20'
                          : 'bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/50'
                      }`}
                    >
                      {check.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-600 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${check.completed ? 'text-green-400' : 'text-slate-400'}`}>
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null;
        })()}

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {/* Total Links */}
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-sm border border-blue-500/20 rounded-xl p-4 sm:p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-blue-500/10 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 bg-blue-500/20 rounded-lg">
                  <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-blue-400 bg-blue-500/20 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                  {links.filter(l => l.is_active).length} active
                </span>
              </div>
              <h3 className="text-[10px] sm:text-sm font-medium text-slate-400 mb-1">Total Links</h3>
              <div className="flex items-end justify-between">
                <p className="text-xl sm:text-3xl font-bold text-white">{links.length}</p>
                <div className="hidden sm:block">
                  <Sparkline data={sparklineData.links} color="#60a5fa" height={30} />
                </div>
              </div>
            </div>
          </div>

          {/* Total Clicks */}
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4 sm:p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-purple-500/10 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 bg-purple-500/20 rounded-lg">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                </div>
                <Link href="/analytics" className="text-[10px] sm:text-xs font-medium text-purple-400 hover:text-purple-300 transition">
                  View →
                </Link>
              </div>
              <h3 className="text-[10px] sm:text-sm font-medium text-slate-400 mb-1">Total Clicks</h3>
              <div className="flex items-end justify-between">
                <p className="text-xl sm:text-3xl font-bold text-white">{links.reduce((sum, link) => sum + (link.click_count || 0), 0).toLocaleString()}</p>
                <div className="hidden sm:block">
                  <Sparkline data={sparklineData.clicks} color="#c084fc" height={30} />
                </div>
              </div>
            </div>
          </div>

          {/* Profile Views */}
          <div className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 backdrop-blur-sm border border-pink-500/20 rounded-xl p-4 sm:p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-pink-500/10 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 bg-pink-500/20 rounded-lg">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
                </div>
              </div>
              <h3 className="text-[10px] sm:text-sm font-medium text-slate-400 mb-1">Profile Views</h3>
              <div className="flex items-end justify-between">
                <p className="text-xl sm:text-3xl font-bold text-white">{(profile?.total_views || 0).toLocaleString()}</p>
                <div className="hidden sm:block">
                  <Sparkline data={sparklineData.views} color="#f472b6" height={30} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Access */}
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 backdrop-blur-sm border border-green-500/20 rounded-xl p-4 sm:p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-green-500/10 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 bg-green-500/20 rounded-lg">
                  <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                </div>
              </div>
              <h3 className="text-[10px] sm:text-sm font-medium text-slate-400 mb-2">Quick Access</h3>
              <div className="flex flex-col gap-1">
                <Link href="/dashboard/themes" className="text-[10px] sm:text-sm text-green-400 hover:text-green-300 transition">
                  Themes →
                </Link>
                <Link href="/settings" className="text-[10px] sm:text-sm text-green-400 hover:text-green-300 transition">
                  Settings →
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Left Column: Profile Editor */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Profile Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Profile</h2>
              
              <div className="space-y-4 sm:space-y-6">
                <AvatarUpload
                  userId={profile?.id}
                  currentAvatarUrl={profile?.avatar_url}
                  onUploadComplete={(url) => {
                    setProfile({ ...profile, avatar_url: url })
                    supabase.from('profiles').update({ avatar_url: url }).eq('id', profile.id)
                    showToast('success', 'Avatar updated!')
                  }}
                />

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={profile?.display_name || ''}
                    onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={profile?.bio || ''}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Tell people about yourself..."
                  />
                  <p className="text-xs text-slate-500 mt-1">{profile?.bio?.length || 0}/160</p>
                </div>

                <button
                  onClick={updateProfile}
                  disabled={saving}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Save Profile
                    </>
                  )}
                </button>

                <button
                  onClick={copyProfileLink}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Profile Link
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Links Management */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            
            {/* Add New Link */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="p-1.5 sm:p-2 bg-blue-500/20 rounded-lg">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-white">Add New Link</h2>
                  <p className="text-xs sm:text-sm text-slate-400">Create a link to share on your profile</p>
                </div>
              </div>
              
              <div className="space-y-4 sm:space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-300 mb-3 sm:mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                    Basic Information
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    {/* Link Type Selector */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                        Link Type
                      </label>
                      <div className="flex gap-2 sm:gap-3">
                        <button
                          type="button"
                          onClick={() => setNewLink({ ...newLink, linkType: 'regular', socialPlatform: null })}
                          className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-base rounded-lg border-2 font-medium transition-all ${
                            newLink.linkType === 'regular'
                              ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                              : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          Regular Link
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewLink({ ...newLink, linkType: 'social' })}
                          className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-base rounded-lg border-2 font-medium transition-all ${
                            newLink.linkType === 'social'
                              ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                              : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          Social Media
                        </button>
                      </div>
                    </div>

                    {/* Social Platform Selector - Only show for social links */}
                    {newLink.linkType === 'social' && (
                      <SocialPlatformSelector
                        selectedPlatform={newLink.socialPlatform as SocialPlatform | null}
                        onSelect={(platform) => {
                          setNewLink({ 
                            ...newLink, 
                            socialPlatform: platform,
                            title: newLink.title || platform.charAt(0).toUpperCase() + platform.slice(1)
                          })
                        }}
                      />
                    )}

                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                          Title <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={newLink.title}
                          onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                          className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-slate-900 border rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.title ? 'border-red-500' : 'border-slate-700'}`}
                          placeholder="My Awesome Link"
                        />
                        {errors.title && <p className="text-red-400 text-xs sm:text-sm mt-1.5">{errors.title}</p>}
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                          {newLink.linkType === 'social' && newLink.socialPlatform 
                            ? (newLink.socialPlatform === 'discord' || newLink.socialPlatform === 'spotify' ? 'URL' : 'Username')
                            : 'URL'} <span className="text-red-400">*</span>
                        </label>
                        <input
                          type={newLink.linkType === 'social' && newLink.socialPlatform && !['discord', 'spotify'].includes(newLink.socialPlatform) ? 'text' : 'url'}
                          value={newLink.url}
                          onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                          className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-slate-900 border rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${errors.url ? 'border-red-500' : 'border-slate-700'}`}
                          placeholder={
                            newLink.linkType === 'social' && newLink.socialPlatform
                              ? platformPlaceholders[newLink.socialPlatform as SocialPlatform]
                              : 'example.com or https://example.com'
                          }
                        />
                        {errors.url && <p className="text-red-400 text-xs sm:text-sm mt-1.5">{errors.url}</p>}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customization */}
                <div className="pt-4 border-t border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                    Customization
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Icon (Emoji)</label>
                      <EmojiPicker
                        onSelect={(emoji) => setNewLink({ ...newLink, icon: emoji })}
                        currentIcon={newLink.icon}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                      <LinkCategorySelector
                        category={newLink.category}
                        existingCategories={getExistingCategories()}
                        onCategoryChange={(category) => setNewLink({ ...newLink, category })}
                      />
                    </div>
                  </div>
                </div>

                {/* Appearance Customization - Only for regular links */}
                {newLink.linkType === 'regular' && (
                  <div className="pt-4 border-t border-slate-700">
                    <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                      Button Appearance
                    </h3>
                    <AppearanceCustomizer
                      buttonStyle={newLink.buttonStyle}
                      customColor={newLink.customColor}
                      borderRadius={newLink.borderRadius}
                      animation={newLink.animation}
                      onButtonStyleChange={(style) => setNewLink({ ...newLink, buttonStyle: style })}
                      onCustomColorChange={(color) => setNewLink({ ...newLink, customColor: color })}
                      onBorderRadiusChange={(radius) => setNewLink({ ...newLink, borderRadius: radius })}
                      onAnimationChange={(animation) => setNewLink({ ...newLink, animation: animation })}
                    />
                  </div>
                )}

                {/* Advanced Settings */}
                <div className="pt-4 border-t border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-pink-400 rounded-full"></span>
                    Advanced Settings
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <EnhancedScheduler
                      isScheduled={newLink.isScheduled}
                      scheduledStart={newLink.scheduledStart}
                      scheduledEnd={newLink.scheduledEnd}
                      timeStart={newLink.timeStart}
                      timeEnd={newLink.timeEnd}
                      recurringDays={newLink.recurringDays}
                      onScheduleChange={(schedule) => setNewLink({ ...newLink, ...schedule })}
                    />

                    <PasswordProtection
                      isProtected={newLink.isProtected}
                      password={newLink.password}
                      onProtectionChange={(protection) => setNewLink({ ...newLink, ...protection })}
                    />
                  </div>
                </div>

                {/* Add Button */}
                <div className="pt-4">
                  <button
                    onClick={addLink}
                    disabled={addingLink}
                    className="w-full px-4 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
                  >
                    {addingLink ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Adding Link...
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        Add Link
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Links List */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-white">Your Links</h2>
                  <p className="text-sm text-slate-400 mt-1">
                    {links.length} total · {links.filter(l => l.is_active).length} active · {links.reduce((sum, link) => sum + (link.click_count || 0), 0)} clicks
                  </p>
                </div>
                {links.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span>Drag to reorder</span>
                  </div>
                )}
              </div>

              {links.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="max-w-sm mx-auto">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
                      <ExternalLink className="w-10 h-10 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">Create Your First Link</h3>
                    <p className="text-slate-400 mb-6">
                      Start building your link-in-bio page by adding links to your social media, websites, or any content you want to share.
                    </p>
                    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 space-y-2 text-left">
                      <p className="text-sm text-slate-300 font-medium">💡 Quick Tips:</p>
                      <ul className="text-sm text-slate-400 space-y-1 ml-4">
                        <li>• Add titles and URLs above to create links</li>
                        <li>• Use emojis to make links stand out</li>
                        <li>• Schedule links to show at specific times</li>
                        <li>• Track clicks in the Analytics page</li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={links.map(link => link.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                      {links.map((link) => (
                        <DraggableLink
                          key={link.id}
                          link={link}
                          existingCategories={getExistingCategories()}
                          onToggle={() => toggleLink(link.id, !link.is_active)}
                          onDelete={() => deleteLink(link.id)}
                          onEdit={(updates) => updateLink(link.id, updates)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


