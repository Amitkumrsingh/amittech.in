"use client"

import { useState, type KeyboardEvent } from 'react'
import { motion } from '../lib/motion'
import motionTheme from '../lib/motionTheme'

const TECH = [
  // Frontend
  'React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Shadcn UI',
  // Backend
  'Python', 'Django', 'Node.js', 'Kafka', 'Redis', 'PostgreSQL',
  // Cloud
  'AWS', 'Docker', 'Kubernetes', 'CI/CD',
  // AI
  'AWS Bedrock', 'RAG', 'MCP', 'Agentic AI'
]

type Props = {
  selected?: string | null
  onSelect?: (tech: string | null) => void
}

export default function SkillCloud({ selected = null, onSelect }: Props) {
  const pinned = selected

  function handleSelect(t: string) {
    const next = pinned === t ? null : t
    onSelect?.(next)
  }

  return (
    <div className="w-full flex flex-col md:flex-row gap-6">
      <div className="flex-1">
        <div className="relative p-6 rounded-2xl bg-white/3 backdrop-blur-sm min-h-[220px]" role="list">
          <motion.div className="flex flex-wrap gap-3" variants={motionTheme.variants.containerStagger(0.04)} initial="hidden" whileInView="show" viewport={{ once: true }}>
            {TECH.map((t, i) => (
              <motion.button
                key={t}
                variants={motionTheme.variants.fadeUp(i * 0.02)}
                onClick={() => handleSelect(t)}
                whileHover={{ y: -6, scale: 1.03 }}
                onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSelect(t) } }}
                tabIndex={0}
                role="button"
                aria-pressed={pinned === t}
                className={`tech-pill px-3 py-2 rounded-full text-sm font-medium transition-shadow focus:outline-none focus:ring-2 focus:ring-auroraTeal/50 ${pinned === t ? 'ring-2 ring-auroraTeal/60' : ''}`}
              >
                {t}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>

      <aside className="w-full md:w-80">
        <div className="p-4 rounded-2xl bg-white/2 backdrop-blur-sm min-h-[120px]">
          <h3 className="text-sm font-semibold">Selected</h3>
          <p className="mt-2 text-sm text-slate-200">{pinned ?? 'Click a tech pill to see usage highlights and related projects.'}</p>
        </div>
      </aside>
    </div>
  )
}
