"use client"

import { MotionProvider } from '../lib/motionContext'
import MotionToggle from './MotionToggle'
import ScrollProgressBar from './ScrollProgressBar'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <MotionProvider>
      <ScrollProgressBar />
      {children}
      <MotionToggle />
    </MotionProvider>
  )
}
