import type { Metadata } from 'next'
import BlogSection from '../../components/BlogSection'
import JsonLd from '../../components/JsonLd'
import { getAllBlogPosts, getBlogCategoriesForPosts, getBlogSchema } from '../../lib/blog'
import { SEO_KEYWORDS, absoluteUrl, getOgImageUrl, SITE_NAME } from '../../lib/site'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Engineering Notes',
  description: 'Story-driven notes on backend engineering, distributed systems, scaling, AI, and lessons learned from building production systems.',
  keywords: [...SEO_KEYWORDS, 'Engineering Blog', 'Backend Engineering Blog', 'Kafka Production Lessons', 'System Design Blog'],
  alternates: {
    canonical: absoluteUrl('/blog'),
    types: {
      'application/rss+xml': absoluteUrl('/rss.xml')
    }
  },
  openGraph: {
    title: 'Engineering Notes - Amit Kumar Singh',
    description: 'Production lessons on backend engineering, distributed systems, scaling, AI, and system design.',
    url: absoluteUrl('/blog'),
    siteName: SITE_NAME,
    type: 'website',
    images: [
      {
        url: getOgImageUrl('Engineering Notes', 'Backend Systems')
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Engineering Notes - Amit Kumar Singh',
    description: 'Production lessons on backend engineering, distributed systems, scaling, AI, and system design.',
    images: [getOgImageUrl('Engineering Notes', 'Backend Systems')]
  }
}

export default async function BlogPage() {
  const posts = await getAllBlogPosts()
  const categories = getBlogCategoriesForPosts(posts)

  return (
    <main className="mx-auto max-w-6xl px-4 pb-10 pt-24 sm:px-6 sm:pb-14 sm:pt-28">
      <JsonLd data={getBlogSchema(posts)} />
      <BlogSection posts={posts} categories={categories} />
    </main>
  )
}
