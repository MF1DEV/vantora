'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Loader2, Check, Copy, ExternalLink } from 'lucide-react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import ThemeSelector from '@/components/dashboard/ThemeSelector'
import AdvancedThemeCustomizer from '@/components/dashboard/AdvancedThemeCustomizer'
import SocialMediaLinks from '@/components/dashboard/SocialMediaLinks'
import AvatarUpload from '@/components/dashboard/AvatarUpload'
import DraggableLink from '@/components/dashboard/DraggableLink'
import EmojiPicker from '@/components/dashboard/EmojiPicker'
import QRCodeGenerator from '@/components/dashboard/QRCodeGenerator'
import LinkScheduler from '@/components/dashboard/LinkScheduler'
import EnhancedScheduler from '@/components/dashboard/EnhancedScheduler'
import PasswordProtection from '@/components/dashboard/PasswordProtection'
import LinkThumbnailUploader from '@/components/dashboard/LinkThumbnailUploader'
import LinkBadgeSelector from '@/components/dashboard/LinkBadgeSelector'
import LinkCategorySelector from '@/components/dashboard/LinkCategorySelector'
import { DashboardSkeleton } from '@/components/ui/Skeleton'

interface Link {
  id: string
  title: string
  url: string
  position: number
  is_active: boolean
  icon?: string
}

export default function DashboardPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
  const [successMessage, setSuccessMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'profile' | 'theme' | 'advanced'>('profile')
  const [theme, setTheme] = useState({
    background: 'gradient-blue',
    buttonStyle: 'rounded',
    accentColor: 'blue',
  })
  const [copied, setCopied] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Load profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    setProfile(profileData)
    
    // Set theme from profile
    if (profileData) {
      setTheme({
        background: profileData.theme_background || 'gradient-blue',
        buttonStyle: profileData.theme_button_style || 'rounded',
        accentColor: profileData.theme_accent_color || 'blue',
      })
    }

    // Load links
    const { data: linksData } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', user.id)
      .order('position', { ascending: true })

    // Get click counts for each link
    if (linksData) {
      const linksWithClicks = await Promise.all(
        linksData.map(async (link) => {
          const { count } = await supabase
            .from('analytics')
            .select('*', { count: 'exact', head: true })
            .eq('link_id', link.id)
            .eq('event_type', 'click')
          
          return {
            ...link,
            click_count: count || 0
          }
        })
      )
      setLinks(linksWithClicks)
    } else {
      setLinks([])
    }

    setLoading(false)
  }

  const copyProfileLink = () => {
    const url = `${window.location.origin}/${profile?.username}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const exportData = async () => {
    const exportObj = {
      profile: {
        username: profile?.username,
        display_name: profile?.display_name,
        bio: profile?.bio,
        avatar_url: profile?.avatar_url,
        theme: {
          background: profile?.theme_background,
          buttonStyle: profile?.theme_button_style,
          accentColor: profile?.theme_accent_color,
        },
      },
      links: links.map(link => ({
        title: link.title,
        url: link.url,
        is_active: link.is_active,
        position: link.position,
      })),
      exported_at: new Date().toISOString(),
    }

    const dataStr = JSON.stringify(exportObj, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `vantora-${profile?.username}-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
    
    showSuccess('Data exported successfully!')
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

    // If password protected, hash the password
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

    // Build recurring schedule JSON
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
      showSuccess('Link added successfully!')
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
      setErrors({ general: 'Failed to delete link' })
    } else {
      showSuccess('Link deleted successfully!')
      loadData()
    }
  }

  const editLink = async (id: string, data: {
    title: string
    url: string
    icon?: string
    is_scheduled: boolean
    scheduled_start?: string | null
    scheduled_end?: string | null
    thumbnail_url?: string | null
    badge?: string | null
    badge_color?: string | null
    category?: string | null
  }) => {
    const { error } = await supabase
      .from('links')
      .update({
        title: data.title,
        url: data.url,
        icon: data.icon || null,
        is_scheduled: data.is_scheduled,
        scheduled_start: data.scheduled_start,
        scheduled_end: data.scheduled_end,
        thumbnail_url: data.thumbnail_url,
        badge: data.badge,
        badge_color: data.badge_color,
        category: data.category,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      setErrors({ general: 'Failed to update link' })
    } else {
      showSuccess('Link updated successfully!')
      loadData()
    }
  }

  const toggleLink = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from('links')
      .update({ is_active: !currentState })
      .eq('id', id)

    if (error) {
      setErrors({ general: 'Failed to toggle link' })
    } else {
      showSuccess(`Link ${!currentState ? 'enabled' : 'disabled'}!`)
      loadData()
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const oldIndex = links.findIndex((link) => link.id === active.id)
    const newIndex = links.findIndex((link) => link.id === over.id)

    const newLinks = arrayMove(links, oldIndex, newIndex)
    setLinks(newLinks)

    // Update positions in database
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const updates = newLinks.map((link, index) => ({
      id: link.id,
      position: index,
    }))

    for (const update of updates) {
      await supabase
        .from('links')
        .update({ position: update.position })
        .eq('id', update.id)
    }

    showSuccess('Link order updated!')
  }

  const updateProfile = async (field: string, value: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setSaving(true)

    const { error } = await supabase
      .from('profiles')
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    setSaving(false)

    if (error) {
      setErrors({ [field]: 'Failed to update' })
    } else {
      showSuccess('Profile updated!')
      loadData()
    }
  }

  const handleThemeChange = async (newTheme: { background: string; buttonStyle: string; accentColor: string }) => {
    setTheme(newTheme)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    setSaving(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        theme_background: newTheme.background,
        theme_button_style: newTheme.buttonStyle,
        theme_accent_color: newTheme.accentColor,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    setSaving(false)

    if (!error) {
      showSuccess('Theme updated!')
      loadData()
    }
  }

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg flex items-center space-x-2 text-green-400 animate-in fade-in slide-in-from-top-2 duration-300">
          <Check className="w-5 h-5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Message */}
      {errors.general && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
          {errors.general}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <div className="flex items-center justify-between">
          <p className="text-slate-400">Manage your profile and links</p>
          {profile && (
            <div className="flex items-center gap-2">
              <button
                onClick={copyProfileLink}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm text-slate-300 transition"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm text-slate-300 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Export</span>
              </button>
              <QRCodeGenerator username={profile.username} />
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Profile/Theme Editor */}
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === 'profile'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('theme')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === 'theme'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Theme
              </button>
              <button
                onClick={() => setActiveTab('advanced')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === 'advanced'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Advanced
              </button>
            </div>
            {saving && <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />}
          </div>
          
          {activeTab === 'profile' ? (
            <div className="space-y-4">
              {/* Avatar Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Profile Picture</label>
                <AvatarUpload
                  currentAvatarUrl={profile?.avatar_url}
                  userId={profile?.id}
                  onUploadComplete={() => {
                    loadData()
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
                <div className="flex bg-slate-900/50 border border-slate-700 rounded-lg overflow-hidden">
                  <span className="px-3 py-3 text-slate-400 text-sm">vantora.id/</span>
                  <input
                    type="text"
                    value={profile?.username || ''}
                    disabled
                    className="flex-1 bg-transparent px-2 py-3 text-slate-500 outline-none cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Username cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Display Name</label>
                <input
                  type="text"
                  value={profile?.display_name || ''}
                  onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                  onBlur={(e) => updateProfile('display_name', e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition"
                  placeholder="Your Name"
                  maxLength={50}
                />
                {errors.display_name && (
                  <p className="text-xs text-red-400 mt-1">{errors.display_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Bio</label>
                <textarea
                  value={profile?.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  onBlur={(e) => updateProfile('bio', e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500 transition resize-none"
                  rows={3}
                  placeholder="Tell people about yourself..."
                  maxLength={160}
                />
                <p className="text-xs text-slate-500 mt-1">
                  {profile?.bio?.length || 0}/160 characters
                </p>
                {errors.bio && (
                  <p className="text-xs text-red-400 mt-1">{errors.bio}</p>
                )}
              </div>
            </div>
          ) : activeTab === 'theme' ? (
            <ThemeSelector currentTheme={theme} onThemeChange={handleThemeChange} />
          ) : (
            <AdvancedThemeCustomizer 
              userId={profile?.id}
              initialData={profile}
              onSave={() => {
                loadData()
                showSuccess('Advanced theme saved successfully!')
              }}
            />
          )}
        </div>

        {/* Profile Preview */}
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Preview</h2>
          
          <div className="bg-slate-900/50 rounded-xl p-6">
            <div className="flex flex-col items-center text-center mb-6">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name || profile.username}
                  className="w-20 h-20 rounded-full object-cover border-2 border-slate-700 mb-3"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-3" />
              )}
              <h3 className="text-lg font-semibold text-white">
                {profile?.display_name || 'Your Name'}
              </h3>
              <p className="text-sm text-slate-400">@{profile?.username}</p>
              {profile?.bio && (
                <p className="text-sm text-slate-300 mt-2">{profile.bio}</p>
              )}
            </div>

            <div className="space-y-2">
              {links.filter(link => link.is_active).map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3 hover:bg-slate-700/50 transition"
                >
                  <span className="text-sm text-white truncate">{link.title}</span>
                  <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </div>
              ))}
              {links.filter(link => link.is_active).length === 0 && (
                <p className="text-center text-slate-500 text-sm py-4">No visible links</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Links Manager */}
      <div className="mt-8 bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Manage Links</h2>

        {/* Add New Link */}
        <div className="mb-6 space-y-4">
          {/* Social Media Links */}
          <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
            <SocialMediaLinks
              links={profile?.social_links || {}}
              onAddLink={async (platform, url) => {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                setSaving(true)

                try {
                  const { data: currentProfile } = await supabase
                    .from('profiles')
                    .select('social_links')
                    .eq('id', user.id)
                    .single()

                  const updatedLinks = {
                    ...currentProfile?.social_links,
                    [platform]: url
                  }

                  const { error } = await supabase
                    .from('profiles')
                    .update({
                      social_links: updatedLinks
                    })
                    .eq('id', user.id)

                  if (error) throw error

                  setProfile((prev: any) => ({
                    ...prev,
                    social_links: updatedLinks
                  }))

                  showSuccess('Social link added successfully')
                } catch (error) {
                  console.error('Error adding social link:', error)
                  setErrors({ social: 'Failed to add social link' })
                } finally {
                  setSaving(false)
                }
              }}
            />
          </div>

{/* Custom Link Form */}
          <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
            <h3 className="text-sm font-medium text-slate-300 mb-3">Add Custom Link</h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <EmojiPicker 
                  onSelect={(emoji) => setNewLink({ ...newLink, icon: emoji })}
                  currentIcon={newLink.icon}
                />
                <input
                  type="text"
                  placeholder="Link Title (e.g., My Website)"
                  value={newLink.title}
                  onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition"
                  maxLength={50}
                />
              </div>
              {errors.title && (
                <p className="text-xs text-red-400 mt-1">{errors.title}</p>
              )}
              <div>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition"
                />
                {errors.url && (
                  <p className="text-xs text-red-400 mt-1">{errors.url}</p>
                )}
              </div>

              {/* Link Customization Section */}
              <div className="space-y-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                <h4 className="text-sm font-medium text-slate-300">Customize Link</h4>
                
                <LinkThumbnailUploader
                  linkId="new-link"
                  currentThumbnail={newLink.thumbnail}
                  onUploadComplete={(url) => setNewLink({ ...newLink, thumbnail: url })}
                />

                <LinkBadgeSelector
                  badge={newLink.badge}
                  badgeColor={newLink.badgeColor}
                  onBadgeChange={(badge, color) => 
                    setNewLink({ ...newLink, badge, badgeColor: color })
                  }
                />

                <LinkCategorySelector
                  category={newLink.category}
                  onCategoryChange={(category) => setNewLink({ ...newLink, category })}
                />
              </div>

              <EnhancedScheduler
                isScheduled={newLink.isScheduled}
                scheduledStart={newLink.scheduledStart}
                scheduledEnd={newLink.scheduledEnd}
                timeStart={newLink.timeStart}
                timeEnd={newLink.timeEnd}
                recurringDays={newLink.recurringDays}
                onScheduleChange={(data) =>
                  setNewLink({
                    ...newLink,
                    isScheduled: data.is_scheduled,
                    scheduledStart: data.scheduled_start || '',
                    scheduledEnd: data.scheduled_end || '',
                    timeStart: data.time_start || '',
                    timeEnd: data.time_end || '',
                    recurringDays: data.recurring_days || [],
                  })
                }
              />
              <PasswordProtection
                isProtected={newLink.isProtected}
                password={newLink.password}
                onProtectionChange={(data) =>
                  setNewLink({
                    ...newLink,
                    isProtected: data.is_protected,
                    password: data.password,
                  })
                }
              />
              <button
                onClick={addLink}
                disabled={addingLink}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingLink ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Add Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Links List with Drag & Drop */}
        {links.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={links.map(l => l.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {links.map((link) => (
                  <DraggableLink
                    key={link.id}
                    link={link}
                    onToggle={() => toggleLink(link.id, link.is_active)}
                    onDelete={() => deleteLink(link.id)}
                    onEdit={(data) => editLink(link.id, data)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center py-12">
            <Plus className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">No links yet</p>
            <p className="text-slate-500 text-sm">Add your first link above to get started!</p>
          </div>
        )}
      </div>
    </div>
  )
}