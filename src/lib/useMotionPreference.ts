"use client"

import { useEffect, useState } from 'react'

const KEY = 'motion:enabled'

export default function useMotionPreference() {
  const [enabled, setEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true
    const raw = window.localStorage.getItem(KEY)
    if (raw === null) {
      return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    }
    return raw === 'true'
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, String(enabled))
      if (!enabled) {
        document.documentElement.dataset.motion = 'reduced'
      } else {
        delete document.documentElement.dataset.motion
      }
    } catch (e) {
      // ignore
    }
  }, [enabled])

  function toggle() { setEnabled(v => !v) }

  return { enabled, setEnabled, toggle }
}
