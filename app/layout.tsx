import type { Metadata } from 'next'
import './globals.css'
import { TopNav } from '@/components/layout/TopNav'
import { AnimatePresenceWrapper } from '@/components/layout/AnimatePresenceWrapper'

export const metadata: Metadata = {
  title: 'Jeremy.ai — Financial Copilot for Homeownership',
  description: 'AI-native mortgage and homeownership guidance. From home search to financing to ownership intelligence.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <TopNav />
        <AnimatePresenceWrapper>
          {children}
        </AnimatePresenceWrapper>
      </body>
    </html>
  )
}
