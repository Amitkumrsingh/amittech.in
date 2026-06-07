import type { BLOG_FILTER_ALL } from './blog.config'

export type BlogCategory = string
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
  updatedDate?: string
  readingMinutes: number
  summary: string
  hook: string
  tags: string[]
  featured?: boolean
  source?: 'static' | 'cms'
  authorName?: string
  coverImage?: string | null
  html?: string | null
  toc?: Array<{ id: string; title: string }>
  cover: {
    kicker: string
    metric: string
    gradient: string
    accent: string
    motif: BlogCoverMotif
  }
  takeaways?: string[]
  sections?: BlogSection[]
  productionNotes?: string[]
}
