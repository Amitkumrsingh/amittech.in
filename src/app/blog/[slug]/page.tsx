import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import BlogCover from '../../../components/BlogCover'
import JsonLd from '../../../components/JsonLd'
import { getArticleSchema, formatPublishDate, getBlogPost, getBlogPostPath, getBlogPosts } from '../../../lib/blog'
import { absoluteUrl, getOgImageUrl, SITE_NAME } from '../../../lib/site'

type ArticlePageProps = {
  params: {
    slug: string
  }
}

export function generateStaticParams() {
  return getBlogPosts().map(post => ({ slug: post.slug }))
}

export function generateMetadata({ params }: ArticlePageProps): Metadata {
  const post = getBlogPost(params.slug)
  if (!post) return {}

  const url = absoluteUrl(getBlogPostPath(post))
  const ogImage = getOgImageUrl(post.title, post.category)

  return {
    title: `${post.title} - Amit Kumar Singh`,
    description: post.summary,
    alternates: {
      canonical: url
    },
    openGraph: {
      title: post.title,
      description: post.summary,
      url,
      siteName: SITE_NAME,
      type: 'article',
      publishedTime: post.publishDate,
      tags: post.tags,
      images: [{ url: ogImage }]
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.summary,
      images: [ogImage]
    }
  }
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const post = getBlogPost(params.slug)
  if (!post) notFound()

  return (
    <main className="px-4 sm:px-6 py-8 sm:py-12 max-w-5xl mx-auto">
      <JsonLd data={getArticleSchema(post)} />

      <article className="rounded-[32px] border border-white/10 bg-white/5 p-4 sm:p-6 shadow-[0_50px_140px_-100px_rgba(6,182,212,0.6)] backdrop-blur-2xl">
        <BlogCover post={post} featured />

        <div className="mx-auto max-w-3xl py-8 sm:py-10">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
            <span className="rounded-full bg-secondary/15 px-3 py-1 text-secondary">{post.category}</span>
            <span>{formatPublishDate(post.publishDate)}</span>
            <span className="text-slate-600">/</span>
            <span>{post.readingMinutes} min read</span>
          </div>

          <h1 className="mt-5 text-3xl sm:text-5xl font-display font-semibold leading-tight text-white">{post.title}</h1>
          <p className="mt-5 text-base sm:text-lg leading-8 text-slate-300">{post.summary}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">{tag}</span>
            ))}
          </div>

          <div className="mt-10 space-y-8 text-slate-300">
            <section>
              <h2 className="text-xl font-semibold text-white">Engineering Context</h2>
              <p className="mt-3 leading-8">
                This insight is written from a production backend perspective: requirements first, failure modes early, and architecture decisions tied to operational outcomes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">Key Takeaways</h2>
              <ul className="mt-3 space-y-3 leading-8">
                {post.takeaways.map(takeaway => (
                  <li key={takeaway} className="list-disc list-inside">{takeaway}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white">Production Lens</h2>
              <p className="mt-3 leading-8">
                The practical question is not whether the design is elegant. It is whether the system is observable, recoverable, cost-aware, and clear enough for another engineer to operate under pressure.
              </p>
            </section>
          </div>
        </div>
      </article>
    </main>
  )
}
