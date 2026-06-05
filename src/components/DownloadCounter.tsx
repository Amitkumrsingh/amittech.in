"use client"

import { useEffect, useState } from 'react'

export default function DownloadCounter() {
  const [count, setCount] = useState<number | null>(null)

  async function fetchCount() {
    try {
      const res = await fetch('/api/download-count')
      if (!res.ok) return
      const json = await res.json()
      setCount(Number(json.downloads || 0))
    } catch (err) {
      // ignore
    }
  }

  useEffect(() => {
    fetchCount()
    const handler = () => fetchCount()
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
