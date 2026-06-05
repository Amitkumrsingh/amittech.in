import type { MetadataRoute } from 'next'
import { getBlogPostPath, getBlogPosts } from '../lib/blog'
import { absoluteUrl } from '../lib/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return [
    {
      url: absoluteUrl('/'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1
    },
    {
      url: absoluteUrl('/blog'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9
    },
    ...getBlogPosts().map(post => ({
      url: absoluteUrl(getBlogPostPath(post)),
      lastModified: new Date(`${post.publishDate}T00:00:00.000Z`),
      changeFrequency: 'monthly' as const,
      priority: post.featured ? 0.85 : 0.72
    }))
  ]
}
