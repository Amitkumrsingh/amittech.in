# SEO Launch Checklist

Technical SEO is now wired into the app, but Google ranking is not guaranteed by code alone. Use this checklist after every production launch.

## One-Time Setup

- Add `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` in Vercel from Google Search Console.
- Verify `https://amittech.in` in Google Search Console.
- Submit `https://amittech.in/sitemap.xml`.
- Submit `https://amittech.in/rss.xml` anywhere you syndicate the engineering notes.
- Inspect and request indexing for:
  - `https://amittech.in`
  - `https://amittech.in/blog`
  - Every newly published blog post.

## Monthly Organic Push

- Publish 4-6 high-quality production engineering posts.
- Link each new post from LinkedIn with a short story hook.
- Add 3-5 internal links between related blog posts.
- Keep titles specific and experience-backed, for example:
  - `The Kafka Mistake That Caused Duplicate Events in Production`
  - `Why Retry Logic Is Harder Than It Looks`
  - `What 3 Years of Production Engineering Taught Me`
- Make sure every CMS post has:
  - Unique title
  - Strong excerpt
  - Cover image
  - Category
  - Tags
  - Published status

## Checks

- `https://amittech.in/favicon.ico` returns 200.
- `https://amittech.in/sitemap.xml` includes the new post.
- `https://amittech.in/rss.xml` includes the new post.
- Blog post has a canonical URL and OpenGraph image.
- Search Console shows no indexing errors.
