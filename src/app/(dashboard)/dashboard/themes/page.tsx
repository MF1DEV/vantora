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
  const [hasAdvancedFeatures, setHasAdvancedFeatures] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error loading profile:', error)
        showToast('error', 'Failed to Load Profile', 'Could not load your profile data')
      } else {
        setProfile(profileData)
        // Check if advanced customization columns exist
        setHasAdvancedFeatures(profileData?.custom_colors !== undefined)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      showToast('error', 'Error', 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleThemeChange = async (theme: any) => {
    if (!profile?.id) {
      showToast('error', 'Profile Not Loaded', 'Please wait for profile to load')
      return
    }

    console.log('Updating theme with:', { theme, profileId: profile.id })

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          theme_background: theme.background,
          theme_button_style: theme.buttonStyle,
          theme_accent_color: theme.accentColor,
        })
        .eq('id', profile.id)
        .select()

      console.log('Theme update result:', { data, error })

      if (error) {
        console.error('Theme update error:', error)
        showToast('error', 'Failed to Update Theme', error.message)
      } else {
        showToast('success', 'Theme Updated', 'Your theme has been applied')
        await loadProfile()
      }
    } catch (err: any) {
      console.error('Unexpected theme update error:', err)
      showToast('error', 'Update Failed', err.message || 'Could not update theme')
    }
  }

  const handleLayoutChange = async (layout: string) => {
    if (!profile?.id) {
      showToast('error', 'Profile Not Loaded', 'Please wait for profile to load')
      return
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ profile_layout: layout })
        .eq('id', profile.id)

      if (error) {
        console.error('Layout update error:', error)
        showToast('error', 'Failed to Update Layout', error.message)
      } else {
        showToast('success', 'Layout Updated', 'Your profile layout has been changed')
        loadProfile()
      }
    } catch (err: any) {
      console.error('Unexpected layout update error:', err)
      showToast('error', 'Update Failed', err.message || 'Could not update layout')
    }
  }

  const handleCSSave = async (css: string) => {
    if (!profile?.id) {
      showToast('error', 'Profile Not Loaded', 'Please wait for profile to load')
      return
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ custom_css: css })
        .eq('id', profile.id)

      if (error) {
        console.error('CSS save error:', error)
        showToast('error', 'Failed to Save CSS', error.message)
      } else {
        showToast('success', 'CSS Saved', 'Your custom CSS has been applied')
        loadProfile()
      }
    } catch (err: any) {
      console.error('Unexpected CSS save error:', err)
      showToast('error', 'Save Failed', err.message || 'Could not save CSS')
    }
  }

  const handleApplyTemplate = async (template: any) => {
    if (!profile?.id) {
      showToast('error', 'Profile Not Loaded', 'Please wait for profile to load')
      return
    }

    try {
      // Convert template gradient string to JSON structure for database
      let backgroundGradient = null
      if (template.background.gradient) {
        // Extract colors from gradient string
        const colorMatches = template.background.gradient.match(/#[0-9a-fA-F]{6}/g)
        if (colorMatches && colorMatches.length >= 2) {
          backgroundGradient = {
            type: template.background.type === 'gradient' ? 'linear' : 'linear',
            angle: template.background.angle || 135,
            colors: colorMatches
          }
        }
      }

      // Map template to basic theme columns (always update these)
      // This ensures templates work even without migration 009
      const basicThemeUpdate: any = {
        theme_button_style: template.buttonStyle || 'rounded',
      }

      // Try to map custom colors to basic accent color
      if (template.colors?.button) {
        // Determine closest accent color from the hex value
        const buttonColor = template.colors.button.toLowerCase()
        if (buttonColor.includes('3b82f6') || buttonColor.includes('2563eb')) {
          basicThemeUpdate.theme_accent_color = 'blue'
        } else if (buttonColor.includes('a855f7') || buttonColor.includes('8b5cf6')) {
          basicThemeUpdate.theme_accent_color = 'purple'
        } else if (buttonColor.includes('ec4899') || buttonColor.includes('db2777')) {
          basicThemeUpdate.theme_accent_color = 'pink'
        } else if (buttonColor.includes('10b981') || buttonColor.includes('059669')) {
          basicThemeUpdate.theme_accent_color = 'green'
        } else if (buttonColor.includes('f97316') || buttonColor.includes('ea580c')) {
          basicThemeUpdate.theme_accent_color = 'orange'
        } else if (buttonColor.includes('ef4444') || buttonColor.includes('dc2626')) {
          basicThemeUpdate.theme_accent_color = 'red'
        } else if (buttonColor.includes('06b6d4') || buttonColor.includes('0891b2')) {
          basicThemeUpdate.theme_accent_color = 'cyan'
        } else if (buttonColor.includes('14b8a6') || buttonColor.includes('0d9488')) {
          basicThemeUpdate.theme_accent_color = 'teal'
        } else if (buttonColor.includes('f59e0b') || buttonColor.includes('d97706')) {
          basicThemeUpdate.theme_accent_color = 'yellow'
        } else {
          basicThemeUpdate.theme_accent_color = 'blue' // default
        }
      }

      // Map background type to basic theme_background
      if (template.background.type === 'solid') {
        basicThemeUpdate.theme_background = 'solid-dark'
      } else {
        // Default to a gradient based on colors
        basicThemeUpdate.theme_background = 'gradient-blue' // will be overridden by advanced if available
      }

      // Prepare advanced theme update (only if columns exist)
      const advancedThemeUpdate: any = {
        custom_colors: template.colors,
        font_heading: template.fonts.heading,
        font_body: template.fonts.body,
        background_type: template.background.type,
        background_gradient: backgroundGradient,
        background_color: template.background.color,
        button_style: template.buttonStyle,
      }

      // Combine updates
      const updateData = hasAdvancedFeatures 
        ? { ...basicThemeUpdate, ...advancedThemeUpdate }
        : basicThemeUpdate

      console.log('Applying template with data:', { 
        templateName: template.name,
        hasAdvancedFeatures, 
        updateData 
      })

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profile.id)

      if (error) {
        console.error('Template apply error:', error)
        showToast('error', 'Failed to Apply Template', error.message)
      } else {
        console.log('Template applied successfully')
        showToast('success', 'Template Applied', 'Theme template has been applied to your profile')
        loadProfile()
      }
    } catch (err: any) {
      console.error('Unexpected template apply error:', err)
      showToast('error', 'Apply Failed', err.message || 'Could not apply template')
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

        {/* Migration Warning Banner */}
        {!hasAdvancedFeatures && (
          <div className="mb-8 p-6 bg-amber-500/10 border-2 border-amber-500/50 rounded-xl">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <Sparkles className="w-6 h-6 text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-400 mb-2">Advanced Features Not Available</h3>
                <p className="text-slate-300 mb-4">
                  To unlock Advanced Themes, Layout options, and Custom CSS, you need to run database migration 009.
                </p>
                <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-slate-400 mb-2">Steps to enable:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-slate-300">
                    <li>Go to your Supabase Dashboard → SQL Editor</li>
                    <li>Copy the contents of <code className="px-2 py-1 bg-slate-800 rounded">supabase/migrations/009_advanced_customization.sql</code></li>
                    <li>Paste and click "Run"</li>
                    <li>Refresh this page</li>
                  </ol>
                </div>
                <Link
                  href="https://github.com/MF1DEV/vantora/blob/main/MIGRATION_GUIDE.md"
                  target="_blank"
                  className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm font-medium"
                >
                  View Migration Guide →
                </Link>
              </div>
            </div>
          </div>
        )}

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
                { id: 'quick', label: 'Quick Themes', icon: Palette, requiresMigration: false },
                { id: 'advanced', label: 'Advanced', icon: Sparkles, requiresMigration: true },
                { id: 'layout', label: 'Layout & Sections', icon: Layout, requiresMigration: true },
                { id: 'css', label: 'Custom CSS', icon: Code, requiresMigration: true },
              ].map((tab) => {
                const isDisabled = tab.requiresMigration && !hasAdvancedFeatures
                return (
                  <button
                    key={tab.id}
                    onClick={() => !isDisabled && setActiveTab(tab.id as any)}
                    disabled={isDisabled}
                    className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-400'
                        : isDisabled
                        ? 'border-transparent text-slate-600 cursor-not-allowed'
                        : 'border-transparent text-slate-400 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                    {isDisabled && <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">Locked</span>}
                  </button>
                )
              })}
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

