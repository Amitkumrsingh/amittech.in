"use client"

import { motion } from '../lib/motion'
import ResumeButton from './ResumeButton'
import DownloadCounter from './DownloadCounter'
import ButtonLink, { buttonClassName } from './ButtonLink'

const RESUME_FILE = 'Amit_Kumar_Singh_Resume.pdf'

export default function Hero() {
  return (
    <motion.div id="hero" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: 'easeOut' }} className="relative overflow-hidden rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 md:p-12 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(6,182,212,0.14),transparent_30%),#0A0A0F] border border-white/10 shadow-[0_40px_120px_-100px_rgba(124,58,237,0.45)]">
      <HeroBackground />

      <div className="relative max-w-3xl">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs uppercase tracking-[0.32em] text-slate-300">
          Software Developer • Delhivery
        </p>

        <h1 className="mt-6 sm:mt-8 text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight text-white">Building resilient backend platforms and event-driven systems for high-growth operations.</h1>

        <p className="mt-4 sm:mt-6 max-w-2xl text-base sm:text-lg leading-6 sm:leading-8 text-slate-300">SDE with 3+ years of experience delivering distributed systems, payments workflows, CDC pipelines, and cloud-native backend products using Python, Kafka, AWS, and scalable microservices.</p>

        <HeroActions />
      </div>
    </motion.div>
  )
}

function HeroBackground() {
  return (
    <div className="absolute inset-0 -z-10 opacity-70">
      <motion.div
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(236,72,153,0.18),transparent_28%),radial-gradient(circle_at_80%_40%,rgba(6,182,212,0.14),transparent_25%)]"
      />
      <div className="absolute inset-0 backdrop-blur-2xl" />
    </div>
  )
}

function HeroActions() {
  return (
    <div className="mt-6 sm:mt-10 flex flex-col gap-3 sm:gap-4 sm:flex-row">
      <ButtonLink href="#projects" variant="gradient">
        View Projects
      </ButtonLink>
      <ButtonLink href="#contact" variant="ghost">
        Contact Me
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
