import type { BlogPost } from './blog.types'

const ARTICLE_TAIL_SECTIONS = [
  { id: 'lessons', title: 'What I took away' },
  { id: 'production-notes', title: 'Production notes' }
] as const

export function getArticleTocItems(post: BlogPost) {
  if (post.toc?.length) return post.toc

  return [
    ...(post.sections || []).map(section => ({ id: section.id, title: section.title })),
    ...(post.takeaways?.length ? [ARTICLE_TAIL_SECTIONS[0]] : []),
    ...(post.productionNotes?.length ? [ARTICLE_TAIL_SECTIONS[1]] : [])
  ]
}
