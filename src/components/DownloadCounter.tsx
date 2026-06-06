"use client"

import { useEffect, useState } from 'react'

export default function DownloadCounter() {
  const [count, setCount] = useState<number | null>(null)

  async function fetchCount() {
    try {
      const res = await fetch('/api/download-count', { cache: 'no-store' })
      if (!res.ok) return
      const json = await res.json()
      setCount(Number(json.downloads || 0))
    } catch (err) {
      // ignore
    }
  }

  useEffect(() => {
    fetchCount()
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ downloads?: number }>).detail

      if (typeof detail?.downloads === 'number') {
        setCount(detail.downloads)
      } else {
        setCount(current => current === null ? 1 : current + 1)
      }

      window.setTimeout(fetchCount, 800)
    }
    window.addEventListener('resume:downloaded', handler)
    return () => window.removeEventListener('resume:downloaded', handler)
  }, [])

  return (
    <div className="inline-flex items-center gap-3 text-sm text-slate-300">
      <span className="text-slate-400">Downloads</span>
      <span className="text-white font-semibold">{count === null ? '—' : count}</span>
    </div>
  )
}
