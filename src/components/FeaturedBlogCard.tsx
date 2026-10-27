"use client"

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { BlogPost } from '../features/blog'
import { getBlogPostPath } from '../lib/blog'
import ArticleMeta from './ArticleMeta'
import BlogCover from './BlogCover'

export default function FeaturedBlogCard({ post }: { post: BlogPost }) {
  return <article className="featured-story"><Link href={getBlogPostPath(post)} aria-label={`Read featured article: ${post.title}`}><BlogCover post={post} featured /></Link><div className="featured-story-copy"><p className="featured-label">Featured story</p><ArticleMeta post={post} /><Link href={getBlogPostPath(post)}><h2>{post.title}</h2></Link><p>{post.hook}</p><Link href={getBlogPostPath(post)} className="featured-action">Read the story <ArrowRight size={17} aria-hidden="true" /></Link></div></article>
}
