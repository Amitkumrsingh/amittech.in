import type { BlogPost } from './blog.types'

const ARTICLE_TAIL_SECTIONS = [
  { id: 'lessons', title: 'What I took away' },
  { id: 'production-notes', title: 'Production notes' }
] as const

export function getArticleTocItems(post: BlogPost) {
  return [
    ...post.sections.map(section => ({ id: section.id, title: section.title })),
    ...ARTICLE_TAIL_SECTIONS
  ]
}
