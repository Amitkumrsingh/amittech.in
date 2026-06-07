import { BLOG_FILTER_ALL } from './blog.config'
import type { BlogCategoryFilter, BlogPost } from './blog.types'

export function filterBlogPosts(posts: BlogPost[], activeCategory: BlogCategoryFilter, query: string) {
  const normalizedQuery = query.trim().toLowerCase()

  return posts.filter(post => {
    const categoryMatch = activeCategory === BLOG_FILTER_ALL || post.category === activeCategory
    if (!categoryMatch) return false

    if (!normalizedQuery) return true

    return getBlogSearchText(post).includes(normalizedQuery)
  })
}

export function getBlogCategoryCount(posts: BlogPost[], category: BlogCategoryFilter) {
  if (category === BLOG_FILTER_ALL) return posts.length
  return posts.filter(post => post.category === category).length
}

function getBlogSearchText(post: BlogPost) {
  return [
    post.title,
    post.summary,
    post.hook,
    post.category,
    ...post.tags,
    ...(post.takeaways || []),
    ...(post.productionNotes || [])
  ].join(' ').toLowerCase()
}
