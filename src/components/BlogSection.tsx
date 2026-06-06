"use client"

import { useEffect, useMemo, useState } from 'react'
import { motion } from '../lib/motion'
import motionTheme from '../lib/motionTheme'
import { getBlogCategories, getFeaturedPost, getLatestPosts } from '../lib/blog'
import type { BlogCategory, BlogPost } from '../data/blog'
import BlogCard from './BlogCard'
import FeaturedBlogCard from './FeaturedBlogCard'

const ALL_CATEGORIES = 'All Notes'
const INITIAL_VISIBLE_POSTS = 10

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
  const leadPost = visiblePosts[0]
  const articleRows = visiblePosts.slice(1, 7)
  const briefPosts = visiblePosts.slice(7)
  const hasMore = visibleCount < filteredPosts.length

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_POSTS)
  }, [activeCategory, query])

  return (
    <section id="blog" className="relative">
      <div className="pointer-events-none absolute inset-x-1/2 top-6 -z-10 h-80 w-[70vw] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.18),transparent_62%)] blur-3xl" />

      <header className="border-b border-white/10 pb-10 pt-4 sm:pt-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-secondary">Amit Kumar Singh / Engineering Publication</p>
            <h1 className="mt-5 text-5xl font-display font-semibold leading-[0.98] text-white sm:text-7xl lg:text-8xl">Engineering Notes</h1>
            <p className="mt-6 max-w-3xl text-lg leading-9 text-slate-300">
              Thoughts on backend engineering, distributed systems, scaling, AI, and lessons learned from building production systems.
            </p>
          </div>

          <div className="grid gap-3 border-l border-white/10 pl-5 text-sm text-slate-400 sm:grid-cols-3 lg:max-w-sm lg:grid-cols-1">
            <EditorialStat label="Focus" value="Production lessons" />
            <EditorialStat label="Archive" value={`${latestPosts.length + (featuredPost ? 1 : 0)} field notes`} />
            <EditorialStat label="Voice" value="Story-driven engineering" />
          </div>
        </div>
      </header>

      {featuredPost ? (
        <div className="mt-8">
          <FeaturedBlogCard post={featuredPost} />
        </div>
      ) : null}

      <div id="latest-notes" className="mt-10 grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-[28px] border border-white/10 bg-[#10131B]/80 p-4 shadow-[0_30px_100px_-80px_rgba(6,182,212,0.55)] backdrop-blur-2xl">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Search notes</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Kafka, scaling, RAG..."
                className="mt-3 h-12 w-full rounded-full border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-slate-500 transition focus:border-secondary/60 focus:bg-white/10"
              />
            </label>

            <CategoryFilters
              categories={categories}
              posts={latestPosts}
              activeCategory={activeCategory}
              onChange={setActiveCategory}
            />
          </div>
        </aside>

        <div className="min-w-0">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Latest Articles</p>
              <h2 className="mt-2 text-3xl font-display font-semibold text-white">Stories from production systems</h2>
            </div>
            <p className="text-sm text-slate-400">{filteredPosts.length} notes matched</p>
          </div>

          {filteredPosts.length > 0 ? (
            <motion.div
              key={`${activeCategory}-${query}`}
              variants={motionTheme.variants.containerStagger(0.045)}
              initial="hidden"
              animate="show"
            >
              {leadPost ? <BlogCard post={leadPost} index={0} variant="feature-row" /> : null}

              <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div>
                  {articleRows.map((post, index) => (
                    <BlogCard key={post.slug} post={post} index={index + 1} variant="essay" />
                  ))}
                </div>

                <div className="xl:border-l xl:border-white/10 xl:pl-6">
                  <div className="xl:sticky xl:top-28">
                    <p className="pt-8 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">More field notes</p>
                    {briefPosts.length > 0 ? (
                      <div className="mt-2">
                        {briefPosts.map((post, index) => (
                          <BlogCard key={post.slug} post={post} index={index + 8} variant="compact" />
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 border-t border-white/10 pt-5 text-sm leading-6 text-slate-500">
                        More notes will appear here as you load the archive.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="mt-8 border-y border-white/10 py-12">
              <p className="text-lg text-slate-300">No notes match this search yet.</p>
              <p className="mt-2 text-sm text-slate-500">Try a broader topic like Kafka, scaling, database, or production.</p>
            </div>
          )}

          {hasMore ? (
            <div className="mt-8 flex justify-center border-t border-white/10 pt-8">
              <button
                type="button"
                onClick={() => setVisibleCount(count => count + 6)}
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/10 bg-white/5 px-7 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-secondary/70 hover:bg-white/10"
              >
                Load more notes
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function EditorialStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">{label}</p>
      <p className="mt-1 font-display text-base text-white">{value}</p>
    </div>
  )
}

function CategoryFilters({
  categories,
  posts,
  activeCategory,
  onChange
}: {
  categories: readonly BlogCategory[]
  posts: BlogPost[]
  activeCategory: CategoryFilter
  onChange: (category: CategoryFilter) => void
}) {
  const filters: CategoryFilter[] = [ALL_CATEGORIES, ...categories]

  return (
    <motion.div className="mt-5 grid gap-2" variants={motionTheme.variants.containerStagger(0.025)} initial="hidden" animate="show">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Sections</p>
      {filters.map((category, index) => {
        const active = activeCategory === category
        const count = category === ALL_CATEGORIES ? posts.length : posts.filter(post => post.category === category).length

        return (
          <motion.button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            variants={motionTheme.variants.fadeUp(index * 0.01)}
            whileHover={{ x: 3 }}
            className={`flex items-center justify-between rounded-2xl border px-3 py-3 text-left text-sm transition ${active ? 'border-secondary/40 bg-secondary/15 text-white' : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-secondary/50 hover:bg-white/10'}`}
            aria-pressed={active}
          >
            <span className="font-semibold">{category}</span>
            <span className="text-xs text-slate-500">{count}</span>
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
      post.hook,
      post.category,
      ...post.tags,
      ...post.takeaways,
      ...post.productionNotes
    ].join(' ').toLowerCase()

    return searchText.includes(normalizedQuery)
  })
}
