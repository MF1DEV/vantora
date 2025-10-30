export const getBackgroundClass = (background: string) => {
  const backgrounds: { [key: string]: string } = {
    'gradient-blue': 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900',
    'gradient-purple': 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900',
    'gradient-pink': 'bg-gradient-to-br from-slate-900 via-pink-900 to-slate-900',
    'gradient-green': 'bg-gradient-to-br from-slate-900 via-green-900 to-slate-900',
    'gradient-sunset': 'bg-gradient-to-br from-orange-900 via-red-900 to-purple-900',
    'gradient-ocean': 'bg-gradient-to-br from-blue-900 via-cyan-900 to-teal-900',
    'gradient-forest': 'bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900',
    'gradient-midnight': 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900',
    'solid-dark': 'bg-slate-900',
    'solid-black': 'bg-black',
  }
  return backgrounds[background] || backgrounds['gradient-blue']
}

export const getButtonStyleClass = (style: string) => {
  const styles: { [key: string]: string } = {
    'rounded': 'rounded-xl',
    'pill': 'rounded-full',
    'square': 'rounded-lg',
    'sharp': 'rounded-none',
  }
  return styles[style] || styles['rounded']
}

export const getAccentColorClasses = (color: string) => {
  const colors: { [key: string]: { bg: string, hover: string, border: string } } = {
    'blue': { bg: 'bg-blue-600', hover: 'hover:bg-blue-700', border: 'hover:border-blue-500' },
    'purple': { bg: 'bg-purple-600', hover: 'hover:bg-purple-700', border: 'hover:border-purple-500' },
    'pink': { bg: 'bg-pink-600', hover: 'hover:bg-pink-700', border: 'hover:border-pink-500' },
    'green': { bg: 'bg-green-600', hover: 'hover:bg-green-700', border: 'hover:border-green-500' },
    'orange': { bg: 'bg-orange-600', hover: 'hover:bg-orange-700', border: 'hover:border-orange-500' },
    'red': { bg: 'bg-red-600', hover: 'hover:bg-red-700', border: 'hover:border-red-500' },
  }
  return colors[color] || colors['blue']
}