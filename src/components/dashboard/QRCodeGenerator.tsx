'use client'

import { useState, useEffect, useRef } from 'react'
import QRCode from 'qrcode'
import { Download, QrCode } from 'lucide-react'

interface QRCodeGeneratorProps {
  username: string
}

export default function QRCodeGenerator({ username }: QRCodeGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [showModal, setShowModal] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const profileUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/${username}`

  useEffect(() => {
    generateQRCode()
  }, [username])

  const generateQRCode = async () => {
    try {
      const url = await QRCode.toDataURL(profileUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
      setQrCodeUrl(url)
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  const downloadQRCode = () => {
    const link = document.createElement('a')
    link.href = qrCodeUrl
    link.download = `vantora-${username}-qrcode.png`
    link.click()
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm text-slate-300 transition"
      >
        <QrCode className="w-4 h-4" />
        <span>QR Code</span>
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          
          {/* Modal Content */}
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-8 max-w-md w-full">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-white mb-2">Your QR Code</h2>
            <p className="text-slate-400 text-sm mb-6">
              Share this QR code to let people scan and visit your profile instantly
            </p>

            {/* QR Code Display */}
            <div className="bg-white p-6 rounded-xl mb-6 flex items-center justify-center">
              {qrCodeUrl && (
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  className="w-full max-w-[300px]"
                />
              )}
            </div>

            {/* URL */}
            <div className="mb-6 p-3 bg-slate-800 rounded-lg">
              <p className="text-slate-400 text-xs mb-1">Profile URL</p>
              <p className="text-white text-sm break-all">{profileUrl}</p>
            </div>

            {/* Download Button */}
            <button
              onClick={downloadQRCode}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition"
            >
              <Download className="w-5 h-5" />
              <span>Download QR Code</span>
            </button>

            <p className="text-slate-500 text-xs text-center mt-4">
              Print this QR code on business cards, flyers, or posters
            </p>
          </div>
        </div>
      )}
    </>
  )
}
