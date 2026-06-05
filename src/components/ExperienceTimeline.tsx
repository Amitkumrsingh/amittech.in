"use client"

import { useState } from 'react'
import { motion } from '../lib/motion'
import { EXPERIENCE, type ExperienceRole } from '../data/experience'
import SectionHeader from './SectionHeader'

const DEFAULT_EXPERIENCE_ID = EXPERIENCE[0]?.id ?? null

export default function ExperienceTimeline() {
  const [active, setActive] = useState<string | null>(DEFAULT_EXPERIENCE_ID)
  const activeRole = EXPERIENCE.find(role => role.id === active) ?? EXPERIENCE[0]

  if (!activeRole) return null

  return (
    <motion.div id="experience" className="mt-16" initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.15 }}>
      <SectionHeader
        eyebrow="Experience"
        title="Built systems for high-growth fintech and operations platforms."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(240px,280px)_minmax(0,1fr)]">
        <ExperienceTabs active={activeRole.id} onSelect={setActive} />
        <ExperienceDetails role={activeRole} />
      </div>
    </motion.div>
  )
}

type ExperienceTabsProps = {
  active: string
  onSelect: (id: string) => void
}

function ExperienceTabs({ active, onSelect }: ExperienceTabsProps) {
  return (
    <div className="min-w-0 space-y-3 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
      <div className="flex lg:flex-col gap-3 lg:gap-3 min-w-max lg:min-w-0">
        {EXPERIENCE.map((role, index) => (
          <ExperienceTab
            key={role.id}
            role={role}
            index={index}
            active={active === role.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}

type ExperienceTabProps = {
  role: ExperienceRole
  index: number
  active: boolean
  onSelect: (id: string) => void
}

function ExperienceTab({ role, index, active, onSelect }: ExperienceTabProps) {
  return (
    <motion.button
      onClick={() => onSelect(role.id)}
      initial={{ opacity: 0, x: -6 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.45 }}
      className={`flex-shrink-0 lg:flex-shrink rounded-3xl border px-4 sm:px-5 py-3 sm:py-4 text-left transition w-max lg:w-full ${active ? 'border-secondary bg-secondary/10 text-white' : 'border-white/10 bg-white/5 text-slate-300 hover:border-secondary hover:bg-white/10'}`}
      aria-current={active ? 'step' : undefined}
    >
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{role.company}</p>
      <h3 className="mt-1 text-sm sm:text-lg font-semibold whitespace-nowrap sm:whitespace-normal">{role.role}</h3>
      <p className="mt-1 text-xs sm:text-sm text-slate-400">{role.period}</p>
    </motion.button>
  )
}

function ExperienceDetails({ role }: { role: ExperienceRole }) {
  const [summary, ...points] = role.highlights

  return (
    <div className="min-w-0 rounded-[32px] border border-white/10 bg-white/5 p-4 sm:p-6 shadow-[0_40px_120px_-80px_rgba(6,182,212,0.35)] backdrop-blur-2xl">
      <motion.div key={role.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="rounded-full bg-primary/15 px-2 sm:px-3 py-1 text-xs uppercase tracking-[0.24em] text-primary">{role.company}</span>
          <span className="rounded-full bg-secondary/15 px-2 sm:px-3 py-1 text-xs uppercase tracking-[0.24em] text-secondary">{role.role}</span>
        </div>
        {summary ? (
          <p className="mt-4 sm:mt-6 text-sm sm:text-base leading-6 sm:leading-7 text-slate-200">{summary}</p>
        ) : null}
        <ul className="mt-4 sm:mt-5 space-y-2 sm:space-y-3 text-xs sm:text-sm text-slate-300">
          {points.map(point => <li key={point} className="list-disc list-inside">{point}</li>)}
        </ul>
        <div className="mt-4 sm:mt-6 flex flex-wrap gap-2">
          {role.tech.map(skill => (
            <span key={skill} className="rounded-full border border-white/10 bg-white/5 px-2 sm:px-3 py-1 text-xs text-slate-200">{skill}</span>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
