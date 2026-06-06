"use client"

import { useEffect, useMemo, useState } from 'react'
import { motion } from '../lib/motion'
import motionTheme from '../lib/motionTheme'
import { getBlogCategories, getFeaturedPost, getLatestPosts } from '../lib/blog'
import type { BlogCategory, BlogPost } from '../data/blog'
import SectionHeader from './SectionHeader'
import FeaturedBlogCard from './FeaturedBlogCard'
import BlogCard from './BlogCard'

const ALL_CATEGORIES = 'All Topics'
const INITIAL_VISIBLE_POSTS = 9

type CategoryFilter = typeof ALL_CATEGORIES | BlogCategory

export default function BlogSection() {
  const featuredPost = getFeaturedPost()
  const latestPosts = getLatestPosts()
  const categories = getBlogCategories()
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>(ALL_CATEGORIES)
  const [query, setQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_POSTS)

  const filteredPosts = useMemo(() => {
    return filterPosts(latestPosts, activeCategory, query)
  }, [activeCategory, latestPosts, query])

  const visiblePosts = filteredPosts.slice(0, visibleCount)
  const hasMore = visibleCount < filteredPosts.length

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_POSTS)
  }, [activeCategory, query])

  return (
    <section id="blog" className="mt-16">
      <SectionHeader
        eyebrow="Engineering insights"
        title="Architecture notes from backend systems, Kafka pipelines, cloud platforms, and AI products."
        description="Technical writing that shows how I think about scale, reliability, production tradeoffs, and system design."
      />

      {featuredPost ? (
        <div className="mt-8">
          <FeaturedBlogCard post={featuredPost} />
        </div>
      ) : null}

      <div id="latest-insights" className="mt-8 rounded-[32px] border border-white/10 bg-[#12121A]/70 p-4 sm:p-6 shadow-[0_40px_120px_-95px_rgba(6,182,212,0.5)] backdrop-blur-2xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Latest articles</p>
            <p className="mt-2 text-sm text-slate-300">{filteredPosts.length} insights across backend engineering, distributed systems, and AI.</p>
          </div>
          <label className="relative block w-full lg:max-w-sm">
            <span className="sr-only">Search engineering insights</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search insights"
              className="h-12 w-full rounded-full border border-white/10 bg-white/5 px-5 text-sm text-white placeholder:text-slate-500 transition focus:border-secondary/60 focus:bg-white/10"
            />
          </label>
        </div>

        <CategoryFilters categories={categories} activeCategory={activeCategory} onChange={setActiveCategory} />

        <motion.div
          key={`${activeCategory}-${query}`}
          className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
          variants={motionTheme.variants.containerStagger(0.04)}
          initial="hidden"
          animate="show"
        >
          {visiblePosts.map((post, index) => (
            <BlogCard key={post.slug} post={post} index={index} />
          ))}
        </motion.div>

        {hasMore ? (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setVisibleCount(count => count + 6)}
              className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-secondary/70 hover:bg-white/10"
            >
              Load more insights
            </button>
          </div>
        ) : null}

        {filteredPosts.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
            No insights match this filter yet.
          </div>
        ) : null}
      </div>
    </section>
  )
}

function CategoryFilters({
  categories,
  activeCategory,
  onChange
}: {
  categories: readonly BlogCategory[]
  activeCategory: CategoryFilter
  onChange: (category: CategoryFilter) => void
}) {
  const filters: CategoryFilter[] = [ALL_CATEGORIES, ...categories]

  return (
    <motion.div className="mt-5 flex gap-2 overflow-x-auto pb-2" variants={motionTheme.variants.containerStagger(0.025)} initial="hidden" whileInView="show" viewport={{ once: true }}>
      {filters.map((category, index) => {
        const active = activeCategory === category

        return (
          <motion.button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            variants={motionTheme.variants.fadeUp(index * 0.01)}
            whileHover={{ y: -2 }}
            className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${active ? 'border-secondary bg-secondary/15 text-secondary shadow-[0_18px_60px_-42px_rgba(6,182,212,0.8)]' : 'border-white/10 bg-white/5 text-slate-300 hover:border-secondary/70 hover:bg-white/10'}`}
            aria-pressed={active}
          >
            {category}
          </motion.button>
        )
      })}
    </motion.div>
  )
}

function filterPosts(posts: BlogPost[], activeCategory: CategoryFilter, query: string) {
  const normalizedQuery = query.trim().toLowerCase()

  return posts.filter(post => {
    const categoryMatch = activeCategory === ALL_CATEGORIES || post.category === activeCategory
    if (!categoryMatch) return false

    if (!normalizedQuery) return true

    const searchText = [
      post.title,
      post.summary,
      post.category,
      ...post.tags
    ].join(' ').toLowerCase()

    return searchText.includes(normalizedQuery)
  })
}
