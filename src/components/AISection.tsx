"use client"

import { motion } from '../lib/motion'
import motionTheme from '../lib/motionTheme'
import { AI_CAPABILITIES, AI_FOCUS_ITEMS, type AiFocus } from '../data/ai'
import SectionHeader from './SectionHeader'
import TagList from './TagList'

export default function AISection() {
  return (
    <section id="ai" className="mt-16 border-y border-white/10 py-12 sm:py-16">
      <SectionHeader
        eyebrow="AI & agentic systems"
        title="Practical AI layered onto reliable systems."
        description="I build AI workflows that can retrieve context, call tools, stream useful answers, and keep humans in the loop when the underlying data matters."
      />

      <motion.div
        className="mt-8 grid gap-4 lg:grid-cols-2"
        variants={motionTheme.variants.containerStagger(0.08)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
      >
        {AI_FOCUS_ITEMS.map((item, index) => <AICard key={item.id} item={item} index={index} />)}
      </motion.div>

      <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-white/10 pt-6">
        <span className="mr-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Working toolkit</span>
        {AI_CAPABILITIES.map(capability => (
          <span key={capability} className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs text-slate-300">
            {capability}
          </span>
        ))}
      </div>
    </section>
  )
}

function AICard({ item, index }: { item: AiFocus; index: number }) {
  const accent = item.accent === 'cyan' ? 'text-secondary border-secondary/30' : 'text-primary border-primary/30'
  const dot = item.accent === 'cyan' ? 'bg-secondary' : 'bg-primary'

  return (
    <motion.article
      variants={motionTheme.variants.fadeUp(index * 0.06)}
      className="group relative overflow-hidden rounded-[22px] border border-white/10 bg-[#11161E]/70 p-5 transition-colors hover:border-white/20 sm:p-6"
    >
      <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${accent}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
        {item.eyebrow}
      </div>
      <h3 className="mt-5 text-2xl font-semibold tracking-tight text-white">{item.title}</h3>
      <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">{item.summary}</p>

      <ul className="mt-5 space-y-3 border-t border-white/10 pt-5 text-sm leading-6 text-slate-300">
        {item.details.map(detail => (
          <li key={detail} className="flex gap-3">
            <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
            <span>{detail}</span>
          </li>
        ))}
      </ul>

      <TagList
        items={item.stack}
        className="mt-6"
        itemClassName="border border-white/10 bg-white/[0.035] px-2.5 py-1 text-slate-300"
      />
    </motion.article>
  )
}
