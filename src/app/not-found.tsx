'use client'

import Link from 'next/link'
import { Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        {/* Animated 404 */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent mb-4">
            404
          </h1>
          <div className="flex items-center justify-center gap-2 mb-6">
            <Search className="w-6 h-6 text-slate-400" />
            <p className="text-2xl text-slate-300">Page Not Found</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-slate-400 text-lg mb-8 animate-fade-in animation-delay-200">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in animation-delay-300">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition"
          >
            <Home className="w-5 h-5" />
            <span>Go Home</span>
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-white font-medium transition"
          >
            <span>Go to Dashboard</span>
          </Link>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 opacity-50">
          <div className="flex justify-center gap-8">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse animation-delay-200" />
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse animation-delay-300" />
          </div>
        </div>
      </div>
    </div>
  )
}