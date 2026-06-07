import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import ArticleMeta from '../../../components/ArticleMeta'
import ArticleReadingProgress from '../../../components/ArticleReadingProgress'
import BlogCover from '../../../components/BlogCover'
import JsonLd from '../../../components/JsonLd'
import { getArticleTocItems } from '../../../features/blog'
import { getAllBlogPosts, getArticleSchema, getBlogPostBySlug, getBlogPostPath, getBlogPosts, getBlogPostUrl, getRelatedPosts } from '../../../lib/blog'
import { absoluteUrl, getOgImageUrl, SITE_NAME } from '../../../lib/site'

type ArticlePageProps = {
  params: {
    slug: string
  }
}

export function generateStaticParams() {
  return getBlogPosts().map(post => ({ slug: post.slug }))
}

export const dynamicParams = true

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug)
  if (!post) return {}

  const url = absoluteUrl(getBlogPostPath(post))
  const ogImage = post.coverImage || getOgImageUrl(post.title, post.category)

  return {
    title: `${post.title} - Amit Kumar Singh`,
    description: post.summary,
    alternates: {
      canonical: url
    },
    openGraph: {
      title: post.title,
      description: post.hook,
      url,
      siteName: SITE_NAME,
      type: 'article',
      publishedTime: post.publishDate,
      modifiedTime: post.updatedDate,
      tags: post.tags,
      images: [{ url: ogImage }]
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.hook,
      images: [ogImage]
    }
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const post = await getBlogPostBySlug(params.slug)
  if (!post) notFound()

  const url = getBlogPostUrl(post)
  const allPosts = await getAllBlogPosts()
  const relatedPosts = getRelatedPosts(post, 3, allPosts)
  const tocItems = getArticleTocItems(post)
  const isCmsPost = post.source === 'cms'

  return (
    <main className="relative px-4 pb-10 pt-24 sm:px-6 sm:pb-14 sm:pt-28">
      <ArticleReadingProgress />
      <JsonLd data={getArticleSchema(post)} />

      <article className="mx-auto max-w-6xl">
        <header className="border-b border-white/10 pb-8">
          <Link href="/blog" className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-secondary/60 hover:bg-white/10">
            Back to Engineering Notes
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
            <div>
              <ArticleMeta post={post} />
              <h1 className="mt-5 max-w-5xl text-4xl font-display font-semibold leading-[1.02] text-white sm:text-6xl lg:text-7xl">{post.title}</h1>
              <p className="mt-6 max-w-3xl text-xl leading-9 text-slate-100">{post.hook}</p>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-400">{post.summary}</p>
            </div>

            <AuthorCard url={url} title={post.title} />
          </div>

          <div className="mt-8">
            <BlogCover post={post} featured />
          </div>
        </header>

        <div className="grid gap-10 py-10 lg:grid-cols-[230px_minmax(0,740px)_180px] lg:items-start">
          <aside className="hidden lg:block lg:sticky lg:top-28">
            <div className="border-l border-white/10 pl-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Contents</p>
              <nav className="mt-4 grid gap-3 text-sm leading-6 text-slate-400">
                {tocItems.map(item => (
                  <a key={item.id} href={`#${item.id}`} className="transition hover:text-secondary">
                    {item.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <div className="min-w-0">
            <Callout>{post.hook}</Callout>

            {isCmsPost ? <CmsArticleBody html={post.html} /> : <StaticArticleBody post={post} />}
          </div>

          <aside className="lg:sticky lg:top-28">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-slate-400 backdrop-blur-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Filed under</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <span key={tag} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-slate-300">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <section id="related" className="border-t border-white/10 pt-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Keep reading</p>
              <h2 className="mt-2 text-3xl font-display font-semibold text-white">Related engineering notes</h2>
            </div>
            <Link href="/blog" className="text-sm font-semibold text-secondary transition hover:text-white">View all notes</Link>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {relatedPosts.map(related => (
              <Link key={related.slug} href={getBlogPostPath(related)} className="group border-t border-white/10 pt-5 transition hover:-translate-y-1">
                <BlogCover post={related} quiet />
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-secondary">{related.category}</p>
                <h3 className="mt-2 text-xl font-display font-semibold leading-tight text-white transition group-hover:text-secondary">{related.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">{related.hook}</p>
              </Link>
            ))}
          </div>
        </section>
      </article>
    </main>
  )
}

function StaticArticleBody({ post }: { post: NonNullable<Awaited<ReturnType<typeof getBlogPostBySlug>>> }) {
  return (
    <div className="mt-10 space-y-12">
      {(post.sections || []).map(section => (
        <section key={section.id} id={section.id} className="scroll-mt-28">
          <h2 className="text-3xl font-display font-semibold leading-tight text-white">{section.title}</h2>
          <div className="mt-5 space-y-5 text-lg leading-9 text-slate-300">
            {section.body.map(paragraph => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
      ))}

      {post.takeaways?.length ? (
        <section id="lessons" className="scroll-mt-28 border-y border-white/10 py-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">What I took away</p>
          <ul className="mt-5 grid gap-4">
            {post.takeaways.map((takeaway, index) => (
              <li key={takeaway} className="grid grid-cols-[36px_minmax(0,1fr)] gap-4">
                <span className="grid h-9 w-9 place-items-center rounded-full border border-secondary/25 bg-secondary/10 text-sm font-semibold text-secondary">
                  {index + 1}
                </span>
                <span className="pt-1 text-lg leading-8 text-slate-200">{takeaway}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {post.productionNotes?.length ? (
        <section id="production-notes" className="scroll-mt-28">
          <h2 className="text-3xl font-display font-semibold text-white">Production Notes</h2>
          <div className="mt-5 grid gap-3">
            {post.productionNotes.map(note => (
              <div key={note} className="border-l border-secondary/40 bg-white/[0.03] px-4 py-3 text-base leading-7 text-slate-300">
                {note}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

function CmsArticleBody({ html }: { html?: string | null }) {
  if (!html) {
    return (
      <div className="mt-10 border-y border-white/10 py-10 text-lg leading-9 text-slate-300">
        This article has been published, but its body is empty.
      </div>
    )
  }

  return (
    <div
      className="cms-rich-content mt-10 space-y-6 text-lg leading-9 text-slate-300 [&_figure]:my-8 [&_h2]:scroll-mt-28 [&_h2]:pt-4 [&_h3]:scroll-mt-28 [&_h3]:pt-3 [&_table]:w-full [&_table]:overflow-hidden [&_table]:rounded-2xl [&_td]:border [&_td]:border-white/10 [&_td]:p-3 [&_th]:border [&_th]:border-white/10 [&_th]:p-3"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

function AuthorCard({ url, title }: { url: string; title: string }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-2xl">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-full border border-secondary/30 bg-secondary/15 text-sm font-semibold text-secondary">AKS</div>
        <div>
          <p className="font-semibold text-white">Amit Kumar Singh</p>
          <p className="text-sm text-slate-400">Backend Engineer</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-400">
        I write about the production lessons behind backend systems, queues, databases, cloud, and AI products.
      </p>
      <div className="mt-5 grid gap-2">
        <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10">
          Share on LinkedIn
        </a>
        <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-semibold text-white transition hover:bg-white/10">
          Share on X
        </a>
      </div>
    </div>
  )
}

function Callout({ children }: { children: ReactNode }) {
  return (
    <div className="border-y border-secondary/25 bg-secondary/10 px-5 py-6 text-xl font-display leading-9 text-white">
      {children}
    </div>
  )
}
