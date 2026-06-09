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
GEMINI_MODEL=gemini-1.5-flash
AI_DAILY_LIMIT_USER=20
AI_DAILY_LIMIT_ADMIN=200
```

AI output is inserted only as editable draft content. It never auto-publishes posts.
