"use client"

import { useScrollProgress } from '../hooks/useScrollProgress'

export default function ScrollProgressBar() {
  const progress = useScrollProgress()

  return (
    <div className="fixed top-0 left-0 h-1 bg-gradient-to-r from-auroraTeal via-purple-500 to-pink-500 z-[100] transition-all duration-150" style={{ width: `${progress}%` }} />
  )
}
