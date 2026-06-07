import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Hero from '../components/Hero'
import JsonLd from '../components/JsonLd'
import PageTransition from '../components/PageTransition'
import { getOgImageUrl, SEO_KEYWORDS, SITE_DESCRIPTION, SITE_TITLE, absoluteUrl } from '../lib/site'
import { getPersonSchema, getProfilePageSchema, getWebsiteSchema } from '../lib/seo'

const InteractiveArea = dynamic(() => import('../components/InteractiveArea'), { ssr: false })

export const metadata: Metadata = {
  title: {
    absolute: SITE_TITLE
  },
  description: SITE_DESCRIPTION,
  keywords: SEO_KEYWORDS,
  alternates: {
    canonical: absoluteUrl('/')
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: absoluteUrl('/'),
    type: 'profile',
    images: [
      {
        url: getOgImageUrl('Amit Kumar Singh', 'Backend Engineer')
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [getOgImageUrl('Amit Kumar Singh', 'Backend Engineer')]
  }
}

export default function Page() {
  return (
    <PageTransition>
      <main className="px-4 sm:px-6 pb-8 pt-24 sm:pb-12 sm:pt-28 max-w-6xl mx-auto">
        <JsonLd data={getPersonSchema()} />
        <JsonLd data={getWebsiteSchema()} />
        <JsonLd data={getProfilePageSchema()} />
        <Hero />
        <InteractiveArea />
      </main>
    </PageTransition>
  )
}
