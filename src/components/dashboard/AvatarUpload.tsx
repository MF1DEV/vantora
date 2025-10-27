'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, Loader2, Camera, X, CheckCircle } from 'lucide-react'

interface AvatarUploadProps {
  currentAvatarUrl: string | null
  userId: string
  onUploadComplete: (url: string) => void
}

export default function AvatarUpload({ currentAvatarUrl, userId, onUploadComplete }: AvatarUploadProps) {
  const supabase = createClient()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl)
  const [success, setSuccess] = useState(false)

  const showSuccess = () => {
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2000)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('')
    setSuccess(false)
    
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, or GIF)')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB')
      return
    }

    setUploading(true)

    try {
      // Create a unique file name with timestamp
      const fileExt = file.name.split('.').pop()
      const timestamp = Date.now()
      const fileName = `${userId}/avatar-${timestamp}.${fileExt}`

      // Delete old avatar if exists
      if (currentAvatarUrl) {
        const oldFileName = currentAvatarUrl.split('/').pop()?.split('?')[0]
        if (oldFileName) {
          await supabase.storage
            .from('avatars')
            .remove([`${userId}/${oldFileName}`])
        }
      }

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (updateError) throw updateError

      setPreviewUrl(publicUrl)
      onUploadComplete(publicUrl)
      showSuccess()
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload avatar')
    } finally {
      setUploading(false)
      // Reset file input
      e.target.value = ''
    }
  }

  const handleRemoveAvatar = async () => {
    if (!confirm('Remove your profile picture?')) return

    setUploading(true)
    setError('')

    try {
      // Delete from storage
      if (currentAvatarUrl) {
        const fileName = currentAvatarUrl.split('/').pop()?.split('?')[0]
        if (fileName) {
          await supabase.storage
            .from('avatars')
            .remove([`${userId}/${fileName}`])
        }
      }

      // Update profile to remove avatar
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (updateError) throw updateError

      setPreviewUrl(null)
      onUploadComplete('')
      showSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to remove avatar')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        {/* Avatar Preview */}
        <div className="relative">
          {previewUrl ? (
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-slate-700">
              <img
                src={previewUrl}
                alt="Profile picture"
                className="w-full h-full object-cover"
              />
              {!uploading && (
                <button
                  onClick={handleRemoveAvatar}
                  className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-lg"
                  title="Remove avatar"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Camera className="w-10 h-10 text-white/50" />
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
          {success && (
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div className="flex-1">
          <label 
            htmlFor="avatar-upload"
            className={`inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition cursor-pointer ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>{previewUrl ? 'Change Avatar' : 'Upload Avatar'}</span>
              </>
            )}
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
          <p className="text-xs text-slate-500 mt-2">
            JPG, PNG or GIF. Max 2MB.
          </p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>Avatar updated successfully!</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}