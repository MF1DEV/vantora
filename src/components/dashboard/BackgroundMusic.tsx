'use client'

import { useState, useRef, useEffect } from 'react'
import { Music, Upload, X, Volume2, VolumeX, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface BackgroundMusicProps {
  userId: string
  currentMusicUrl?: string | null
  musicEnabled?: boolean
  musicVolume?: number
  onUpdate: () => void
}

export default function BackgroundMusic({
  userId,
  currentMusicUrl,
  musicEnabled = false,
  musicVolume = 0.5,
  onUpdate,
}: BackgroundMusicProps) {
  const supabase = createClient()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [enabled, setEnabled] = useState(musicEnabled)
  const [volume, setVolume] = useState(musicVolume)
  const [musicUrl, setMusicUrl] = useState(currentMusicUrl)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('')
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      setError('Please upload an audio file (MP3, WAV, OGG)')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Audio file must be less than 10MB')
      return
    }

    setUploading(true)

    try {
      const fileExt = file.name.split('.').pop()
      const timestamp = Date.now()
      const fileName = `${userId}/music-${timestamp}.${fileExt}`

      // Delete old music if exists
      if (currentMusicUrl) {
        const oldFileName = currentMusicUrl.split('/').pop()?.split('?')[0]
        if (oldFileName) {
          await supabase.storage
            .from('music')
            .remove([`${userId}/${oldFileName}`])
        }
      }

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('music')
        .upload(fileName, file, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('music')
        .getPublicUrl(fileName)

      // Update profile with new music URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          background_music_url: publicUrl,
          music_enabled: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (updateError) throw updateError

      setMusicUrl(publicUrl)
      setEnabled(true)
      onUpdate()
    } catch (err: any) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload music')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleRemoveMusic = async () => {
    if (!confirm('Remove background music?')) return

    setUploading(true)
    setError('')

    try {
      if (currentMusicUrl) {
        const fileName = currentMusicUrl.split('/').pop()?.split('?')[0]
        if (fileName) {
          await supabase.storage
            .from('music')
            .remove([`${userId}/${fileName}`])
        }
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          background_music_url: null,
          music_enabled: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (updateError) throw updateError

      setMusicUrl(null)
      setEnabled(false)
      onUpdate()
    } catch (err: any) {
      setError(err.message || 'Failed to remove music')
    } finally {
      setUploading(false)
    }
  }

  const handleToggleEnabled = async () => {
    const newEnabled = !enabled
    setEnabled(newEnabled)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ music_enabled: newEnabled })
        .eq('id', userId)

      if (error) throw error
      onUpdate()
    } catch (err: any) {
      setError('Failed to update music settings')
    }
  }

  const handleVolumeChange = async (newVolume: number) => {
    setVolume(newVolume)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ music_volume: newVolume })
        .eq('id', userId)

      if (error) throw error
    } catch (err: any) {
      console.error('Failed to update volume:', err)
    }
  }

  return (
    <div className="space-y-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-slate-400" />
          <span className="font-medium text-white">Background Music</span>
        </div>
        {musicUrl && (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={handleToggleEnabled}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        )}
      </div>

      <p className="text-sm text-slate-400">
        Add background music that plays when visitors view your profile
      </p>

      {musicUrl ? (
        <div className="space-y-4">
          {/* Audio Player Preview */}
          <div className="p-3 bg-slate-800 rounded-lg">
            <audio ref={audioRef} src={musicUrl} controls className="w-full" />
          </div>

          {/* Volume Control */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              {volume > 0 ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              Volume: {Math.round(volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500"
            />
          </div>

          {/* Remove Button */}
          <button
            onClick={handleRemoveMusic}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm font-medium transition disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            <span>Remove Music</span>
          </button>
        </div>
      ) : (
        <div>
          <label
            htmlFor="music-upload"
            className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition cursor-pointer ${
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
                <span>Upload Music</span>
              </>
            )}
          </label>
          <input
            id="music-upload"
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
          <p className="text-xs text-slate-500 mt-2">
            MP3, WAV, or OGG. Max 10MB. Music will loop automatically.
          </p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
