import type { Metadata } from 'next'
import './globals.css'
import CookieConsent from '@/components/ui/CookieConsent'

export const metadata: Metadata = {
  title: 'Vantora.id - Your Digital Identity',
  description: 'Build a beautiful bio link page with advanced analytics',
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