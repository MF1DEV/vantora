import type { Metadata } from 'next'
import './globals.css'
import CookieConsent from '@/components/ui/CookieConsent'

export const metadata: Metadata = {
  title: 'Vantora - Your Link in Bio Platform',
  description: 'Build a beautiful bio link page with advanced analytics',
  icons: {
    icon: [
      { url: '/icons/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon.svg', sizes: '128x128', type: 'image/svg+xml' },
    ],
    apple: '/icons/icon.svg',
  },
  openGraph: {
    title: 'Vantora - Your Link in Bio Platform',
    description: 'Build a beautiful bio link page with advanced analytics',
    images: ['/icons/og-image.svg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vantora - Your Link in Bio Platform',
    description: 'Build a beautiful bio link page with advanced analytics',
    images: ['/icons/og-image.svg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <CookieConsent />
      </body>
    </html>
  )
}