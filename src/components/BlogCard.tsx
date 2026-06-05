"use client"

import { motion } from '../lib/motion'
import motionTheme from '../lib/motionTheme'
import type { BlogPost } from '../data/blog'
import { formatPublishDate, getBlogPostPath } from '../lib/blog'
import BlogCover from './BlogCover'

type BlogCardProps = {
  post: BlogPost
  index: number
}

export default function BlogCard({ post, index }: BlogCardProps) {
  return (
    <motion.article
      variants={motionTheme.variants.fadeUp(index * 0.03)}
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ duration: motionTheme.duration.base }}
      className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-3 shadow-[0_35px_110px_-90px_rgba(34,211,238,0.55)] backdrop-blur-2xl"
    >
      <a href={getBlogPostPath(post)} className="block">
        <BlogCover post={post} />
        <div className="p-3 sm:p-4">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
            <span>{formatPublishDate(post.publishDate)}</span>
            <span className="text-slate-600">/</span>
            <span>{post.readingMinutes} min read</span>
          </div>
          <h3 className="mt-3 text-lg font-semibold leading-snug text-white transition group-hover:text-secondary">{post.title}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">{post.summary}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.slice(0, 4).map(tag => (
              <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">{tag}</span>
            ))}
          </div>
        </div>
      </a>
    </motion.article>
  )
}
