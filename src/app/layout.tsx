import '../styles/globals.css'
import LayoutWrapper from '../components/LayoutWrapper'
import { getOgImageUrl, SITE_NAME, SITE_URL } from '../lib/site'

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Amit Kumar Singh — Software Developer',
  description: 'Amit Kumar Singh is a product-minded Software Developer focused on distributed systems, event-driven architecture, and scalable payments platforms.',
  openGraph: {
    title: 'Amit Kumar Singh — Software Developer',
    description: 'Backend engineer focused on distributed systems, Kafka, cloud-native platforms, payments, AI systems, and system design.',
    url: SITE_URL,
    siteName: SITE_NAME,
    type: 'website',
    images: [
      {
        url: getOgImageUrl('Amit Kumar Singh', 'Backend Engineer')
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Amit Kumar Singh — Software Developer',
    description: 'Backend engineer focused on distributed systems, Kafka, cloud-native platforms, payments, AI systems, and system design.',
    images: [getOgImageUrl('Amit Kumar Singh', 'Backend Engineer')]
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
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
        <div className="min-h-screen">
          <LayoutWrapper>{children}</LayoutWrapper>
        </div>
      </body>
    </html>
  )
}
