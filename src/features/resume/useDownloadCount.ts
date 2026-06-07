"use client"

import { useEffect, useState } from 'react'
import { fetchResumeDownloadCount } from './resume.client'
import { RESUME_DOWNLOADED_EVENT, type ResumeDownloadedDetail } from './resume.events'
import { readLocalResumeDownloadCount, writeLocalResumeDownloadCount } from './resume.storage'

export function useDownloadCount() {
  const [count, setCount] = useState<number | null>(null)

  function setStableCount(downloads: number) {
    setCount(current => {
      const nextCount = Math.max(Number(current || 0), readLocalResumeDownloadCount(), downloads)
      writeLocalResumeDownloadCount(nextCount)
      return nextCount
    })
  }

  async function refreshCount() {
    const downloads = await fetchResumeDownloadCount()
    if (typeof downloads === 'number') setStableCount(downloads)
  }

  useEffect(() => {
    setStableCount(readLocalResumeDownloadCount())
    refreshCount()

    const handler = (event: Event) => {
      const detail = (event as CustomEvent<ResumeDownloadedDetail>).detail
      const fallbackCount = readLocalResumeDownloadCount() + 1

      if (typeof detail?.downloads === 'number') {
        setStableCount(Math.max(detail.downloads, fallbackCount))
      } else {
        setStableCount(fallbackCount)
      }

      window.setTimeout(refreshCount, 800)
    }

    window.addEventListener(RESUME_DOWNLOADED_EVENT, handler)
    return () => window.removeEventListener(RESUME_DOWNLOADED_EVENT, handler)
  }, [])

  return count
}
