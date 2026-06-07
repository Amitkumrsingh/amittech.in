"use client"

import Link from 'next/link'
import { motion } from '../lib/motion'
import motionTheme from '../lib/motionTheme'
import type { BlogPost } from '../features/blog'
import { getBlogPostPath } from '../lib/blog'
import ArticleMeta from './ArticleMeta'
import ArticleTags from './ArticleTags'
import BlogCover from './BlogCover'

export default function FeaturedBlogCard({ post }: { post: BlogPost }) {
  return (
    <motion.article
      variants={motionTheme.variants.fadeUp()}
      initial="hidden"
      animate="show"
      className="relative overflow-hidden border-y border-white/10 py-8 sm:py-10"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary/70 to-transparent" />
      <div className="grid gap-7 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
        <Link href={getBlogPostPath(post)} className="block" aria-label={`Read featured article: ${post.title}`}>
          <BlogCover post={post} featured />
        </Link>

        <div className="lg:pl-4">
          <div className="inline-flex rounded-full border border-secondary/20 bg-secondary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
            Featured Note
          </div>
          <div className="mt-5">
            <ArticleMeta post={post} />
          </div>
          <Link href={getBlogPostPath(post)} className="block">
            <h2 className="mt-5 max-w-3xl text-4xl font-display font-semibold leading-tight text-white transition hover:text-secondary sm:text-6xl">
              {post.title}
            </h2>
          </Link>
          <p className="mt-6 max-w-2xl text-xl leading-9 text-slate-100">{post.hook}</p>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-400">{post.summary}</p>
          <ArticleTags tags={post.tags} limit={6} />

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={getBlogPostPath(post)}
              className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-secondary to-accent px-6 text-sm font-semibold text-black shadow-[0_24px_90px_-48px_rgba(236,72,153,0.7)] transition hover:-translate-y-0.5"
            >
              Read the story
            </Link>
            <a
              href="#latest-notes"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 text-sm font-semibold text-white transition hover:border-secondary/60 hover:bg-white/10"
            >
              Browse notes
            </a>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
