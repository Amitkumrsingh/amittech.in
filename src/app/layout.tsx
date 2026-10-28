import '../styles/globals.css'
import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import LayoutWrapper from '../components/LayoutWrapper'
import MonitoringClient from '../components/MonitoringClient'
import { getOgImageUrl, SEO_KEYWORDS, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL, absoluteUrl } from '../lib/site'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: 'AmitTech',
  title: {
    default: SITE_TITLE,
    template: '%s | Amit Kumar Singh'
  },
  description: SITE_DESCRIPTION,
  keywords: SEO_KEYWORDS,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'technology',
  alternates: {
    canonical: absoluteUrl('/'),
    types: {
      'application/rss+xml': absoluteUrl('/rss.xml')
    }
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon', type: 'image/png', sizes: '32x32' }
    ],
    apple: [{ url: '/apple-icon', sizes: '180x180', type: 'image/png' }]
  },
  manifest: '/manifest.webmanifest',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1
    }
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: getOgImageUrl('Amit Kumar Singh', 'Backend Engineer'),
        width: 1200,
        height: 630,
        alt: 'Amit Kumar Singh - Backend Engineer'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [getOgImageUrl('Amit Kumar Singh', 'Backend Engineer')]
  },
  other: {
    'profile:first_name': 'Amit',
    'profile:last_name': 'Kumar Singh'
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0A0A0F',
  colorScheme: 'dark'
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Preload self-hosted fonts (files created by scripts/download-fonts.sh) */}
        <link rel="preload" href="/fonts/xMQOuFFYT72X5wkB_18qmnndmSeMmX-K.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPQ.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        {process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ? (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}`}></script>
            <script dangerouslySetInnerHTML={{ __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}');` }} />
          </>
        ) : null}
      </head>
      <body className="bg-bg text-white antialiased">
        <MonitoringClient />
        <div className="min-h-screen">
          <LayoutWrapper>{children}</LayoutWrapper>
        </div>
      </body>
    </html>
  )
}
