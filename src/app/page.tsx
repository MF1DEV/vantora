'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Users, MousePointerClick, ExternalLink, ArrowRight, Check, Sparkles, Zap, Shield } from 'lucide-react';

export default function LandingPage() {
  const [username, setUsername] = useState('');
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
        
        {/* Grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />

        {/* Animated stars */}
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.5 + 0.2
            }}
          />
        ))}
      </div>

      {/* Header */}
      <nav className="relative z-50 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg shadow-blue-500/50 group-hover:shadow-blue-500/80 transition-all duration-300" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                vantora.id
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/login"
                className="px-5 py-2.5 text-sm font-medium text-white hover:text-blue-400 transition-colors"
              >
                Login
              </a>
              <a
                href="/register"
                className="group relative px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-sm font-semibold text-white shadow-lg shadow-blue-500/50 hover:shadow-blue-500/80 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center gap-2">
                  Get Started <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-300">Your all-in-one link hub</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <span className="block text-white">One Link.</span>
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Infinite Possibilities.
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Build a stunning bio link page with powerful analytics. 
            <span className="text-white font-semibold"> No coding required.</span>
          </p>

          {/* CTA */}
          <div className="max-w-lg mx-auto animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition duration-300" />
              <div className="relative flex items-stretch overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl">
                <div className="flex items-center px-4 py-4 border-r border-white/10">
                  <span className="text-slate-400 font-medium">vantora.id/</span>
                </div>
                <input
                  type="text"
                  placeholder="yourname"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  className="flex-1 bg-transparent px-4 py-4 text-white placeholder-slate-500 outline-none text-lg"
                />
                <a
                  href={username ? `/register?username=${username}` : '/register'}
                  className="group/btn px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 font-bold text-white transition-all hover:from-blue-500 hover:to-purple-500 flex items-center gap-2"
                >
                  Claim
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Join <span className="text-white font-semibold">10,000+</span> creators already using Vantora
            </p>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-8 mt-16 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            {[
              { value: '10K+', label: 'Active Users' },
              { value: '500K+', label: 'Links Created' },
              { value: '99.9%', label: 'Uptime' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-black text-white mb-6">
            Everything you need.
            <span className="block text-slate-400 text-3xl mt-2">Nothing you don't.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <BarChart3 className="w-8 h-8" />,
              title: 'Advanced Analytics',
              description: 'Track every click, view, and interaction with detailed insights and beautiful charts.',
              color: 'from-blue-500 to-cyan-500'
            },
            {
              icon: <Zap className="w-8 h-8" />,
              title: 'Lightning Fast',
              description: 'Optimized for speed. Your profile loads instantly, keeping your audience engaged.',
              color: 'from-purple-500 to-pink-500'
            },
            {
              icon: <Users className="w-8 h-8" />,
              title: 'Fully Customizable',
              description: 'Make it yours with custom themes, colors, fonts, and backgrounds. No limits.',
              color: 'from-pink-500 to-rose-500'
            },
            {
              icon: <Shield className="w-8 h-8" />,
              title: 'Secure & Private',
              description: 'Your data is encrypted and protected. We never sell your information.',
              color: 'from-green-500 to-emerald-500'
            },
            {
              icon: <MousePointerClick className="w-8 h-8" />,
              title: 'Easy to Use',
              description: 'No coding required. Drag, drop, and customize with our intuitive interface.',
              color: 'from-orange-500 to-amber-500'
            },
            {
              icon: <ExternalLink className="w-8 h-8" />,
              title: 'Unlimited Links',
              description: 'Add as many links as you want. No artificial limits or hidden fees.',
              color: 'from-indigo-500 to-blue-500'
            }
          ].map((feature, i) => (
            <div
              key={i}
              className="group relative"
              style={{
                animation: 'fade-in-up 0.6s ease-out forwards',
                animationDelay: `${i * 0.1}s`,
                opacity: 0
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl blur-xl" 
                   style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }} />
              <div className="relative h-full p-8 rounded-3xl bg-slate-900/50 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 group-hover:transform group-hover:scale-105">
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-5xl font-black text-white mb-6">
              Designed to impress.
            </h2>
            <p className="text-xl text-slate-400 mb-8 leading-relaxed">
              Beautiful themes that make your links stand out. Customize every detail to match your brand perfectly.
            </p>
            <ul className="space-y-4">
              {[
                'Customizable themes and colors',
                'Mobile-optimized design',
                'Dark mode support',
                'Custom icons and emojis',
                'Drag & drop link ordering'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-3xl opacity-20" />
            <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 border border-white/10 shadow-2xl">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4 shadow-lg" />
                <h3 className="text-xl font-bold text-white mb-1">Your Name</h3>
                <p className="text-sm text-slate-400">@username</p>
                <p className="text-sm text-slate-300 mt-3">Your bio and description goes here</p>
              </div>
              <div className="space-y-3">
                {['My Website', 'Social Media', 'Portfolio'].map((link, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-white/10 hover:border-blue-500/50 transition-all cursor-pointer group"
                  >
                    <span className="text-white font-medium">{link}</span>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-3xl opacity-20" />
          <div className="relative bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-3xl p-16 border border-white/10 text-center">
            <h2 className="text-5xl font-black text-white mb-6">
              Ready to get started?
            </h2>
            <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
              Join thousands of creators who trust Vantora to power their online presence.
            </p>
            <a
              href="/register"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-lg font-bold text-white shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/80 transition-all hover:scale-105"
            >
              Create Your Page
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600" />
              <span className="text-lg font-bold text-white">vantora.id</span>
            </div>
            <p className="text-slate-500 text-sm">
              © 2024 Vantora. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}