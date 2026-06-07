import type { BLOG_CATEGORIES, BLOG_FILTER_ALL } from './blog.config'

export type BlogCategory = typeof BLOG_CATEGORIES[number]
export type BlogCategoryFilter = typeof BLOG_FILTER_ALL | BlogCategory

export type BlogSection = {
  id: string
  title: string
  body: string[]
}

export type BlogCoverMotif = 'events' | 'database' | 'systems' | 'ai' | 'career' | 'cloud'

export type BlogPost = {
  slug: string
  title: string
  category: BlogCategory
  publishDate: string
  readingMinutes: number
  summary: string
  hook: string
  tags: string[]
  featured?: boolean
  cover: {
    kicker: string
    metric: string
    gradient: string
    accent: string
    motif: BlogCoverMotif
  }
  takeaways: string[]
  sections: BlogSection[]
  productionNotes: string[]
}
