import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import BlogCover from '../../../components/BlogCover'
import JsonLd from '../../../components/JsonLd'
import type { BlogCategory } from '../../../data/blog'
import { getArticleSchema, formatPublishDate, getBlogPost, getBlogPostPath, getBlogPosts, getBlogPostUrl, getRelatedPosts } from '../../../lib/blog'
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

  const url = getBlogPostUrl(post)
  const relatedPosts = getRelatedPosts(post)
  const codeExample = getCodeExample(post.category)

  return (
    <main className="px-4 sm:px-6 pb-8 pt-24 sm:pb-12 sm:pt-28 max-w-6xl mx-auto">
      <JsonLd data={getArticleSchema(post)} />

      <article className="rounded-[32px] border border-white/10 bg-white/5 p-4 sm:p-6 shadow-[0_50px_140px_-100px_rgba(6,182,212,0.6)] backdrop-blur-2xl">
        <BlogCover post={post} featured />

        <div className="grid gap-8 py-8 sm:py-10 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <Link href="/blog" className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
              Back to blog
            </Link>
            <div className="mt-5 rounded-3xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Contents</p>
              <nav className="mt-4 grid gap-3 text-sm text-slate-300">
                <a href="#context" className="hover:text-secondary">Engineering context</a>
                <a href="#takeaways" className="hover:text-secondary">Key takeaways</a>
                <a href="#implementation" className="hover:text-secondary">Implementation pattern</a>
                <a href="#production-lens" className="hover:text-secondary">Production lens</a>
                <a href="#related" className="hover:text-secondary">Related articles</a>
              </nav>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              <span className="rounded-full bg-secondary/15 px-3 py-1 text-secondary">{post.category}</span>
              <span>{formatPublishDate(post.publishDate)}</span>
              <span className="text-slate-600">/</span>
              <span>{post.readingMinutes} min read</span>
            </div>

            <h1 className="mt-5 max-w-3xl text-3xl sm:text-5xl font-display font-semibold leading-tight text-white">{post.title}</h1>
            <p className="mt-5 max-w-3xl text-base sm:text-lg leading-8 text-slate-300">{post.summary}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {post.tags.map(tag => (
                <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">{tag}</span>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10">Share on LinkedIn</a>
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10">Share on X</a>
            </div>

            <div className="mt-10 max-w-3xl space-y-10 text-slate-300">
              <section id="context">
                <h2 className="text-2xl font-semibold text-white">Engineering Context</h2>
                <p className="mt-4 leading-8">
                  This article looks at {post.category.toLowerCase()} through the lens of production work: ambiguous requirements, moving data, user-facing risk, operational visibility, and the tradeoffs teams actually inherit after a launch.
                </p>
              </section>

              <Callout>
                The useful architecture question is not “what is the ideal diagram?” It is “what can the team observe, recover, and evolve when real traffic and real failures arrive?”
              </Callout>

              <section id="takeaways">
                <h2 className="text-2xl font-semibold text-white">Key Takeaways</h2>
                <ul className="mt-4 space-y-3 leading-8">
                  {post.takeaways.map(takeaway => (
                    <li key={takeaway} className="flex gap-3">
                      <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section id="implementation">
                <h2 className="text-2xl font-semibold text-white">Implementation Pattern</h2>
                <p className="mt-4 leading-8">
                  A reliable implementation starts with clear ownership, explicit failure behavior, and enough instrumentation to understand whether the system is helping the business workflow or quietly accumulating risk.
                </p>
                <CodeBlock title={codeExample.title} language={codeExample.language} code={codeExample.code} />
              </section>

              <section id="production-lens">
                <h2 className="text-2xl font-semibold text-white">Production Lens</h2>
                <p className="mt-4 leading-8">
                  The practical question is not whether the design is elegant. It is whether the system is observable, recoverable, cost-aware, and clear enough for another engineer to operate under pressure.
                </p>
              </section>
            </div>

            <section id="related" className="mt-12">
              <h2 className="text-2xl font-semibold text-white">Related Articles</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {relatedPosts.map(related => (
                  <Link key={related.slug} href={getBlogPostPath(related)} className="rounded-3xl border border-white/10 bg-white/5 p-4 transition hover:-translate-y-1 hover:bg-white/10">
                    <p className="text-xs uppercase tracking-[0.18em] text-secondary">{related.category}</p>
                    <h3 className="mt-3 text-sm font-semibold leading-6 text-white">{related.title}</h3>
                    <p className="mt-2 text-xs leading-5 text-slate-400">{related.readingMinutes} min read</p>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </article>
    </main>
  )
}

function Callout({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-secondary/20 bg-secondary/10 p-5 text-sm leading-7 text-slate-200">
      {children}
    </div>
  )
}

function CodeBlock({ title, language, code }: { title: string; language: string; code: string }) {
  return (
    <div className="mt-5 overflow-hidden rounded-3xl border border-white/10 bg-black/70">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{title}</p>
        <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400">{language}</span>
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-7 text-slate-100"><code>{code}</code></pre>
    </div>
  )
}

function getCodeExample(category: BlogCategory) {
  if (category === 'Kafka' || category === 'Distributed Systems' || category === 'Microservices') {
    return {
      title: 'Idempotent event handling',
      language: 'python',
      code: `def handle_event(event, store, producer):
    key = f"{event.topic}:{event.partition}:{event.offset}"

    if store.exists(key):
        return {"status": "duplicate"}

    result = apply_business_change(event.payload)
    store.save(key, result)
    producer.publish("workflow.completed", result)

    return {"status": "processed"}`
    }
  }

  if (category === 'AI Engineering') {
    return {
      title: 'Production RAG boundary',
      language: 'typescript',
      code: `async function answerQuestion(question: string, userId: string) {
  const docs = await retrieveRelevantDocs(question, { userId, limit: 6 })
  const groundedContext = docs.map(doc => doc.excerpt).join("\\n---\\n")

  return generateAnswer({
    question,
    context: groundedContext,
    guardrails: ["cite_sources", "refuse_unknowns"]
  })
}`
    }
  }

  return {
    title: 'Reliable API boundary',
    language: 'typescript',
    code: `async function createWorkflow(payload: WorkflowInput) {
  validate(payload)

  const idempotencyKey = createStableKey(payload)
  const existing = await workflows.findByKey(idempotencyKey)
  if (existing) return existing

  const workflow = await workflows.create({ ...payload, idempotencyKey })
  await events.publish("workflow.created", workflow)

  return workflow
}`
  }
}
