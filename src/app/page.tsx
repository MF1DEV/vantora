'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Users, MousePointerClick, ExternalLink, ArrowRight, Check, Sparkles, Zap, Shield, Star, TrendingUp, Lock } from 'lucide-react';

interface Stats {
  users: number;
  links: number;
  clicks: number;
  activeLinks: number;
  updatedAt: string;
}

export default function LandingPage() {
  const [username, setUsername] = useState('');
  const [scrollY, setScrollY] = useState(0);
  const [typedText, setTypedText] = useState('');
  const fullText = 'yourname';
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch real statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Typing animation effect
  useEffect(() => {
    if (username === '') {
      let index = 0;
      const timer = setInterval(() => {
        if (index <= fullText.length) {
          setTypedText(fullText.slice(0, index));
          index++;
        } else {
          clearInterval(timer);
          setTimeout(() => {
            setTypedText('');
          }, 2000);
        }
      }, 150);
      return () => clearInterval(timer);
    }
  }, [username]);

  // Testimonials data
  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Content Creator',
      avatar: '👩‍💼',
      quote: 'Vantora helped me grow my audience by 300%. The analytics are incredible!',
      rating: 5
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Digital Marketer',
      avatar: '👨‍💻',
      quote: 'Best link-in-bio tool I\'ve used. The customization options are endless.',
      rating: 5
    },
    {
      name: 'Emily Watson',
      role: 'Influencer',
      avatar: '👩‍🎨',
      quote: 'My click-through rate doubled after switching to Vantora. Highly recommended!',
      rating: 5
    },
    {
      name: 'David Kim',
      role: 'Entrepreneur',
      avatar: '👨‍🚀',
      quote: 'The scheduling feature saves me hours every week. Game changer!',
      rating: 5
    }
  ];

  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Avatar stack for social proof
  const avatars = ['👩‍💼', '👨‍💻', '👩‍🎨', '👨‍🚀', '👩‍🔬', '👨‍🎤'];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs - Reduced blur for better performance */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-[120px] opacity-15 animate-blob animation-delay-4000" />
        
        {/* Subtle Grid */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.03) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />

        {/* Fewer animated stars - only 30 instead of 100 */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.4 + 0.2
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
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-24 sm:pb-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
            <span className="text-sm font-medium text-blue-300">Your all-in-one link hub</span>
          </div>

          {/* Main Heading with animated gradient */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <span className="block text-white mb-2">One Link.</span>
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              Infinite Possibilities.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Build a stunning bio link page with powerful analytics. 
            <span className="text-white font-semibold"> No coding required.</span>
          </p>

              {/* Avatar Stack Social Proof */}
              <div className="flex flex-col items-center gap-3 mb-10 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
                <div className="flex -space-x-3">
                  {avatars.map((avatar, i) => (
                    <div 
                      key={i} 
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-slate-900 flex items-center justify-center text-lg sm:text-xl hover:scale-110 hover:z-10 transition-transform duration-200 cursor-pointer shadow-lg"
                    >
                      {avatar}
                    </div>
                  ))}
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-white hover:scale-110 hover:z-10 transition-transform duration-200 cursor-pointer shadow-lg">
                    {loading ? '...' : stats?.users || '0'}+
                  </div>
                </div>
                <p className="text-sm text-slate-400 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold text-white">
                    {loading ? 'Loading...' : `Join ${stats?.users || 0}+`}
                  </span> 
                  {!loading && stats?.users === 0 ? ' Be the first!' : ' creators using Vantora'}
                </p>
              </div>          {/* CTA - Improved mobile responsiveness */}
          <div className="max-w-lg mx-auto animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition duration-300" />
              <div className="relative flex flex-col sm:flex-row items-stretch overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl">
                <div className="flex items-center px-4 py-3 sm:py-4 border-b sm:border-b-0 sm:border-r border-white/10">
                  <span className="text-slate-400 font-medium text-sm sm:text-base">vantora.id/</span>
                </div>
                <input
                  type="text"
                  placeholder={username ? "yourname" : typedText}
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  className="flex-1 bg-transparent px-4 py-3 sm:py-4 text-white placeholder-slate-500 outline-none text-base sm:text-lg"
                />
                <a
                  href={username ? `/register?username=${username}` : '/register'}
                  className="group/btn px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 font-bold text-white transition-all hover:from-blue-500 hover:to-purple-500 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/50"
                >
                  Claim Now
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-500">
              Free forever • No credit card required • Set up in 2 minutes
            </p>
          </div>

          {/* Social Proof - Real stats */}
          <div className="flex flex-col items-center gap-6 mt-12 sm:mt-16 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1 flex items-center justify-center gap-2">
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    <>
                      {stats?.users || 0}
                      {stats?.users === 0 && <span className="text-sm text-blue-400 ml-1">Be First!</span>}
                    </>
                  )}
                </div>
                <div className="text-xs sm:text-sm text-slate-400">Active Users</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    (stats?.links || 0).toLocaleString()
                  )}
                </div>
                <div className="text-xs sm:text-sm text-slate-400">Links Created</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    (stats?.clicks || 0).toLocaleString()
                  )}
                </div>
                <div className="text-xs sm:text-sm text-slate-400">Total Clicks</div>
              </div>
            </div>
            
            {/* Live indicator */}
            {!loading && stats && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>Live statistics • Updates every 30s</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Grid - Better spacing */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center mb-16 sm:mb-20">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 sm:mb-6">
            Everything you need.
            <span className="block text-slate-400 text-2xl sm:text-3xl mt-2">Nothing you don't.</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
              className="group relative opacity-100"
            >
              <div className="relative h-full p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-slate-900/50 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:transform hover:scale-105">
                <div className={`inline-flex p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.color} mb-4 sm:mb-6 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm sm:text-base">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Section - Better mobile layout */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 sm:mb-6">
              Designed to impress.
            </h2>
            <p className="text-lg sm:text-xl text-slate-400 mb-6 sm:mb-8 leading-relaxed">
              Beautiful themes that make your links stand out. Customize every detail to match your brand perfectly.
            </p>
            <ul className="space-y-3 sm:space-y-4">
              {[
                'Customizable themes and colors',
                'Mobile-optimized design',
                'Dark mode support',
                'Custom icons and emojis',
                'Drag & drop link ordering'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-300 text-sm sm:text-base">
                  <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative order-1 lg:order-2">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-3xl opacity-20" />
            <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4 shadow-lg" />
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1">Your Name</h3>
                <p className="text-sm text-slate-400">@username</p>
                <p className="text-sm text-slate-300 mt-3">Your bio and description goes here</p>
              </div>
              <div className="space-y-3">
                {['My Website', 'Social Media', 'Portfolio'].map((link, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-slate-800/50 border border-white/10 hover:border-blue-500/50 transition-all cursor-pointer group"
                  >
                    <span className="text-white font-medium text-sm sm:text-base">{link}</span>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Loved by <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">creators</span> worldwide
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our community has to say.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-3xl" />
          <div className="relative bg-slate-900/50 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-8 sm:p-12 border border-white/10">
            <div className="max-w-3xl mx-auto">
              {/* Current Testimonial */}
              <div key={currentTestimonial} className="animate-fade-in">
                <div className="flex items-center gap-2 mb-6 justify-center">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-xl sm:text-2xl text-white font-medium text-center mb-8 leading-relaxed">
                  "{testimonials[currentTestimonial].quote}"
                </blockquote>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg">
                    {testimonials[currentTestimonial].avatar}
                  </div>
                  <div className="text-left">
                    <p className="text-white font-semibold text-lg">{testimonials[currentTestimonial].name}</p>
                    <p className="text-slate-400 text-sm">{testimonials[currentTestimonial].role}</p>
                  </div>
                </div>
              </div>

              {/* Dots Navigation */}
              <div className="flex items-center justify-center gap-2 mt-8">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentTestimonial(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === currentTestimonial 
                        ? 'w-8 bg-gradient-to-r from-blue-500 to-purple-500' 
                        : 'w-2 bg-slate-600 hover:bg-slate-500'
                    }`}
                    aria-label={`View testimonial ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Why choose <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Vantora</span>?
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            See how we stack up against the competition
          </p>
        </div>

        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 backdrop-blur-xl">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Feature</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600" />
                        <span className="text-white">Vantora</span>
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-400">Others</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {[
                    { feature: 'Unlimited Links', vantora: true, others: false },
                    { feature: 'Advanced Analytics', vantora: true, others: 'Limited' },
                    { feature: 'Custom Themes', vantora: true, others: 'Basic' },
                    { feature: 'Link Scheduling', vantora: true, others: false },
                    { feature: 'Password Protection', vantora: true, others: 'Pro Only' },
                    { feature: 'No Branding', vantora: true, others: 'Pro Only' },
                    { feature: 'Email Support', vantora: true, others: 'Pro Only' },
                    { feature: 'Price', vantora: 'Free', others: '$5-15/mo' }
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-sm text-white font-medium">{row.feature}</td>
                      <td className="px-6 py-4 text-center">
                        {row.vantora === true ? (
                          <div className="flex justify-center">
                            <Check className="w-5 h-5 text-green-400" />
                          </div>
                        ) : (
                          <span className="text-sm font-semibold text-blue-400">{row.vantora}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {row.others === true ? (
                          <div className="flex justify-center">
                            <Check className="w-5 h-5 text-green-400" />
                          </div>
                        ) : row.others === false ? (
                          <div className="flex justify-center">
                            <span className="text-slate-600">—</span>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">{row.others}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Teaser */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600/20 via-purple-600/20 to-blue-600/20 rounded-3xl blur-3xl" />
          <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-8 sm:p-12 border border-white/10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 mb-6">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span className="text-sm font-medium text-pink-300">Premium Coming Soon</span>
            </div>
            <h3 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Get ready for <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">Pro features</span>
            </h3>
            <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
              We're working on exclusive features for power users. Want early access?
            </p>
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {[
                { icon: <TrendingUp className="w-6 h-6" />, title: 'Advanced Analytics', desc: 'Deeper insights' },
                { icon: <Sparkles className="w-6 h-6" />, title: 'Priority Support', desc: '24/7 help' },
                { icon: <Lock className="w-6 h-6" />, title: 'Early Access', desc: 'New features first' }
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-purple-400 mb-2 flex justify-center">{item.icon}</div>
                  <p className="text-white font-semibold text-sm mb-1">{item.title}</p>
                  <p className="text-slate-400 text-xs">{item.desc}</p>
                </div>
              ))}
            </div>
            <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/50">
              Join Waitlist
            </button>
          </div>
        </div>
      </div>

      {/* CTA Section - Better mobile design */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl sm:rounded-3xl blur-3xl opacity-20" />
          <div className="relative bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-8 sm:p-12 lg:p-16 border border-white/10 text-center">
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 sm:mb-6">
              Ready to get started?
            </h2>
            <p className="text-lg sm:text-xl text-slate-400 mb-8 sm:mb-12 max-w-2xl mx-auto">
              Join thousands of creators who trust Vantora to power their online presence.
            </p>
            <a
              href="/register"
              className="inline-flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-base sm:text-lg font-bold text-white shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/80 transition-all hover:scale-105"
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

        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
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

        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}