"use client"

import { useEffect, useState } from 'react'
import { recordExperimentMetric } from '../lib/abTesting'
import { trackScrollDepth } from '../lib/analytics'

export default function ScrollProgressBar() {
  const [progress, setProgress] = useState(0)
  const [maxScroll, setMaxScroll] = useState(0)

  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrolled = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setProgress(scrolled)

      // Track max scroll depth for A/B testing
      if (scrolled > maxScroll) {
        setMaxScroll(scrolled)
        recordExperimentMetric('motion_engagement', 'scrollDepth', scrolled)
        
        // Log at 25%, 50%, 75%, 100% milestones
        if (Math.floor(scrolled) % 25 === 0) {
          trackScrollDepth(scrolled)
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [maxScroll])

  return (
    <div className="fixed top-0 left-0 h-1 bg-gradient-to-r from-auroraTeal via-purple-500 to-pink-500 z-[100] transition-all duration-150" style={{ width: `${progress}%` }} />
  )
}
