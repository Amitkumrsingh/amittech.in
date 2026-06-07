"use client"

import { useEffect, useRef, useState } from 'react'
import { recordExperimentMetric } from '../lib/abTesting'
import { trackScrollDepth } from '../lib/analytics'

export function useScrollProgress() {
  const [progress, setProgress] = useState(0)
  const maxScrollRef = useRef(0)

  useEffect(() => {
    let frame = 0

    const updateProgress = () => {
      frame = 0

      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrolled = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setProgress(scrolled)

      if (scrolled > maxScrollRef.current) {
        maxScrollRef.current = scrolled
        recordExperimentMetric('motion_engagement', 'scrollDepth', scrolled)

        if (Math.floor(scrolled) % 25 === 0) {
          trackScrollDepth(scrolled)
        }
      }
    }

    const scheduleProgressUpdate = () => {
      if (frame) return
      frame = window.requestAnimationFrame(updateProgress)
    }

    updateProgress()
    window.addEventListener('scroll', scheduleProgressUpdate, { passive: true })
    window.addEventListener('resize', scheduleProgressUpdate)

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', scheduleProgressUpdate)
      window.removeEventListener('resize', scheduleProgressUpdate)
    }
  }, [])

  return progress
}
