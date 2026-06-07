import type { MetadataRoute } from 'next'
import { getAllBlogPosts, getBlogPostPath } from '../lib/blog'
import { absoluteUrl } from '../lib/site'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const posts = await getAllBlogPosts()

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
    ...posts.map(post => ({
      url: absoluteUrl(getBlogPostPath(post)),
      lastModified: new Date(`${post.updatedDate || post.publishDate}T00:00:00.000Z`),
      changeFrequency: 'monthly' as const,
      priority: post.featured ? 0.85 : 0.72
    }))
  ]
}
