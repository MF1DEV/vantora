'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BarChart3, Users, MousePointerClick, ExternalLink } from 'lucide-react';

export default function LandingPage() {
  const [username, setUsername] = useState('');

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Animated stars */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 animate-pulse rounded-full bg-white"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.7 + 0.3,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600" />
          <span className="text-xl font-bold">vantora.id</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/login" className="px-4 py-2 text-sm transition hover:text-blue-400">
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium transition hover:bg-blue-700"
          >
            Register
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 mx-auto max-w-4xl px-8 pb-32 pt-20 text-center">
        <h1 className="mb-6 text-6xl font-bold">
          Create Your
          <br />
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Digital Identity
          </span>
        </h1>
        <p className="mb-12 text-lg text-slate-300">
          Build a beautiful bio link page with advanced analytics. Share all your
          <br />
          important links in one stunning place.
        </p>

        {/* Username claim */}
        <div className="mx-auto max-w-md">
          <div className="flex items-center overflow-hidden rounded-lg border border-slate-700 bg-slate-800/50 backdrop-blur-sm">
            <span className="px-4 text-sm text-slate-400">vantora.id/</span>
            <input
              type="text"
              placeholder="your-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="flex-1 bg-transparent px-2 py-4 text-white outline-none"
            />
            <Link
              href={username ? `/register?username=${username}` : '/register'}
              className="bg-blue-600 px-6 py-4 text-sm font-medium transition hover:bg-blue-700"
            >
              Claim
            </Link>
          </div>
          <p className="mt-3 text-xs text-slate-400">Choose your unique username to get started</p>
        </div>

        {/* Feature Cards */}
        <div className="mt-20 grid gap-6 md:grid-cols-2">
          {/* Profile Preview */}
          <div className="rounded-2xl border border-slate-700 bg-slate-800/30 p-6 text-left backdrop-blur-sm">
            <h3 className="mb-4 text-xl font-semibold">Your Profile</h3>
            <div className="space-y-4 rounded-xl bg-slate-900/50 p-6">
              <div className="flex flex-col items-center">
                <div className="mb-3 h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
                <div className="text-center">
                  <h4 className="font-semibold">Your Name</h4>
                  <p className="text-sm text-slate-400">@username</p>
                </div>
                <p className="mt-3 text-center text-sm text-slate-400">
                  Your bio and description goes here
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex cursor-pointer items-center justify-between rounded-lg bg-slate-800/50 p-3 transition hover:bg-slate-700/50">
                  <span className="text-sm">My Website</span>
                  <ExternalLink className="h-4 w-4 text-slate-400" />
                </div>
                <div className="flex cursor-pointer items-center justify-between rounded-lg bg-slate-800/50 p-3 transition hover:bg-slate-700/50">
                  <span className="text-sm">Social Media</span>
                  <ExternalLink className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Dashboard */}
          <div className="rounded-2xl border border-slate-700 bg-slate-800/30 p-6 text-left backdrop-blur-sm">
            <h3 className="mb-4 text-xl font-semibold">Analytics Dashboard</h3>
            <div className="space-y-4 rounded-xl bg-slate-900/50 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-slate-800/50 p-4">
                  <div className="text-3xl font-bold">1.2K</div>
                  <div className="mt-1 text-xs text-slate-400">Total Clicks</div>
                </div>
                <div className="rounded-lg bg-slate-800/50 p-4">
                  <div className="text-3xl font-bold">856</div>
                  <div className="mt-1 text-xs text-slate-400">Total Views</div>
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-medium">Click Performance</h4>
                <div className="space-y-2">
                  {[
                    { name: 'My Website', value: 341, width: '70%' },
                    { name: 'Social Media', value: 286, width: '55%' },
                    { name: 'Portfolio', value: 114, width: '25%' },
                  ].map((item) => (
                    <div key={item.name}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-slate-400">{item.name}</span>
                        <span>{item.value}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-800">
                        <div
                          className="h-2 rounded-full bg-blue-600"
                          style={{ width: item.width }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Section */}
      <div className="relative z-10 mx-auto max-w-6xl px-8 pb-20">
        <h2 className="mb-16 text-center text-4xl font-bold">Why Choose vantora.id?</h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/20">
              <BarChart3 className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Advanced Analytics</h3>
            <p className="text-slate-400">Track every click and view with detailed insights</p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-600/20">
              <Users className="h-8 w-8 text-purple-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Fully Customizable</h3>
            <p className="text-slate-400">Make it yours with themes, fonts, and effects</p>
          </div>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-600/20">
              <MousePointerClick className="h-8 w-8 text-pink-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold">Easy to Use</h3>
            <p className="text-slate-400">Set up your page in minutes, no coding required</p>
          </div>
        </div>
      </div>
    </div>
  );
}
