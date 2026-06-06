import { BLOG_CATEGORIES, BLOG_POSTS, type BlogCategory, type BlogPost } from '../data/blog'
import { absoluteUrl, SITE_NAME, SITE_URL } from './site'

type BlogSourceAdapter = {
  listPosts: () => BlogPost[]
  listCategories: () => readonly BlogCategory[]
  getPostBySlug: (slug: string) => BlogPost | undefined
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
  return [...blogSource.listPosts()].sort((a, b) => b.publishDate.localeCompare(a.publishDate))
}

export function getFeaturedPost() {
  return getBlogPosts().find(post => post.featured) ?? getBlogPosts()[0]
}

export function getLatestPosts() {
  const featured = getFeaturedPost()
  return getBlogPosts().filter(post => post.slug !== featured?.slug)
}

export function getBlogCategories() {
  return blogSource.listCategories()
}

export function getBlogPost(slug: string) {
  return blogSource.getPostBySlug(slug)
}

export function getBlogPostPath(post: BlogPost) {
  return `/blog/${post.slug}`
}

export function getBlogPostUrl(post: BlogPost) {
  return absoluteUrl(getBlogPostPath(post))
}

export function getRelatedPosts(post: BlogPost, limit = 3) {
  return getBlogPosts()
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
    name: `${SITE_NAME} Engineering Insights`,
    url: absoluteUrl('/blog'),
    description: 'Backend engineering, distributed systems, Kafka, cloud, AI engineering, and system design insights from Amit Kumar Singh.',
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
      dateModified: post.publishDate,
      articleSection: post.category,
      keywords: post.tags.join(', '),
      description: post.summary,
      timeRequired: `PT${post.readingMinutes}M`,
      author: {
        '@type': 'Person',
        name: SITE_NAME
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
    dateModified: post.publishDate,
    author: {
      '@type': 'Person',
      name: SITE_NAME,
      jobTitle: 'Backend Engineer'
    },
    publisher: {
      '@type': 'Person',
      name: SITE_NAME
    },
    articleSection: post.category,
    keywords: post.tags.join(', '),
    description: post.summary,
    timeRequired: `PT${post.readingMinutes}M`
  }
}
