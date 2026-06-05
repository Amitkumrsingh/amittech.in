"use client"

import { motion } from '../lib/motion'
import { useMotion } from '../lib/motionContext'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const { enabled: motionEnabled } = useMotion()

  return (
    <motion.div
      initial={motionEnabled ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: motionEnabled ? 0.5 : 0, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
