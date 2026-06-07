import { BLOG_POSTS } from '../data/blog'
import { BLOG_CATEGORIES, type BlogCategory, type BlogPost } from '../features/blog'
import { absoluteUrl, SITE_NAME, SITE_URL } from './site'

type BlogSourceAdapter = {
  listPosts: () => readonly BlogPost[]
  listCategories: () => readonly BlogCategory[]
  getPostBySlug: (slug: string) => BlogPost | undefined
}

type CmsPostRecord = {
  slug: string
  title: string
  excerpt: string | null
  sanitizedHtml: string | null
  coverImage: string | null
  category: { name: string } | null
  tags: Array<{ name: string }>
  readingTime: number
  publishedAt: Date | string | null
  createdAt: Date | string
  updatedAt: Date | string
  metaTitle: string | null
  metaDescription: string | null
  ogImage: string | null
  isFeatured: boolean
  author: {
    name: string
  }
}

const staticBlogSource: BlogSourceAdapter = {
  listPosts: () => BLOG_POSTS,
  listCategories: () => BLOG_CATEGORIES,
  getPostBySlug: (slug) => BLOG_POSTS.find(post => post.slug === slug)
}

// Future adapters can implement this same contract for Markdown, MDX,
// Contentlayer, Notion, or a headless CMS without changing the UI.
const blogSource: BlogSourceAdapter = staticBlogSource

export function getBlogPosts() {
  return sortPostsByPublishDate(blogSource.listPosts())
}

export async function getAllBlogPosts() {
  const cmsPosts = await getPublishedCmsBlogPosts()
  return sortPostsByPublishDate(dedupePostsBySlug([...cmsPosts, ...getBlogPosts()]))
}

export function getFeaturedPost(posts = getBlogPosts()) {
  return posts.find(post => post.featured) ?? posts[0]
}

export function getLatestPosts(posts = getBlogPosts()) {
  const featured = getFeaturedPost(posts)
  return posts.filter(post => post.slug !== featured?.slug)
}

export function getBlogCategories() {
  return blogSource.listCategories()
}

export function getBlogCategoriesForPosts(posts: readonly BlogPost[]) {
  return Array.from(new Set([...BLOG_CATEGORIES, ...posts.map(post => post.category)])).filter(Boolean).sort()
}

export function getBlogPost(slug: string) {
  return blogSource.getPostBySlug(slug)
}

export async function getBlogPostBySlug(slug: string) {
  return getBlogPost(slug) ?? await getPublishedCmsBlogPost(slug)
}

export function getBlogPostPath(post: BlogPost) {
  return `/blog/${post.slug}`
}

export function getBlogPostUrl(post: BlogPost) {
  return absoluteUrl(getBlogPostPath(post))
}

export function getRelatedPosts(post: BlogPost, limit = 3, posts = getBlogPosts()) {
  return posts
    .filter(candidate => candidate.slug !== post.slug)
    .sort((a, b) => {
      const categoryScore = Number(b.category === post.category) - Number(a.category === post.category)
      if (categoryScore !== 0) return categoryScore

      const aTagScore = a.tags.filter(tag => post.tags.includes(tag)).length
      const bTagScore = b.tags.filter(tag => post.tags.includes(tag)).length
      return bTagScore - aTagScore
    })
    .slice(0, limit)
}

function sortPostsByPublishDate(posts: readonly BlogPost[]) {
  return [...posts].sort((a, b) => b.publishDate.localeCompare(a.publishDate))
}

function dedupePostsBySlug(posts: readonly BlogPost[]) {
  const seen = new Set<string>()
  return posts.filter(post => {
    if (seen.has(post.slug)) return false
    seen.add(post.slug)
    return true
  })
}

export function formatPublishDate(date: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(`${date}T00:00:00.000Z`))
}

export function getBlogSchema(posts = getBlogPosts()) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${SITE_NAME} Engineering Notes`,
    url: absoluteUrl('/blog'),
    description: 'Story-driven notes on backend engineering, distributed systems, scaling, AI, and lessons learned from building production systems.',
    publisher: {
      '@type': 'Person',
      name: SITE_NAME,
      url: SITE_URL,
      jobTitle: 'Backend Engineer'
    },
    blogPost: posts.map(post => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: getBlogPostUrl(post),
      datePublished: post.publishDate,
      dateModified: post.updatedDate || post.publishDate,
      articleSection: post.category,
      keywords: post.tags.join(', '),
      description: post.hook,
      timeRequired: `PT${post.readingMinutes}M`,
      author: {
        '@type': 'Person',
        name: post.authorName || SITE_NAME
      }
    }))
  }
}

export function getArticleSchema(post: BlogPost) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: post.title,
    url: getBlogPostUrl(post),
    datePublished: post.publishDate,
    dateModified: post.updatedDate || post.publishDate,
    author: {
      '@type': 'Person',
      name: post.authorName || SITE_NAME,
      jobTitle: 'Backend Engineer'
    },
    publisher: {
      '@type': 'Person',
      name: SITE_NAME
    },
    articleSection: post.category,
    keywords: post.tags.join(', '),
    description: post.hook,
    timeRequired: `PT${post.readingMinutes}M`,
    image: post.coverImage || undefined
  }
}

async function getPublishedCmsBlogPosts() {
  if (!process.env.DATABASE_URL) return []

  try {
    const { prisma } = await import('./api/prisma')
    const posts = await prisma.post.findMany({
      where: {
        status: 'PUBLISHED',
        deletedAt: null
      },
      include: cmsPostInclude,
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }]
    })

    return posts.map(mapCmsPostToBlogPost)
  } catch (error) {
    console.error('[blog-cms] Failed to load published posts', error)
    return []
  }
}

async function getPublishedCmsBlogPost(slug: string) {
  if (!process.env.DATABASE_URL) return undefined

  try {
    const { prisma } = await import('./api/prisma')
    const post = await prisma.post.findFirst({
      where: {
        slug,
        status: 'PUBLISHED',
        deletedAt: null
      },
      include: cmsPostInclude
    })

    return post ? mapCmsPostToBlogPost(post) : undefined
  } catch (error) {
    console.error('[blog-cms] Failed to load post', error)
    return undefined
  }
}

const cmsPostInclude = {
  category: {
    select: {
      name: true
    }
  },
  tags: {
    select: {
      name: true
    }
  },
  author: {
    select: {
      name: true
    }
  }
} as const

function mapCmsPostToBlogPost(post: CmsPostRecord): BlogPost {
  const category = post.category?.name || 'Production Engineering'
  const { html, toc } = normalizeCmsHtml(post.sanitizedHtml || '')
  const summary = post.excerpt || post.metaDescription || `A production note by ${post.author.name}.`
  const hook = post.excerpt || post.metaDescription || 'A practical engineering note from building and operating production systems.'

  return {
    slug: post.slug,
    title: post.metaTitle || post.title,
    category,
    publishDate: toDateOnly(post.publishedAt || post.createdAt),
    updatedDate: toDateOnly(post.updatedAt),
    readingMinutes: Math.max(1, post.readingTime || 1),
    summary,
    hook,
    tags: post.tags.map(tag => tag.name),
    featured: post.isFeatured,
    source: 'cms',
    authorName: post.author.name,
    coverImage: post.coverImage || post.ogImage,
    html,
    toc,
    cover: {
      kicker: category,
      metric: post.title.length > 42 ? `${post.title.slice(0, 39)}...` : post.title,
      gradient: getCmsCoverGradient(category),
      accent: getCmsCoverAccent(category),
      motif: getCmsCoverMotif(category)
    },
    sections: [],
    takeaways: [],
    productionNotes: []
  }
}

function normalizeCmsHtml(html: string) {
  if (!html) return { html: '', toc: [] }

  const usedIds = new Set<string>()
  const toc: Array<{ id: string; title: string }> = []
  const normalizedHtml = html.replace(/<h([2-3])([^>]*)>(.*?)<\/h\1>/gi, (match, level: string, attributes: string, innerHtml: string) => {
    const existingId = attributes.match(/\sid=["']([^"']+)["']/i)?.[1]
    const title = stripHtml(innerHtml).trim()
    if (!title) return match

    const id = uniqueId(existingId || slugifyText(title), usedIds)
    toc.push({ id, title })
    return existingId ? match : `<h${level}${attributes} id="${id}">${innerHtml}</h${level}>`
  })

  return { html: normalizedHtml, toc }
}

function uniqueId(baseValue: string, usedIds: Set<string>) {
  const base = baseValue || 'section'
  let candidate = base
  let index = 2
  while (usedIds.has(candidate)) {
    candidate = `${base}-${index}`
    index += 1
  }
  usedIds.add(candidate)
  return candidate
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, '')
}

function slugifyText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toDateOnly(value: Date | string) {
  return new Date(value).toISOString().slice(0, 10)
}

function getCmsCoverGradient(category: string) {
  const normalized = category.toLowerCase()
  if (normalized.includes('database')) return 'from-emerald-400/25 via-cyan-400/20 to-violet-500/25'
  if (normalized.includes('ai')) return 'from-fuchsia-500/25 via-violet-500/20 to-cyan-400/25'
  if (normalized.includes('cloud') || normalized.includes('devops')) return 'from-sky-400/25 via-cyan-400/20 to-violet-500/25'
  if (normalized.includes('career')) return 'from-amber-400/25 via-rose-400/20 to-cyan-400/25'
  if (normalized.includes('system')) return 'from-violet-500/25 via-cyan-400/20 to-emerald-400/25'
  return 'from-cyan-400/25 via-violet-500/20 to-rose-500/25'
}

function getCmsCoverAccent(category: string) {
  const normalized = category.toLowerCase()
  if (normalized.includes('database')) return 'bg-emerald-300'
  if (normalized.includes('ai')) return 'bg-fuchsia-300'
  if (normalized.includes('career')) return 'bg-gold'
  return 'bg-cyan-300'
}

function getCmsCoverMotif(category: string): BlogPost['cover']['motif'] {
  const normalized = category.toLowerCase()
  if (normalized.includes('database')) return 'database'
  if (normalized.includes('ai')) return 'ai'
  if (normalized.includes('career')) return 'career'
  if (normalized.includes('cloud') || normalized.includes('devops')) return 'cloud'
  if (normalized.includes('event') || normalized.includes('kafka')) return 'events'
  return 'systems'
}
