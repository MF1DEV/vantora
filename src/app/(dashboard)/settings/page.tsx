'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Trash2, Mail, Calendar, Shield, Music, Bell, Lock } from 'lucide-react'
import BackgroundMusic from '@/components/dashboard/BackgroundMusic'
import { useToast } from '@/components/ui/Toast'

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    showViewCount: true,
    hideFromSearch: false,
    passwordProtected: false,
  })

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailOnClick: false,
    weeklyReport: false,
    monthlyReport: true,
  })

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      setProfile(profile)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword.length < 6) {
      showToast('error', 'Validation Error', 'New password must be at least 6 characters')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('error', 'Validation Error', 'New passwords do not match')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      })

      if (error) throw error

      showToast('success', 'Password Updated', 'Your password has been updated successfully')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message || 'Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone and will delete all your data including links and analytics.'
    )

    if (!confirmed) return

    const doubleConfirm = window.prompt(
      'Type "DELETE" to confirm account deletion:'
    )

    if (doubleConfirm !== 'DELETE') {
      showToast('info', 'Cancelled', 'Account deletion cancelled')
      return
    }

    setLoading(true)

    try {
      // Delete user data from profiles (cascade will handle links and analytics)
      if (user) {
        const { error: deleteError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', user.id)

        if (deleteError) throw deleteError
      }

      // Sign out
      await supabase.auth.signOut()
      router.push('/')
    } catch (err: any) {
      showToast('error', 'Delete Failed', err.message || 'Failed to delete account')
      setLoading(false)
    }
  }

  const savePrivacySettings = async () => {
    setLoading(true)
    try {
      // Save privacy settings to profile
      const { error } = await supabase
        .from('profiles')
        .update({
          show_view_count: privacySettings.showViewCount,
          hide_from_search: privacySettings.hideFromSearch,
          password_protected: privacySettings.passwordProtected,
        })
        .eq('id', user?.id)

      if (error) throw error

      showToast('success', 'Settings Saved', 'Privacy settings updated successfully')
    } catch (err: any) {
      showToast('error', 'Save Failed', err.message || 'Failed to save privacy settings')
    } finally {
      setLoading(false)
    }
  }

  const saveNotificationSettings = async () => {
    setLoading(true)
    try {
      // Save notification settings to profile
      const { error } = await supabase
        .from('profiles')
        .update({
          email_on_click: notificationSettings.emailOnClick,
          weekly_report: notificationSettings.weeklyReport,
          monthly_report: notificationSettings.monthlyReport,
        })
        .eq('id', user?.id)

      if (error) throw error

      showToast('success', 'Settings Saved', 'Notification preferences updated successfully')
    } catch (err: any) {
      showToast('error', 'Save Failed', err.message || 'Failed to save notification settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Manage your account and preferences</p>
      </div>

      {/* Account Information */}
      <div className="backdrop-blur-sm bg-slate-900/50 border border-slate-700 rounded-2xl p-8 mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Mail className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Account Information</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400">Email Address</span>
            </div>
            <span className="text-white font-medium">{user?.email || 'Loading...'}</span>
          </div>
          
          <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400">Member Since</span>
            </div>
            <span className="text-white font-medium">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="backdrop-blur-sm bg-slate-900/50 border border-slate-700 rounded-2xl p-8 mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Lock className="w-5 h-5 text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Security</h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password (min. 6 characters)"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg px-4 py-3 pr-12 text-white placeholder-slate-500 outline-none focus:border-purple-500 transition"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Confirm New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg px-4 py-3 pr-12 text-white placeholder-slate-500 outline-none focus:border-purple-500 transition"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            onClick={handlePasswordChange}
            disabled={loading || !passwordData.newPassword || !passwordData.confirmPassword}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating Password...' : 'Update Password'}
          </button>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="backdrop-blur-sm bg-slate-900/50 border border-slate-700 rounded-2xl p-8 mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <Shield className="w-5 h-5 text-green-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Privacy</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
            <div>
              <p className="text-white font-medium">Show View Count</p>
              <p className="text-sm text-slate-400">Display total views on your profile</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacySettings.showViewCount}
                onChange={(e) => setPrivacySettings({ ...privacySettings, showViewCount: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
            <div>
              <p className="text-white font-medium">Hide from Search</p>
              <p className="text-sm text-slate-400">Don't show profile in search results</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacySettings.hideFromSearch}
                onChange={(e) => setPrivacySettings({ ...privacySettings, hideFromSearch: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
            <div>
              <p className="text-white font-medium">Password Protected</p>
              <p className="text-sm text-slate-400">Require password to view profile</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={privacySettings.passwordProtected}
                onChange={(e) => setPrivacySettings({ ...privacySettings, passwordProtected: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>

          <button
            onClick={savePrivacySettings}
            disabled={loading}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Privacy Settings'}
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="backdrop-blur-sm bg-slate-900/50 border border-slate-700 rounded-2xl p-8 mb-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <Bell className="w-5 h-5 text-amber-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Notifications</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
            <div>
              <p className="text-white font-medium">Email on Click</p>
              <p className="text-sm text-slate-400">Get notified when someone clicks your links</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.emailOnClick}
                onChange={(e) => setNotificationSettings({ ...notificationSettings, emailOnClick: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
            <div>
              <p className="text-white font-medium">Weekly Report</p>
              <p className="text-sm text-slate-400">Receive weekly analytics summary</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.weeklyReport}
                onChange={(e) => setNotificationSettings({ ...notificationSettings, weeklyReport: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
            <div>
              <p className="text-white font-medium">Monthly Report</p>
              <p className="text-sm text-slate-400">Receive monthly analytics summary</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationSettings.monthlyReport}
                onChange={(e) => setNotificationSettings({ ...notificationSettings, monthlyReport: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          <button
            onClick={saveNotificationSettings}
            disabled={loading}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 rounded-lg text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Notification Settings'}
          </button>
        </div>
      </div>

      {/* Background Music */}
      {user && profile && (
        <div className="backdrop-blur-sm bg-slate-900/50 border border-slate-700 rounded-2xl p-8 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-pink-500/10 rounded-lg">
              <Music className="w-5 h-5 text-pink-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Background Music</h2>
          </div>
          <BackgroundMusic
            userId={user.id}
            currentMusicUrl={profile.background_music_url}
            musicEnabled={profile.music_enabled}
            musicVolume={profile.music_volume}
            onUpdate={loadUser}
          />
        </div>
      )}

      {/* Danger Zone */}
      <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/50 rounded-2xl p-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-red-500/10 rounded-lg">
            <Trash2 className="w-5 h-5 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-red-400">Danger Zone</h2>
        </div>
        
        <div className="p-4 bg-red-500/5 rounded-lg border border-red-500/20 mb-6">
          <p className="text-slate-300 mb-2">
            <strong className="text-red-400">Warning:</strong> This action cannot be undone.
          </p>
          <p className="text-slate-400 text-sm">
            Deleting your account will permanently remove your profile, all links, analytics data, and any uploaded media. This action is irreversible.
          </p>
        </div>

        <button
          onClick={handleDeleteAccount}
          disabled={loading}
          className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" />
          <span>{loading ? 'Deleting...' : 'Delete Account Permanently'}</span>
        </button>
      </div>
    </div>
  )
}
