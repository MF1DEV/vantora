'use client'

import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import { Cookie, X } from 'lucide-react'

const COOKIE_CONSENT_KEY = 'vantora_cookie_consent'
const COOKIE_CONSENT_VERSION = '1.0'

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Check if user has already given consent
    const consent = Cookies.get(COOKIE_CONSENT_KEY)
    
    if (!consent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setShowBanner(true), 1000)
    }
  }, [])

  const acceptCookies = () => {
    Cookies.set(COOKIE_CONSENT_KEY, COOKIE_CONSENT_VERSION, { expires: 365 })
    setShowBanner(false)
  }

  const declineCookies = () => {
    Cookies.set(COOKIE_CONSENT_KEY, 'declined', { expires: 365 })
    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-slide-up">
      <div className="max-w-6xl mx-auto">
        <div className="backdrop-blur-xl bg-slate-900/95 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 p-3 bg-purple-500/10 rounded-xl">
                <Cookie className="w-6 h-6 text-purple-400" />
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    We value your privacy
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    We use essential cookies to ensure our website functions properly and to provide you with a better experience. 
                    These cookies are necessary for authentication, security, and to remember your preferences. 
                    We do not use tracking or advertising cookies.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={acceptCookies}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-medium transition shadow-lg"
                  >
                    Accept Essential Cookies
                  </button>
                  <button
                    onClick={declineCookies}
                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition border border-slate-600"
                  >
                    Decline
                  </button>
                  <a
                    href="/privacy"
                    className="px-6 py-3 text-slate-400 hover:text-white rounded-lg font-medium transition text-center"
                  >
                    Learn More
                  </a>
                </div>
              </div>

              <button
                onClick={declineCookies}
                className="flex-shrink-0 p-2 text-slate-400 hover:text-white transition"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
