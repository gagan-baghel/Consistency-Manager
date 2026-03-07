import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { UserProvider } from '@/contexts/UserContext'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://earnings-tracker.gaganbaghel.com'),
  title: 'Earnings & Sprints Tracker',
  description: 'Track your weekly earnings and execute focused 15-day sprints to achieve peak productivity and financial goals.',
  generator: 'v0.app',
  keywords: ['productivity', 'earnings tracker', 'sprint planner', 'goal setting', 'finance tracker'],
  authors: [{ name: 'Gagan Baghel', url: 'https://gaganbaghel.com' }],
  openGraph: {
    title: 'Earnings & Sprints Tracker',
    description: 'Track your weekly earnings and execute focused 15-day sprints to achieve peak productivity and financial goals.',
    url: 'https://earnings-tracker.gaganbaghel.com',
    siteName: 'Earnings & Sprints Tracker',
    images: [
      {
        url: '/appScreenshot.png',
        width: 1200,
        height: 630,
        alt: 'Earnings and Sprints Tracker Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Earnings & Sprints Tracker',
    description: 'Track your weekly earnings and execute focused 15-day sprints to achieve peak productivity and financial goals.',
    creator: '@gagan_baghel',
    images: ['/appScreenshot.png'],
  },
  icons: {
    icon: [
      {
        url: '/icon.png',
        type: 'image/png',
      },
      {
        url: '/favicon.ico',
        type: 'image/x-icon',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          forcedTheme="light"
          disableTransitionOnChange
        >
          <UserProvider>
            {children}
            <Toaster richColors position="top-right" />
            <Analytics />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
