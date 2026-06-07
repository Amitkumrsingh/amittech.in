import type { BlogPost } from '../features/blog'
import { formatPublishDate } from '../lib/blog'

export default function ArticleMeta({ post }: { post: BlogPost }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
      <span className="text-secondary">{post.category}</span>
      <span className="text-slate-700">/</span>
      <span>{formatPublishDate(post.publishDate)}</span>
      <span className="text-slate-700">/</span>
      <span>{post.readingMinutes} min read</span>
    </div>
  )
}
