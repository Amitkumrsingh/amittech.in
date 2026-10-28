import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'

const blogSource = fs.readFileSync(new URL('../../src/lib/blog.ts', import.meta.url), 'utf8')
const articlePage = fs.readFileSync(new URL('../../src/app/blog/[slug]/page.tsx', import.meta.url), 'utf8')
const blogSection = fs.readFileSync(new URL('../../src/components/BlogSection.tsx', import.meta.url), 'utf8')

test('public blog content is database-only', () => {
  assert.doesNotMatch(blogSource, /BLOG_POSTS|staticBlogSource|data\/blog/)
  assert.match(blogSource, /getPublishedCmsBlogPosts\(\)/)
  assert.match(blogSource, /status:\s*'PUBLISHED'/)
  assert.doesNotMatch(articlePage, /generateStaticParams|StaticArticleBody/)
  assert.doesNotMatch(blogSection, /getBlogPosts\(|getBlogCategories\(/)
})
