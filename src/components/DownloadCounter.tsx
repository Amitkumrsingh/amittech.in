"use client"

import { useEffect, useState } from 'react'

const LOCAL_COUNT_KEY = 'resume-download-count'

export default function DownloadCounter() {
  const [count, setCount] = useState<number | null>(null)

  function readLocalCount() {
    try {
      return Number(window.localStorage.getItem(LOCAL_COUNT_KEY) || 0)
    } catch (err) {
      return 0
    }
  }

  function writeLocalCount(downloads: number) {
    try {
      window.localStorage.setItem(LOCAL_COUNT_KEY, String(downloads))
    } catch (err) {
      // ignore
    }
  }

  function setStableCount(downloads: number) {
    setCount(current => {
      const nextCount = Math.max(Number(current || 0), readLocalCount(), downloads)
      writeLocalCount(nextCount)
      return nextCount
    })
  }

  async function fetchCount() {
    try {
      const res = await fetch('/api/download-count', { cache: 'no-store' })
      if (!res.ok) return
      const json = await res.json()
      setStableCount(Number(json.downloads || 0))
    } catch (err) {
      // ignore
    }
  }

  useEffect(() => {
    setStableCount(readLocalCount())
    fetchCount()
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ downloads?: number }>).detail
      const fallbackCount = readLocalCount() + 1

      if (typeof detail?.downloads === 'number') {
        setStableCount(Math.max(detail.downloads, fallbackCount))
      } else {
        setStableCount(fallbackCount)
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
