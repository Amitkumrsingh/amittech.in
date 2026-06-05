import type { Metadata } from 'next'
import BlogSection from '../../components/BlogSection'
import JsonLd from '../../components/JsonLd'
import { getBlogPosts, getBlogSchema } from '../../lib/blog'
import { absoluteUrl, getOgImageUrl, SITE_NAME } from '../../lib/site'

export const metadata: Metadata = {
  title: 'Engineering Insights - Amit Kumar Singh',
  description: 'Backend engineering, distributed systems, Kafka, cloud, AI engineering, and system design insights from Amit Kumar Singh.',
  alternates: {
    canonical: absoluteUrl('/blog'),
    types: {
      'application/rss+xml': absoluteUrl('/rss.xml')
    }
  },
  openGraph: {
    title: 'Engineering Insights - Amit Kumar Singh',
    description: 'Production notes on backend engineering, distributed systems, Kafka, cloud, AI, and system design.',
    url: absoluteUrl('/blog'),
    siteName: SITE_NAME,
    type: 'website',
    images: [
      {
        url: getOgImageUrl('Engineering Insights', 'Backend Systems')
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Engineering Insights - Amit Kumar Singh',
    description: 'Production notes on backend engineering, distributed systems, Kafka, cloud, AI, and system design.',
    images: [getOgImageUrl('Engineering Insights', 'Backend Systems')]
  }
}

export default function BlogPage() {
  return (
    <main className="px-4 sm:px-6 py-8 sm:py-12 max-w-6xl mx-auto">
      <JsonLd data={getBlogSchema(getBlogPosts())} />
      <BlogSection />
    </main>
  )
}
