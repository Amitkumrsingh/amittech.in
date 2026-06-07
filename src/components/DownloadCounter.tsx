"use client"

import { useDownloadCount } from '../features/resume'

export default function DownloadCounter() {
  const count = useDownloadCount()

  return (
    <div className="inline-flex items-center gap-3 text-sm text-slate-300">
      <span className="text-slate-400">Downloads</span>
      <span className="text-white font-semibold">{count === null ? '—' : count}</span>
    </div>
  )
}
