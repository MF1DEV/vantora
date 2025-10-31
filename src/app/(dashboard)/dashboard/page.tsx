'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Loader2, Check, Copy, ExternalLink, Download, Settings, Palette, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import AvatarUpload from '@/components/dashboard/AvatarUpload'
import DraggableLink from '@/components/dashboard/DraggableLink'
import EmojiPicker from '@/components/dashboard/EmojiPicker'
import LinkThumbnailUploader from '@/components/dashboard/LinkThumbnailUploader'
import LinkBadgeSelector from '@/components/dashboard/LinkBadgeSelector'
import LinkCategorySelector from '@/components/dashboard/LinkCategorySelector'
import EnhancedScheduler from '@/components/dashboard/EnhancedScheduler'
import PasswordProtection from '@/components/dashboard/PasswordProtection'
import { LoadingSpinner } from '@/components/ui/Loading'
import { useToast } from '@/components/ui/Toast'

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
    badge: '',
    badgeColor: '#ef4444',
    category: ''
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)

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
      setErrors({ url: 'URL is required' })
      return
    }

    if (!validateUrl(newLink.url)) {
      setErrors({ url: 'Please enter a valid URL (include https://)' })
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
        url: newLink.url.trim(),
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
        badge: newLink.badge || null,
        badge_color: newLink.badgeColor || null,
        category: newLink.category || null,
      })

    setAddingLink(false)

    if (error) {
      showToast('error', 'Failed to add link')
      setErrors({ general: 'Failed to add link. Please try again.' })
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
        badge: '',
        badgeColor: '#ef4444',
        category: ''
      })
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-400">Manage your profile and links</p>
        </div>

        {/* Quick Stats & Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Link href={`/${profile?.username}`} target="_blank" className="group">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-blue-500 transition">
              <ExternalLink className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="text-sm font-medium text-slate-400 mb-1">Your Profile</h3>
              <p className="text-xl font-bold text-white truncate">/{profile?.username}</p>
            </div>
          </Link>

          <Link href="/analytics" className="group">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-purple-500 transition">
              <BarChart3 className="w-8 h-8 text-purple-400 mb-3" />
              <h3 className="text-sm font-medium text-slate-400 mb-1">Analytics</h3>
              <p className="text-xl font-bold text-white">{links.reduce((sum, link) => sum + (link.click_count || 0), 0)} clicks</p>
            </div>
          </Link>

          <Link href="/dashboard/themes" className="group">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-pink-500 transition">
              <Palette className="w-8 h-8 text-pink-400 mb-3" />
              <h3 className="text-sm font-medium text-slate-400 mb-1">Themes</h3>
              <p className="text-xl font-bold text-white">Customize</p>
            </div>
          </Link>

          <Link href="/settings" className="group">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-green-500 transition">
              <Settings className="w-8 h-8 text-green-400 mb-3" />
              <h3 className="text-sm font-medium text-slate-400 mb-1">Settings</h3>
              <p className="text-xl font-bold text-white">Account</p>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Profile Editor */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Profile Card */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Profile</h2>
              
              <div className="space-y-6">
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
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={profile?.display_name || ''}
                    onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={profile?.bio || ''}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Tell people about yourself..."
                  />
                  <p className="text-xs text-slate-500 mt-1">{profile?.bio?.length || 0}/160</p>
                </div>

                <button
                  onClick={updateProfile}
                  disabled={saving}
                  className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
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
                  className="w-full px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition flex items-center justify-center gap-2"
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
          <div className="lg:col-span-2 space-y-6">
            
            {/* Add New Link */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Add New Link</h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={newLink.title}
                      onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                      className={`w-full px-4 py-2.5 bg-slate-900 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-500' : 'border-slate-700'}`}
                      placeholder="My Link"
                    />
                    {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      URL <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="url"
                      value={newLink.url}
                      onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                      className={`w-full px-4 py-2.5 bg-slate-900 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.url ? 'border-red-500' : 'border-slate-700'}`}
                      placeholder="https://example.com"
                    />
                    {errors.url && <p className="text-red-400 text-sm mt-1">{errors.url}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Icon (Emoji)</label>
                    <EmojiPicker
                      onSelect={(emoji) => setNewLink({ ...newLink, icon: emoji })}
                      currentIcon={newLink.icon}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Badge</label>
                    <LinkBadgeSelector
                      badge={newLink.badge}
                      badgeColor={newLink.badgeColor}
                      onBadgeChange={(badge, color) => setNewLink({ ...newLink, badge, badgeColor: color })}
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

                <button
                  onClick={addLink}
                  disabled={addingLink}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
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

            {/* Links List */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Your Links ({links.length})</h2>
              </div>

              {links.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-700/50 flex items-center justify-center">
                    <Plus className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No links yet</h3>
                  <p className="text-slate-400 mb-6">Add your first link to get started!</p>
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
                          onToggle={(id: string, state: boolean) => toggleLink(id, state)}
                          onDelete={(id: string) => deleteLink(id)}
                          onEdit={(id: string, updates: any) => updateLink(id, updates)}
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


