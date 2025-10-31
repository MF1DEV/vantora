'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Globe, Check, X, AlertCircle, Copy, ExternalLink } from 'lucide-react'
import Button from '@/components/ui/Button'

interface CustomDomain {
  id: string
  domain: string
  verified: boolean
  verification_token: string
  dns_configured: boolean
  ssl_status: string
  created_at: string
  verified_at: string | null
}

export default function DomainSettingsPage() {
  const supabase = createClient()
  const [domain, setDomain] = useState<CustomDomain | null>(null)
  const [newDomain, setNewDomain] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [copiedToken, setCopiedToken] = useState(false)

  useEffect(() => {
    loadDomain()
  }, [])

  const loadDomain = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('custom_domains')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      setDomain(data)
    } catch (err) {
      console.error('Error loading domain:', err)
    } finally {
      setLoading(false)
    }
  }

  const addDomain = async () => {
    if (!newDomain) return
    
    setSaving(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Validate domain format
      const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,}$/i
      if (!domainRegex.test(newDomain)) {
        throw new Error('Invalid domain format')
      }

      const response = await fetch('/api/domains/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: newDomain }),
      })

      const result = await response.json()
      
      if (!response.ok) throw new Error(result.error || 'Failed to add domain')

      setDomain(result.domain)
      setNewDomain('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const verifyDomain = async () => {
    if (!domain) return

    setSaving(true)
    setError('')

    try {
      const response = await fetch('/api/domains/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain_id: domain.id }),
      })

      const result = await response.json()
      
      if (!response.ok) throw new Error(result.error || 'Verification failed')

      setDomain(result.domain)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const removeDomain = async () => {
    if (!domain || !confirm('Are you sure you want to remove this custom domain?')) return

    setSaving(true)
    try {
      await supabase.from('custom_domains').delete().eq('id', domain.id)
      setDomain(null)
    } catch (err) {
      console.error('Error removing domain:', err)
    } finally {
      setSaving(false)
    }
  }

  const copyToken = () => {
    if (domain) {
      navigator.clipboard.writeText(domain.verification_token)
      setCopiedToken(true)
      setTimeout(() => setCopiedToken(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="backdrop-blur-sm border border-white/10 rounded-2xl p-8 animate-pulse">
          <div className="h-8 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-slate-700 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Custom Domain</h1>
        <p className="text-slate-400">Use your own domain for your profile</p>
      </div>

      {!domain ? (
        <div className="backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Globe className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Add Your Custom Domain</h2>
              <p className="text-slate-400 mb-4">
                Connect your own domain to make your profile accessible at your custom URL.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Domain Name
              </label>
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value.toLowerCase())}
                placeholder="links.yourdomain.com"
                className="w-full backdrop-blur-sm border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-blue-500"
              />
              <p className="text-xs text-slate-500 mt-2">
                Enter your subdomain (e.g., links.yourdomain.com or go.yourdomain.com)
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <Button
              onClick={addDomain}
              disabled={saving || !newDomain}
              className="w-full"
            >
              {saving ? 'Adding Domain...' : 'Add Domain'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Domain Status Card */}
          <div className="backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{domain.domain}</h2>
                <div className="flex items-center gap-4">
                  <StatusBadge
                    status={domain.verified ? 'verified' : 'pending'}
                    label={domain.verified ? 'Verified' : 'Pending Verification'}
                  />
                  <StatusBadge
                    status={domain.ssl_status}
                    label={`SSL: ${domain.ssl_status}`}
                  />
                </div>
              </div>
              <button
                onClick={removeDomain}
                className="text-red-400 hover:text-red-300 transition"
              >
                Remove
              </button>
            </div>

            {!domain.verified && (
              <>
                {/* DNS Configuration */}
                <div className="space-y-4 mb-6">
                  <h3 className="text-lg font-semibold text-white">DNS Configuration</h3>
                  <p className="text-sm text-slate-400">
                    Add the following DNS records to your domain provider:
                  </p>

                  <div className="space-y-3">
                    {/* CNAME Record */}
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-300">CNAME Record</span>
                        <span className="text-xs text-slate-500">Required</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Type:</span>
                          <div className="text-white font-mono">CNAME</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Name:</span>
                          <div className="text-white font-mono break-all">
                            {domain.domain.split('.')[0]}
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-500">Value:</span>
                          <div className="text-white font-mono break-all">
                            cname.vercel-dns.com
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* TXT Record for Verification */}
                    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-300">TXT Record (Verification)</span>
                        <button
                          onClick={copyToken}
                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          {copiedToken ? (
                            <>
                              <Check className="w-3 h-3" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Type:</span>
                          <div className="text-white font-mono">TXT</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Name:</span>
                          <div className="text-white font-mono">_vantora-verification</div>
                        </div>
                        <div>
                          <span className="text-slate-500">Value:</span>
                          <div className="text-white font-mono break-all text-xs">
                            {domain.verification_token}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Verification Guide */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-semibold text-blue-400 mb-2">Setup Instructions</h4>
                  <ol className="text-sm text-slate-300 space-y-2 list-decimal list-inside">
                    <li>Log in to your domain provider (GoDaddy, Namecheap, Cloudflare, etc.)</li>
                    <li>Go to DNS settings for your domain</li>
                    <li>Add the CNAME record pointing to Vercel</li>
                    <li>Add the TXT record for verification</li>
                    <li>Wait 5-10 minutes for DNS propagation</li>
                    <li>Click "Verify Domain" below</li>
                  </ol>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                <Button
                  onClick={verifyDomain}
                  disabled={saving}
                  className="w-full"
                >
                  {saving ? 'Verifying...' : 'Verify Domain'}
                </Button>
              </>
            )}

            {domain.verified && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-2">Domain Active!</h4>
                    <p className="text-slate-300 mb-4">
                      Your custom domain is now active. Your profile is accessible at:
                    </p>
                    <a
                      href={`https://${domain.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium"
                    >
                      https://{domain.domain}
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  const colors = {
    verified: 'bg-green-500/20 text-green-400 border-green-500/30',
    active: 'bg-green-500/20 text-green-400 border-green-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    failed: 'bg-red-500/20 text-red-400 border-red-500/30',
  }

  const colorClass = colors[status as keyof typeof colors] || colors.pending

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
      {label}
    </span>
  )
}
