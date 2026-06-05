"use client"

import { useState } from 'react'
import { motion } from '../lib/motion'
import motionTheme from '../lib/motionTheme'
import { trackSkillSelect } from '../lib/analytics'
import { SKILL_CATEGORIES, SKILL_DETAILS, type SkillCategory } from '../data/expertise'
import SectionHeader from './SectionHeader'

export default function ExpertiseGrid() {
  const [selected, setSelected] = useState<string | null>(null)

  function handleSkillSelect(item: string) {
    const nextSelected = selected === item ? null : item
    setSelected(nextSelected)
    if (nextSelected) trackSkillSelect(nextSelected)
  }

  return (
    <section id="expertise" className="mt-12">
      <SectionHeader
        eyebrow="Technical expertise"
        title="Deep expertise across backend, cloud, and distributed systems."
        description="Select a technology to see the engineering context behind it."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <motion.div className="grid gap-4" variants={motionTheme.variants.containerStagger(0.06)} initial="hidden" whileInView="show" viewport={{ once: true }}>
          {SKILL_CATEGORIES.map((category, categoryIdx) => (
            <SkillCategoryCard
              key={category.title}
              category={category}
              categoryIdx={categoryIdx}
              selected={selected}
              onSelect={handleSkillSelect}
            />
          ))}
        </motion.div>

        <SkillDetailPanel selected={selected} />
      </div>
    </section>
  )
}

type SkillCategoryCardProps = {
  category: SkillCategory
  categoryIdx: number
  selected: string | null
  onSelect: (item: string) => void
}

function SkillCategoryCard({ category, categoryIdx, selected, onSelect }: SkillCategoryCardProps) {
  return (
    <motion.div key={category.title} className="rounded-3xl border border-white/10 bg-white/5 p-5" variants={motionTheme.variants.fadeUp(categoryIdx * 0.04)}>
      <h3 className="text-sm uppercase tracking-[0.22em] text-slate-400">{category.title}</h3>
      <motion.div className="mt-4 flex flex-wrap gap-3" variants={motionTheme.variants.containerStagger(0.03)}>
        {category.items.map((item, itemIdx) => (
          <motion.button
            key={item}
            type="button"
            variants={motionTheme.variants.fadeUp(itemIdx * 0.02)}
            whileHover={{ y: -4, scale: 1.02 }}
            onClick={() => onSelect(item)}
            className={`tech-pill px-4 py-2 rounded-full text-sm font-medium transition ${selected === item ? 'ring-2 ring-auroraTeal/70 bg-white/10' : 'bg-white/5 hover:bg-white/10'}`}
            aria-pressed={selected === item}
          >
            {item}
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  )
}

function SkillDetailPanel({ selected }: { selected: string | null }) {
  return (
    <motion.aside className="rounded-3xl border border-white/10 bg-surface/80 p-6 shadow-[0_40px_120px_-90px_rgba(236,72,153,0.4)]" variants={motionTheme.variants.fadeUp()} initial="hidden" whileInView="show" viewport={{ once: true }}>
      <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Selected skill</p>
      <div className="mt-4 min-h-[160px]">
        {selected ? (
          <>
            <h3 className="text-xl font-semibold text-white">{selected}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">{SKILL_DETAILS[selected] ?? 'Focused delivery experience in production systems and scale-driven engineering.'}</p>
          </>
        ) : (
          <p className="text-sm leading-7 text-slate-300">Tap a technology pill to reveal the product and engineering context behind it.</p>
        )}
      </div>
    </motion.aside>
  )
}
