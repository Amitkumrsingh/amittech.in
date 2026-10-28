# Amit — Portfolio Starter

This repository contains a minimal Next.js + Tailwind + Framer Motion starter scaffold for a premium portfolio layout. It includes a hero and interactive skill cloud as a starting point.

Quick start:

```bash
npm install
npm run dev
```

## CMS AI Assistant

The private blog CMS can call Gemini through server-side API routes. The API key is never exposed to the browser.

Required environment variable:

```bash
GEMINI_API_KEY=
```

Optional environment variables:

```bash
GEMINI_MODEL=gemini-2.5-flash
GEMINI_IMAGE_MODEL=gemini-2.5-flash-image
AI_DAILY_LIMIT_USER=20
AI_DAILY_LIMIT_ADMIN=200
INLINE_AI_ENABLED=true
AI_STREAM_TIMEOUT_MS=55000
```

AI output is inserted only as editable draft content. It never auto-publishes posts.

When inline AI is enabled, authors can type `/ai` or `/generate` in an empty editor paragraph, or use **Write with AI**. Writing and Mermaid diagram requests stream through `POST /api/ai/stream`; metadata actions return validated fields at completion. Completed results use a 24-hour, author-scoped exact cache and do not consume another generation allowance on a cache hit. Regenerate bypasses that cache.

Mermaid source is previewed locally in the editor, persisted as an escaped `language-mermaid` code block, and rendered again in the reader view with strict Mermaid security settings. The saved article contains source code, never generated SVG.
