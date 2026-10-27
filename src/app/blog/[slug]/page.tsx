import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ArticleMeta from '../../../components/ArticleMeta'
import ArticleReadingProgress from '../../../components/ArticleReadingProgress'
import BlogCover from '../../../components/BlogCover'
import JsonLd from '../../../components/JsonLd'
import MermaidArticleContent from '../../../components/MermaidArticleContent'
import { getArticleTocItems } from '../../../features/blog'
import { getAllBlogPosts, getArticleSchema, getBlogPostBySlug, getBlogPostPath, getBlogPosts, getBlogPostUrl, getRelatedPosts } from '../../../lib/blog'
import { SEO_KEYWORDS, absoluteUrl, getOgImageUrl, SITE_NAME } from '../../../lib/site'

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
    title: post.title,
    description: post.summary,
    keywords: [...SEO_KEYWORDS, post.category, ...post.tags],
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
    <main className="reader-page">
      <ArticleReadingProgress />
      <JsonLd data={getArticleSchema(post)} />

      <article className="reader-article">
        <header className="reader-header">
          <Link href="/blog" className="reader-back">← All stories</Link>
          <ArticleMeta post={post} />
          <h1>{post.title}</h1>
          <p className="reader-deck">{post.hook}</p>
          <AuthorCard url={url} title={post.title} />
          <div className="reader-cover"><BlogCover post={post} featured /></div>
        </header>
        <div className="reader-layout">
          {tocItems.length ? <details className="reader-toc"><summary>In this story</summary><nav>{tocItems.map(item => <a key={item.id} href={`#${item.id}`}>{item.title}</a>)}</nav></details> : null}
          <div className="reader-body">{isCmsPost ? <CmsArticleBody html={post.html} /> : <StaticArticleBody post={post} />}</div>
          <div className="reader-tags" aria-label="Article topics">{post.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
        </div>
        <section id="related" className="reader-related">
          <div className="reader-related-heading"><div><p>Keep reading</p><h2>Related engineering notes</h2></div><Link href="/blog">View all stories</Link></div>
          <div className="reader-related-grid">
            {relatedPosts.map(related => (
              <Link key={related.slug} href={getBlogPostPath(related)} className="reader-related-card">
                <BlogCover post={related} quiet />
                <p>{related.category}</p><h3>{related.title}</h3>
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
    <div className="static-article-body">
      {(post.sections || []).map(section => (
        <section key={section.id} id={section.id} className="scroll-mt-28">
          <h2>{section.title}</h2>
          <div>
            {section.body.map(paragraph => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>
      ))}

      {post.takeaways?.length ? (
        <section id="lessons" className="article-lessons">
          <p>What I took away</p><ul>
            {post.takeaways.map((takeaway, index) => (
              <li key={takeaway}><span>{index + 1}</span><span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {post.productionNotes?.length ? (
        <section id="production-notes" className="scroll-mt-28">
          <h2>Production Notes</h2><div className="production-notes-list">
            {post.productionNotes.map(note => (
              <div key={note}>
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
      <div className="reader-empty-body">
        This article has been published, but its body is empty.
      </div>
    )
  }

  return <MermaidArticleContent html={html} />
}

function AuthorCard({ url, title }: { url: string; title: string }) {
  return (
    <div className="reader-author"><span className="reader-author-mark">AKS</span><div><strong>Amit Kumar Singh</strong><span>Backend engineer · Systems and applied AI</span></div><div className="reader-share"><a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer">LinkedIn</a><a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`} target="_blank" rel="noopener noreferrer">Share on X</a></div>
    </div>
  )
}
