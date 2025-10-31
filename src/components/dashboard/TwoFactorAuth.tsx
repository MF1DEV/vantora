'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Shield, ShieldCheck, ShieldOff, Copy, Check, AlertCircle } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'

interface TwoFactorAuthProps {
  userId: string
}

export default function TwoFactorAuth({ userId }: TwoFactorAuthProps) {
  const supabase = createClient()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [mfaEnabled, setMfaEnabled] = useState(false)
  const [showSetup, setShowSetup] = useState(false)
  const [qrCode, setQrCode] = useState<string>('')
  const [secret, setSecret] = useState<string>('')
  const [verifyCode, setVerifyCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [factors, setFactors] = useState<any[]>([])

  useEffect(() => {
    checkMfaStatus()
  }, [])

  const checkMfaStatus = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors()
      
      if (error) {
        console.error('Error checking MFA status:', error)
        return
      }

      setFactors(data?.totp || [])
      const hasVerifiedFactor = data?.totp?.some((factor: any) => factor.status === 'verified')
      setMfaEnabled(hasVerifiedFactor || false)
    } catch (error) {
      console.error('Error checking MFA:', error)
    }
  }

  const startMfaSetup = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator App',
      })

      if (error) throw error

      if (data) {
        setQrCode(data.totp.qr_code)
        setSecret(data.totp.secret)
        setShowSetup(true)
        showToast('info', '2FA Setup', 'Scan the QR code with your authenticator app')
      }
    } catch (error: any) {
      console.error('Error starting MFA setup:', error)
      showToast('error', 'Setup Failed', error.message || 'Failed to start 2FA setup')
    } finally {
      setLoading(false)
    }
  }

  const verifyAndEnable = async () => {
    if (!verifyCode || verifyCode.length !== 6) {
      showToast('error', 'Invalid Code', 'Please enter a valid 6-digit code')
      return
    }

    setLoading(true)
    try {
      // Get the challenge
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: factors[factors.length - 1]?.id,
      })

      if (challengeError) throw challengeError

      // Verify the code
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: factors[factors.length - 1]?.id,
        challengeId: challengeData.id,
        code: verifyCode,
      })

      if (verifyError) throw verifyError

      showToast('success', '2FA Enabled', 'Two-factor authentication enabled successfully!')
      setShowSetup(false)
      setVerifyCode('')
      await checkMfaStatus()
    } catch (error: any) {
      console.error('Error verifying MFA:', error)
      showToast('error', 'Verification Failed', error.message || 'Invalid verification code')
    } finally {
      setLoading(false)
    }
  }

  const disableMfa = async () => {
    if (!confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return
    }

    setLoading(true)
    try {
      const verifiedFactor = factors.find((f: any) => f.status === 'verified')
      
      if (!verifiedFactor) {
        showToast('error', 'No 2FA Found', 'No active 2FA factor found')
        return
      }

      const { error } = await supabase.auth.mfa.unenroll({
        factorId: verifiedFactor.id,
      })

      if (error) throw error

      showToast('info', '2FA Disabled', 'Two-factor authentication disabled')
      await checkMfaStatus()
    } catch (error: any) {
      console.error('Error disabling MFA:', error)
      showToast('error', 'Disable Failed', error.message || 'Failed to disable 2FA')
    } finally {
      setLoading(false)
    }
  }

  const copySecret = () => {
    navigator.clipboard.writeText(secret)
    setCopied(true)
    showToast('success', 'Copied', 'Secret key copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Status Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {mfaEnabled ? (
            <ShieldCheck className="w-5 h-5 text-green-400" />
          ) : (
            <ShieldOff className="w-5 h-5 text-slate-400" />
          )}
          <div>
            <h3 className="text-sm font-medium text-white">Two-Factor Authentication</h3>
            <p className="text-xs text-slate-400 mt-1">
              {mfaEnabled 
                ? 'Your account is protected with 2FA' 
                : 'Add an extra layer of security to your account'}
            </p>
          </div>
        </div>
        
        {!showSetup && (
          <button
            onClick={mfaEnabled ? disableMfa : startMfaSetup}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              mfaEnabled
                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                : 'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20'
            } disabled:opacity-50`}
          >
            {loading ? 'Processing...' : mfaEnabled ? 'Disable 2FA' : 'Enable 2FA'}
          </button>
        )}
      </div>

      {/* Setup Flow */}
      {showSetup && !mfaEnabled && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 space-y-4">
          <div className="flex items-start space-x-3 text-blue-400 bg-blue-500/10 p-3 rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">Secure your account with 2FA</p>
              <p className="text-blue-300">Scan this QR code with an authenticator app like Google Authenticator, Authy, or 1Password.</p>
            </div>
          </div>

          {qrCode && (
            <div className="space-y-4">
              {/* QR Code */}
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
              </div>

              {/* Manual Entry */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Or enter this code manually:
                </label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-purple-400 font-mono">
                    {secret}
                  </code>
                  <button
                    onClick={copySecret}
                    className="p-2 bg-slate-700 hover:bg-slate-600 rounded transition"
                    title="Copy secret"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Verification */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Enter the 6-digit code from your app:
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white text-center text-2xl font-mono tracking-widest outline-none focus:border-purple-500 transition"
                  disabled={loading}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={verifyAndEnable}
                  disabled={loading || verifyCode.length !== 6}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-3 rounded-lg font-medium transition disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify & Enable'}
                </button>
                <button
                  onClick={() => {
                    setShowSetup(false)
                    setVerifyCode('')
                  }}
                  disabled={loading}
                  className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recovery Codes Info */}
      {mfaEnabled && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-400 mb-1">Important</p>
              <p className="text-amber-300">
                Make sure you don't lose access to your authenticator app. If you do, you may lose access to your account.
                Contact support if you need to recover your account.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
