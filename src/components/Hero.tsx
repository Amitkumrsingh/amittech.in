"use client"

import { motion } from '../lib/motion'
import ResumeButton from './ResumeButton'
import DownloadCounter from './DownloadCounter'
import ButtonLink, { buttonClassName } from './ButtonLink'
import { RESUME_FILE } from '../lib/site'
import { HERO_IMPACT_METRICS, HERO_SYSTEM_NODES } from '../features/home'

export default function Hero() {
  return (
    <motion.section id="hero" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: 'easeOut' }} className="relative overflow-hidden border-b border-white/10 bg-[#0B0F14] pb-10 sm:pb-14">
      <HeroBackground />

      <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-secondary">
            Backend systems <span className="text-slate-600">/</span> Agentic AI <span className="text-slate-600">/</span> Production
          </p>

          <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.02] tracking-tight text-white sm:text-6xl md:text-7xl">
            I build reliable systems and useful AI workflows.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            Software Development Engineer focused on backend platforms, distributed systems, and agentic AI. I work across Python, Kafka, AWS, RAG, MCP, and production reliability.
          </p>

          <HeroActions />
        </div>

        <div className="grid gap-4 border-l border-white/10 pl-5 lg:mb-1">
          <SystemMap />
          <ProductionConsole />
        </div>
      </div>

      <ImpactPanel />
    </motion.section>
  )
}

function HeroBackground() {
  return (
    <div className="absolute inset-0 -z-10">
      <motion.div
        animate={{ scale: [1, 1.025, 1], x: ['-1%', '1%', '-1%'] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_82%_12%,rgba(124,58,237,0.2),transparent_32%),radial-gradient(circle_at_66%_86%,rgba(236,72,153,0.16),transparent_28%)]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[length:42px_42px] opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0B0F14]/40 via-transparent to-[#0B0F14]/90" />
    </div>
  )
}

function SystemMap() {
  return (
    <div className="relative min-h-[260px] overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.025] p-5">
      <div className="absolute inset-6 rounded-[24px] border border-white/10" />
      <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-secondary/35 bg-secondary/10 shadow-[0_0_60px_-20px_rgba(6,182,212,0.9)]" />
      <div className="absolute left-1/2 top-1/2 h-px w-[72%] -translate-x-1/2 bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
      <div className="absolute left-1/2 top-1/2 h-[70%] w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-primary/55 to-transparent" />
      <div className="absolute left-[18%] top-[26%] h-px w-[60%] rotate-[24deg] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute left-[18%] bottom-[26%] h-px w-[60%] -rotate-[22deg] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <motion.div
        animate={{ offsetDistance: ['0%', '100%'] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        className="absolute h-2 w-2 rounded-full bg-secondary shadow-[0_0_24px_rgba(6,182,212,0.9)] [offset-path:path('M_48_98_C_160_0_280_0_370_112')]"
      />
      <motion.div
        animate={{ offsetDistance: ['0%', '100%'] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'linear', delay: 1.4 }}
        className="absolute h-2 w-2 rounded-full bg-accent shadow-[0_0_24px_rgba(236,72,153,0.8)] [offset-path:path('M_360_210_C_270_300_130_292_58_188')]"
      />

      {HERO_SYSTEM_NODES.map(node => (
        <div key={node.label} className={`absolute ${node.className}`}>
          <div className="rounded-2xl border border-white/10 bg-[#0A0A0F]/70 px-3 py-2 text-xs font-semibold text-slate-200 backdrop-blur">
            {node.label}
          </div>
        </div>
      ))}

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <p className="text-xs uppercase tracking-[0.24em] text-secondary">workflow core</p>
        <p className="mt-1 text-sm font-semibold text-white">events in motion</p>
      </div>
    </div>
  )
}

function ProductionConsole() {
  return (
    <div className="rounded-[16px] border border-white/10 bg-black/20 p-4 font-mono text-xs text-slate-300">
      <div className="mb-3 flex gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-accent" />
        <span className="h-2.5 w-2.5 rounded-full bg-gold" />
        <span className="h-2.5 w-2.5 rounded-full bg-secondary" />
      </div>
      <p><span className="text-secondary">status:</span> production-ready</p>
      <p className="mt-2"><span className="text-secondary">systems:</span> HRMS | Fintech | CRM</p>
      <p className="mt-2"><span className="text-secondary">focus:</span> scale | reliability | impact</p>
    </div>
  )
}

function ImpactPanel() {
  return (
    <div className="relative mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {HERO_IMPACT_METRICS.map(metric => (
        <div key={metric.label} className="rounded-3xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur-2xl">
          <p className="text-2xl font-semibold text-white sm:text-3xl">{metric.value}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">{metric.label}</p>
        </div>
      ))}
    </div>
  )
}

function HeroActions() {
  return (
    <div className="mt-7 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
      <ButtonLink href="#ai" variant="secondary">
        Explore AI work
      </ButtonLink>
      <ButtonLink href="#projects" variant="ghost">
        View Projects
      </ButtonLink>
      <ButtonLink href="/blog" variant="ghost">
        Read Insights
      </ButtonLink>
      <div className="flex items-center gap-3 sm:gap-4">
        <ResumeButton
          href={`/${RESUME_FILE}`}
          filename={RESUME_FILE}
          label="Download Resume"
          className={buttonClassName({ variant: 'ghost' })}
        />
        <span className="hidden sm:inline-block"><DownloadCounter /></span>
      </div>
    </div>
  )
}
