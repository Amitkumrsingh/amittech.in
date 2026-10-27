"use client"

import { Search } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { BLOG_FILTER_ALL, BLOG_INITIAL_VISIBLE_POSTS, BLOG_LOAD_MORE_COUNT, filterBlogPosts, type BlogCategory, type BlogCategoryFilter, type BlogPost } from '../features/blog'
import { getBlogCategories, getBlogCategoriesForPosts, getBlogPosts, getFeaturedPost, getLatestPosts } from '../lib/blog'
import BlogCard from './BlogCard'
import FeaturedBlogCard from './FeaturedBlogCard'

type BlogSectionProps = { posts?: BlogPost[]; categories?: readonly BlogCategory[] }

export default function BlogSection({ posts, categories: providedCategories }: BlogSectionProps = {}) {
  const allPosts = useMemo(() => posts ?? getBlogPosts(), [posts])
  const featuredPost = useMemo(() => getFeaturedPost(allPosts), [allPosts])
  const latestPosts = useMemo(() => getLatestPosts(allPosts), [allPosts])
  const categories = useMemo(() => providedCategories ?? getBlogCategoriesForPosts(allPosts) ?? getBlogCategories(), [allPosts, providedCategories])
  const [activeCategory, setActiveCategory] = useState<BlogCategoryFilter>(BLOG_FILTER_ALL)
  const [query, setQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(BLOG_INITIAL_VISIBLE_POSTS)
  const filteredPosts = useMemo(() => filterBlogPosts(latestPosts, activeCategory, query), [activeCategory, latestPosts, query])
  const visiblePosts = filteredPosts.slice(0, visibleCount)

  useEffect(() => setVisibleCount(BLOG_INITIAL_VISIBLE_POSTS), [activeCategory, query])

  return (
    <section className="publication">
      <div className="publication-hero">
        <p className="publication-kicker">Backend systems · Applied AI · Production lessons</p>
        <h1>Ideas from systems that ship.</h1>
        <p>Field notes on distributed systems, engineering decisions, and useful AI—written for people who build and operate software.</p>
      </div>
      <div className="publication-toolbar" id="latest-notes">
        <div className="publication-topics" aria-label="Filter stories by topic">
          {[BLOG_FILTER_ALL, ...categories].map(category => <button key={category} type="button" aria-pressed={activeCategory === category} onClick={() => setActiveCategory(category)}>{category}</button>)}
        </div>
        <label className="publication-search"><Search size={17} aria-hidden="true" /><span className="sr-only">Search stories</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search stories" /></label>
      </div>
      {featuredPost && activeCategory === BLOG_FILTER_ALL && !query ? <FeaturedBlogCard post={featuredPost} /> : null}
      <div className="publication-feed">
        <div className="publication-feed-heading"><div><p>Latest</p><h2>Stories and field notes</h2></div><span>{filteredPosts.length} {filteredPosts.length === 1 ? 'story' : 'stories'}</span></div>
        {visiblePosts.length ? visiblePosts.map((post, index) => <BlogCard key={post.slug} post={post} index={index} />) : <div className="publication-empty"><h3>No stories found</h3><p>Try a broader topic or clear the search.</p></div>}
      </div>
      {visibleCount < filteredPosts.length ? <button type="button" className="publication-load-more" onClick={() => setVisibleCount(count => count + BLOG_LOAD_MORE_COUNT)}>Load more stories</button> : null}
      <div className="publication-footer"><p>Writing about production engineering and AI systems.</p><div><Link href="/rss.xml">RSS</Link><Link href="/admin">Open writing studio</Link></div></div>
    </section>
  )
}
