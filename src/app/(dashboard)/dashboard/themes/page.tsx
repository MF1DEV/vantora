'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Palette, Sparkles, Layout, Code } from 'lucide-react'
import ThemeSelector from '@/components/dashboard/ThemeSelector'
import AdvancedThemeCustomizer from '@/components/dashboard/AdvancedThemeCustomizer'
import CustomCSSEditor from '@/components/dashboard/CustomCSSEditor'
import ThemeTemplatesGallery from '@/components/dashboard/ThemeTemplatesGallery'
import ProfileLayoutSelector from '@/components/dashboard/ProfileLayoutSelector'
import ProfileSectionOrderer from '@/components/dashboard/ProfileSectionOrderer'
import { LoadingSpinner } from '@/components/ui/Loading'
import { useToast } from '@/components/ui/Toast'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ThemesPage() {
  const supabase = createClient()
  const { showToast } = useToast()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'quick' | 'advanced' | 'layout' | 'css'>('quick')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    setProfile(profileData)
    setLoading(false)
  }

  const handleThemeChange = async (theme: any) => {
    const { error } = await supabase
      .from('profiles')
      .update({
        theme_background: theme.background,
        theme_button_style: theme.buttonStyle,
        theme_accent_color: theme.accentColor,
      })
      .eq('id', profile.id)

    if (error) {
      showToast('error', 'Failed to update theme')
    } else {
      showToast('success', 'Theme updated!')
      loadProfile()
    }
  }

  const handleLayoutChange = async (layout: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ profile_layout: layout })
      .eq('id', profile.id)

    if (error) {
      showToast('error', 'Failed to update layout')
    } else {
      showToast('success', 'Layout updated!')
      loadProfile()
    }
  }

  const handleCSSave = async (css: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ custom_css: css })
      .eq('id', profile.id)

    if (error) {
      showToast('error', 'Failed to save CSS')
    } else {
      showToast('success', 'Custom CSS saved!')
      loadProfile()
    }
  }

  const handleApplyTemplate = async (template: any) => {
    const { error } = await supabase
      .from('profiles')
      .update({
        custom_colors: template.colors,
        font_heading: template.fonts.heading,
        font_body: template.fonts.body,
        background_type: template.background.type,
        background_gradient: template.background.gradient,
        background_color: template.background.color,
        button_style: template.buttonStyle,
      })
      .eq('id', profile.id)

    if (error) {
      showToast('error', 'Failed to apply template')
    } else {
      showToast('success', 'Template applied!')
      loadProfile()
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
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Theme Customization</h1>
          <p className="text-slate-400">Make your profile stand out with custom themes and styles</p>
        </div>

        {/* Preview Button */}
        <div className="mb-8">
          <Link
            href={`/${profile?.username}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
          >
            <Sparkles className="w-5 h-5" />
            Preview Your Profile
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-slate-700">
            <nav className="flex gap-1 -mb-px overflow-x-auto">
              {[
                { id: 'quick', label: 'Quick Themes', icon: Palette },
                { id: 'advanced', label: 'Advanced', icon: Sparkles },
                { id: 'layout', label: 'Layout & Sections', icon: Layout },
                { id: 'css', label: 'Custom CSS', icon: Code },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-slate-400 hover:text-white hover:border-slate-600'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fadeIn">
          
          {/* Quick Themes */}
          {activeTab === 'quick' && (
            <div className="space-y-8">
              {/* Pre-built Themes */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
                <h2 className="text-2xl font-semibold text-white mb-6">Pre-built Themes</h2>
                <p className="text-slate-400 mb-8">Choose from our curated collection of beautiful themes</p>
                
                <ThemeTemplatesGallery onApplyTemplate={handleApplyTemplate} />
              </div>

              {/* Basic Theme Selector */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
                <h2 className="text-2xl font-semibold text-white mb-6">Basic Themes</h2>
                <p className="text-slate-400 mb-8">Quick preset themes to get started</p>
                
                <ThemeSelector
                  currentTheme={{
                    background: profile?.theme_background || 'gradient-blue',
                    buttonStyle: profile?.theme_button_style || 'rounded',
                    accentColor: profile?.theme_accent_color || 'blue',
                  }}
                  onThemeChange={handleThemeChange}
                />
              </div>
            </div>
          )}

          {/* Advanced Customization */}
          {activeTab === 'advanced' && (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
              <h2 className="text-2xl font-semibold text-white mb-6">Advanced Customization</h2>
              <p className="text-slate-400 mb-8">Fine-tune every aspect of your profile's appearance</p>
              
              {!profile?.custom_colors && (
                <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/50 rounded-lg">
                  <p className="text-amber-400 text-sm">
                    <strong>Note:</strong> Advanced customization features require running migration 009. 
                    Please run <code className="px-2 py-1 bg-slate-900 rounded">supabase/migrations/009_advanced_customization.sql</code> in your Supabase SQL Editor.
                  </p>
                </div>
              )}
              
              <AdvancedThemeCustomizer
                userId={profile?.id}
                initialData={{
                  custom_colors: profile?.custom_colors || undefined,
                  font_heading: profile?.font_heading || undefined,
                  font_body: profile?.font_body || undefined,
                  background_type: profile?.background_type || undefined,
                  background_gradient: profile?.background_gradient || undefined,
                  background_color: profile?.background_color || undefined,
                  background_image_url: profile?.background_image_url || undefined,
                  enable_particles: profile?.enable_particles || undefined,
                  button_style: profile?.button_style || undefined,
                }}
                onSave={() => {
                  showToast('success', 'Advanced settings saved!')
                  loadProfile()
                }}
              />
            </div>
          )}

          {/* Layout & Sections */}
          {activeTab === 'layout' && (
            <div className="space-y-8">
              {/* Profile Layout */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
                <h2 className="text-2xl font-semibold text-white mb-6">Profile Layout</h2>
                <p className="text-slate-400 mb-8">Choose how your links are displayed</p>
                
                <ProfileLayoutSelector
                  currentLayout={profile?.profile_layout || 'classic'}
                  onLayoutChange={handleLayoutChange}
                />
              </div>

              {/* Section Ordering */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
                <h2 className="text-2xl font-semibold text-white mb-6">Section Order</h2>
                <p className="text-slate-400 mb-8">Drag to reorder how sections appear on your profile</p>
                
                <ProfileSectionOrderer
                  initialOrder={profile?.section_order || ['bio', 'links', 'social']}
                  onSave={async (order) => {
                    const { error } = await supabase
                      .from('profiles')
                      .update({ section_order: order })
                      .eq('id', profile.id)

                    if (!error) {
                      showToast('success', 'Section order saved!')
                      loadProfile()
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Custom CSS */}
          {activeTab === 'css' && (
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
              <h2 className="text-2xl font-semibold text-white mb-6">Custom CSS</h2>
              <p className="text-slate-400 mb-8">Add your own CSS for ultimate customization</p>
              
              <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <h3 className="text-amber-400 font-semibold mb-1">Advanced Feature</h3>
                    <p className="text-amber-300/80 text-sm">
                      Custom CSS is for advanced users. Dangerous styles (@import, javascript:, etc.) are automatically removed.
                    </p>
                  </div>
                </div>
              </div>
              
              <CustomCSSEditor
                initialCSS={profile?.custom_css || ''}
                onSave={handleCSSave}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

