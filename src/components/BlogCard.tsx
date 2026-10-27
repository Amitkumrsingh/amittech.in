"use client"

import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import type { BlogPost } from '../features/blog'
import { getBlogPostPath } from '../lib/blog'
import ArticleMeta from './ArticleMeta'
import BlogCover from './BlogCover'

export default function BlogCard({ post }: { post: BlogPost; index: number; variant?: 'feature-row' | 'essay' | 'compact' }) {
  return <article className="story-row"><Link href={getBlogPostPath(post)} className="story-row-cover" aria-label={`Read ${post.title}`}><BlogCover post={post} quiet /></Link><div className="story-row-copy"><ArticleMeta post={post} /><Link href={getBlogPostPath(post)}><h3>{post.title}</h3></Link><p>{post.hook}</p><Link href={getBlogPostPath(post)} className="story-read-link">Read story <ArrowUpRight size={16} aria-hidden="true" /></Link></div></article>
}
