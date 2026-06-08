'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body className="bg-bg text-white antialiased">
        <main className="flex min-h-screen items-center justify-center px-6">
          <section className="max-w-xl rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_40px_120px_-80px_rgba(6,182,212,0.45)] backdrop-blur-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-secondary">Runtime error</p>
            <h1 className="mt-4 text-3xl font-display font-semibold text-white sm:text-4xl">Something broke while rendering this page.</h1>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              The issue has been reported. You can retry the page without losing your place.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-6 rounded-full bg-secondary px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-300"
            >
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  )
}
