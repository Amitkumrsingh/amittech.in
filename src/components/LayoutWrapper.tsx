"use client"

import { MotionProvider } from '../lib/motionContext'
import Footer from './Footer'
import MotionToggle from './MotionToggle'
import Navbar from './Navbar'
import ScrollProgressBar from './ScrollProgressBar'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <MotionProvider>
      <ScrollProgressBar />
      <Navbar />
      {children}
      <Footer />
      <MotionToggle />
    </MotionProvider>
  )
}
