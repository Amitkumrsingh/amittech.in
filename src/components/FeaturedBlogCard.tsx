"use client"

import { motion } from '../lib/motion'
import motionTheme from '../lib/motionTheme'
import type { BlogPost } from '../data/blog'
import { formatPublishDate, getBlogPostPath } from '../lib/blog'
import BlogCover from './BlogCover'
import ButtonLink from './ButtonLink'

export default function FeaturedBlogCard({ post }: { post: BlogPost }) {
  return (
    <motion.article
      variants={motionTheme.variants.fadeUp()}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className="grid gap-5 overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-4 shadow-[0_50px_140px_-95px_rgba(124,58,237,0.72)] backdrop-blur-2xl lg:grid-cols-[1.08fr_0.92fr]"
    >
      <BlogCover post={post} featured />
      <div className="flex flex-col justify-between p-2 sm:p-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
            <span className="rounded-full bg-secondary/15 px-3 py-1 text-secondary">Featured insight</span>
            <span>{formatPublishDate(post.publishDate)}</span>
            <span className="text-slate-600">/</span>
            <span>{post.readingMinutes} min read</span>
          </div>
          <h3 className="mt-5 text-2xl sm:text-3xl font-display font-semibold leading-tight text-white">{post.title}</h3>
          <p className="mt-4 text-sm sm:text-base leading-7 text-slate-300">{post.summary}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">{tag}</span>
            ))}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <ButtonLink href={getBlogPostPath(post)} variant="gradient">
            Read featured article
          </ButtonLink>
          <a href="#latest-insights" className="inline-flex items-center justify-center rounded-3xl border border-white/10 bg-white/5 px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-white transition hover:bg-white/10">
            Explore latest
          </a>
        </div>
      </div>
    </motion.article>
  )
}
