"use client"

import { createContext, useContext, ReactNode } from 'react'
import useMotionPreference from './useMotionPreference'

type MotionContextType = {
  enabled: boolean
  toggle: () => void
}

const MotionContext = createContext<MotionContextType | null>(null)

export function MotionProvider({ children }: { children: ReactNode }) {
  const { enabled, toggle } = useMotionPreference()

  return (
    <MotionContext.Provider value={{ enabled, toggle }}>
      {children}
    </MotionContext.Provider>
  )
}

export function useMotion() {
  const ctx = useContext(MotionContext)
  if (!ctx) {
    return { enabled: true, toggle: () => {} }
  }
  return ctx
}
