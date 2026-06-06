"use client"

import { useEffect, useState } from 'react'

export default function ArticleReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY
      const height = document.documentElement.scrollHeight - window.innerHeight
      setProgress(height > 0 ? Math.min(100, Math.max(0, (scrollTop / height) * 100)) : 0)
    }

    updateProgress()
    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress)

    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
    }
  }, [])

  return (
    <div className="fixed inset-x-0 top-0 z-[1000] h-1 bg-white/5" aria-hidden="true">
      <div
        className="h-full bg-gradient-to-r from-secondary via-primary to-accent shadow-[0_0_28px_rgba(6,182,212,0.55)] transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
