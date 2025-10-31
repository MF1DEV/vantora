'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, BarChart3, Settings, LogOut, ExternalLink, Globe, Palette } from 'lucide-react'
import { ToastProvider } from '@/components/ui/Toast'

// Dynamic imports for sidebar components
const ProfilePreview = dynamic(() => import('@/components/profile/ProfileView'), {
  ssr: false,
  loading: () => <div className="animate-pulse bg-slate-800 rounded-xl h-[300px]" />
})

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      setProfile(profileData)
      setLoading(false)
    }

    checkUser()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    )
  }

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/analytics', icon: BarChart3, label: 'Analytics' },
    { href: '/dashboard/themes', icon: Palette, label: 'Themes' },
    { href: '/domain', icon: Globe, label: 'Custom Domain' },
    { href: '/settings', icon: Settings, label: 'Settings' }
  ]

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-950">
        <nav className="relative z-50 backdrop-blur-sm border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
                <span className="text-white text-xl font-bold">vantora.id</span>
              </Link>

              <div className="flex items-center space-x-6">
                {profile && (
                  <Link
                    href={`/${profile.username}`}
                    target="_blank"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-300 hover:text-blue-400 transition"
                  >
                    <span>View Profile</span>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-300 hover:text-blue-400 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex">
          <aside className="w-64 min-h-screen backdrop-blur-sm border-r border-white/10 p-6">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                // Fix: Check exact match first, then for sub-routes ensure no conflict
                // Dashboard should only match /dashboard exactly
                // Themes should match /dashboard/themes and sub-routes
                const isActive = (() => {
                  if (item.href === '/dashboard') {
                    return pathname === '/dashboard'
                  }
                  return pathname?.startsWith(item.href)
                })()
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </aside>

          <main className="flex-1">
            <div className="max-w-7xl mx-auto p-8">
              <Suspense fallback={<div className="text-white">Loading...</div>}>
                <div key={pathname}>
                  {children}
                </div>
              </Suspense>
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}