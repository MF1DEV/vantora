'use client'

import { useState } from 'react'
import { Image, Upload, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface LinkThumbnailUploaderProps {
  linkId: string
  currentThumbnail?: string
  onUploadComplete: (url: string) => void
}

export default function LinkThumbnailUploader({ linkId, currentThumbnail, onUploadComplete }: LinkThumbnailUploaderProps) {
  const supabase = createClient()
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(currentThumbnail || '')

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        return
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${linkId}-${Math.random()}.${fileExt}`
      const filePath = `link-thumbnails/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setPreview(publicUrl)
      onUploadComplete(publicUrl)
    } catch (error) {
      console.error('Error uploading thumbnail:', error)
      alert('Error uploading thumbnail')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview('')
    onUploadComplete('')
  }

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
        <Image className="w-4 h-4" />
        Link Thumbnail
      </label>

      {preview ? (
        <div className="relative group">
          <img
            src={preview}
            alt="Thumbnail"
            className="w-full h-32 object-cover rounded-lg border-2 border-slate-700"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 rounded-lg opacity-0 group-hover:opacity-100 transition"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 rounded-lg hover:border-slate-600 cursor-pointer bg-slate-900/50 hover:bg-slate-900 transition">
          <div className="flex flex-col items-center">
            <Upload className="w-8 h-8 text-slate-400 mb-2" />
            <p className="text-sm text-slate-400">
              {uploading ? 'Uploading...' : 'Click to upload thumbnail'}
            </p>
            <p className="text-xs text-slate-500 mt-1">PNG, JPG up to 2MB</p>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      )}
    </div>
  )
}
