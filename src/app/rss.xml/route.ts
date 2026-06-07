import { getAllBlogPosts, getBlogPostPath } from '../../lib/blog'
import { absoluteUrl, SITE_NAME, SITE_URL } from '../../lib/site'

export const dynamic = 'force-dynamic'

export async function GET() {
  const posts = await getAllBlogPosts()

  const items = posts.map(post => {
    const url = absoluteUrl(getBlogPostPath(post))

    return `
      <item>
        <title>${escapeXml(post.title)}</title>
        <link>${url}</link>
        <guid>${url}</guid>
        <pubDate>${new Date(`${post.publishDate}T00:00:00.000Z`).toUTCString()}</pubDate>
        <category>${escapeXml(post.category)}</category>
        <description>${escapeXml(post.hook)}</description>
      </item>`
  }).join('')

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0">
      <channel>
        <title>${escapeXml(`${SITE_NAME} Engineering Notes`)}</title>
        <link>${SITE_URL}</link>
        <description>${escapeXml('Story-driven notes on backend engineering, distributed systems, scaling, AI, and production lessons.')}</description>
        <language>en</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        ${items}
      </channel>
    </rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8'
    }
  })
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
