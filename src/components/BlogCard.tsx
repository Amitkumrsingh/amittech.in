"use client"

import Link from 'next/link'
import { motion } from '../lib/motion'
import motionTheme from '../lib/motionTheme'
import type { BlogPost } from '../data/blog'
import { formatPublishDate, getBlogPostPath } from '../lib/blog'
import { cn } from '../lib/classes'
import BlogCover from './BlogCover'

type BlogCardProps = {
  post: BlogPost
  index: number
  variant?: 'feature-row' | 'essay' | 'compact'
}

export default function BlogCard({ post, index, variant = 'essay' }: BlogCardProps) {
  if (variant === 'compact') return <CompactArticle post={post} index={index} />

  const isFeatureRow = variant === 'feature-row'

  return (
    <motion.article
      variants={motionTheme.variants.fadeUp(index * 0.025)}
      whileHover={{ y: -6 }}
      transition={{ duration: motionTheme.duration.base }}
      className={cn(
        'group border-t border-white/10 py-8',
        isFeatureRow ? 'grid gap-6 lg:grid-cols-[0.72fr_1fr] lg:items-center' : 'grid gap-5 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-start'
      )}
    >
      <Link href={getBlogPostPath(post)} className={cn('block', isFeatureRow ? 'lg:order-2' : undefined)} aria-label={`Read ${post.title}`}>
        <BlogCover post={post} quiet={!isFeatureRow} />
      </Link>

      <div className={isFeatureRow ? 'lg:order-1' : undefined}>
        <ArticleMeta post={post} />
        <Link href={getBlogPostPath(post)} className="block">
          <h3 className={cn('mt-4 max-w-3xl font-display font-semibold leading-tight text-white transition group-hover:text-secondary', isFeatureRow ? 'text-3xl sm:text-5xl' : 'text-2xl sm:text-3xl')}>
            {post.title}
          </h3>
        </Link>
        <p className={cn('mt-4 max-w-2xl leading-8 text-slate-200', isFeatureRow ? 'text-lg' : 'text-base')}>
          {post.hook}
        </p>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">{post.summary}</p>
        <ArticleTags tags={post.tags} />
      </div>
    </motion.article>
  )
}

function CompactArticle({ post, index }: { post: BlogPost; index: number }) {
  return (
    <motion.article
      variants={motionTheme.variants.fadeUp(index * 0.025)}
      whileHover={{ x: 4 }}
      transition={{ duration: motionTheme.duration.base }}
      className="group border-t border-white/10 py-5"
    >
      <ArticleMeta post={post} />
      <Link href={getBlogPostPath(post)} className="block">
        <h3 className="mt-3 text-xl font-display font-semibold leading-tight text-white transition group-hover:text-secondary">{post.title}</h3>
      </Link>
      <p className="mt-3 text-sm leading-6 text-slate-400">{post.hook}</p>
    </motion.article>
  )
}

export function ArticleMeta({ post }: { post: BlogPost }) {
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

export function ArticleTags({ tags, limit = 4 }: { tags: string[]; limit?: number }) {
  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {tags.slice(0, limit).map(tag => (
        <span key={tag} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">
          {tag}
        </span>
      ))}
    </div>
  )
}
