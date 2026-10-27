"use client"

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { MotionProvider } from '../lib/motionContext'
import Footer from './Footer'
import MotionToggle from './MotionToggle'
import Navbar from './Navbar'
import ScrollProgressBar from './ScrollProgressBar'
import EditorialShell from './EditorialShell'

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isEditorialRoute = pathname?.startsWith('/blog') || pathname?.startsWith('/admin')

  if (isEditorialRoute) return <EditorialShell>{children}</EditorialShell>

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
