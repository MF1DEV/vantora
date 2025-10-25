'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, GripVertical, Trash2, ExternalLink } from 'lucide-react'

interface Link {
  id: string
  title: string
  url: string
  position: number
  is_active: boolean
}

export default function DashboardPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [editingLink, setEditingLink] = useState<string | null>(null)
  const [newLink, setNewLink] = useState({ title: '', url: '' })

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

    // Load links
    const { data: linksData } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', user.id)
      .order('position', { ascending: true })

    setLinks(linksData || [])
    setLoading(false)
  }

  const addLink = async () => {
    if (!newLink.title || !newLink.url) {
      alert('Please fill in both title and URL')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('links')
      .insert({
        user_id: user.id,
        title: newLink.title,
        url: newLink.url,
        position: links.length,
      })

    if (error) {
      console.error('Error adding link:', error)
      alert('Failed to add link')
    } else {
      setNewLink({ title: '', url: '' })
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
      console.error('Error deleting link:', error)
      alert('Failed to delete link')
    } else {
      loadData()
    }
  }

  const updateProfile = async (field: string, value: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    } else {
      loadData()
    }
  }

  if (loading) {
    return <div className="text-white">Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Manage your profile and links</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Profile Editor */}
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Profile Settings</h2>
          
          <div className="space-y-4">
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
              />
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
              />
            </div>
          </div>
        </div>

        {/* Profile Preview */}
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Preview</h2>
          
          <div className="bg-slate-900/50 rounded-xl p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-3" />
              <h3 className="text-lg font-semibold text-white">{profile?.display_name || 'Your Name'}</h3>
              <p className="text-sm text-slate-400">@{profile?.username}</p>
              {profile?.bio && (
                <p className="text-sm text-slate-300 mt-2">{profile.bio}</p>
              )}
            </div>

            <div className="space-y-2">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3 hover:bg-slate-700/50 transition"
                >
                  <span className="text-sm text-white">{link.title}</span>
                  <ExternalLink className="w-4 h-4 text-slate-400" />
                </div>
              ))}
              {links.length === 0 && (
                <p className="text-center text-slate-500 text-sm py-4">No links yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Links Manager */}
      <div className="mt-8 bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Manage Links</h2>

        {/* Add New Link */}
        <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Add New Link</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Link Title"
              value={newLink.title}
              onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition"
            />
            <input
              type="url"
              placeholder="https://example.com"
              value={newLink.url}
              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none focus:border-blue-500 transition"
            />
          </div>
          <button
            onClick={addLink}
            className="mt-3 flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Link</span>
          </button>
        </div>

        {/* Links List */}
        <div className="space-y-2">
          {links.map((link) => (
            <div
              key={link.id}
              className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700"
            >
              <div className="flex items-center space-x-3 flex-1">
                <GripVertical className="w-5 h-5 text-slate-500 cursor-move" />
                <div className="flex-1">
                  <div className="text-white font-medium">{link.title}</div>
                  <div className="text-sm text-slate-400 truncate">{link.url}</div>
                </div>
              </div>
              <button
                onClick={() => deleteLink(link.id)}
                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}