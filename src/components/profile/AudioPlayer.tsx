'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'

interface AudioPlayerProps {
  musicUrl: string
  volume: number
  autoPlay?: boolean
}

export default function AudioPlayer({ musicUrl, volume = 0.5, autoPlay = true }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentVolume, setCurrentVolume] = useState(volume)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = currentVolume
    audio.loop = true

    // Attempt autoplay when component mounts
    if (autoPlay) {
      const playPromise = audio.play()
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true)
          })
          .catch((error) => {
            // Autoplay was prevented, user needs to interact first
            console.log('Autoplay prevented:', error)
            setIsPlaying(false)
          })
      }
    }

    return () => {
      audio.pause()
    }
  }, [musicUrl, autoPlay, currentVolume])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    audio.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setCurrentVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex items-center gap-2 bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-full px-3 py-2 md:px-4 shadow-lg">
        <audio ref={audioRef} src={musicUrl} />
        
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="p-2 hover:bg-slate-800 rounded-full transition touch-manipulation"
          aria-label={isPlaying ? 'Pause music' : 'Play music'}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 text-white" />
          ) : (
            <Play className="w-4 h-4 text-white" />
          )}
        </button>

        {/* Volume Control */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-2 hover:bg-slate-800 rounded-full transition touch-manipulation"
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || currentVolume === 0 ? (
              <VolumeX className="w-4 h-4 text-white" />
            ) : (
              <Volume2 className="w-4 h-4 text-white" />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={currentVolume}
            onChange={handleVolumeChange}
            className="w-16 md:w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white touch-manipulation"
          />
        </div>

        <span className="text-xs text-slate-400 ml-2 hidden sm:inline">
          Background Music
        </span>
      </div>
    </div>
  )
}
