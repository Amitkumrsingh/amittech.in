"use client"

import { motion } from '../lib/motion'
import motionTheme from '../lib/motionTheme'
import { useMotion } from '../lib/motionContext'
import ArchitectureDiagram from './ArchitectureDiagram'
import MicroButton from './MicroButton'
import type { Project } from '../data/projects'

type ProjectModalProps = {
  project: Project | null
  onClose: () => void
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  const { enabled: motionEnabled } = useMotion()

  if (!project) return null

  // Conditionally apply variants based on motion preference
  const fadeUpVariant = motionEnabled ? motionTheme.variants.fadeUp() : undefined
  const containerStaggerVariant = motionEnabled ? motionTheme.variants.containerStagger(0.05) : undefined
  const containerStaggerVariant2 = motionEnabled ? motionTheme.variants.containerStagger(0.04) : undefined
  const containerStaggerVariant3 = motionEnabled ? motionTheme.variants.containerStagger(0.03) : undefined

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 sm:px-6">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        variants={fadeUpVariant}
        initial={motionEnabled ? "hidden" : "visible"}
        animate={motionEnabled ? "show" : "visible"}
        className="relative z-10 w-full max-w-4xl overflow-hidden rounded-[32px] border border-white/10 bg-[#12121A]/95 p-6 shadow-[0_50px_120px_-70px_rgba(0,0,0,0.8)]"
      >
        <MicroButton onClick={onClose} className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">Close</MicroButton>
        <motion.div
          className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"
          variants={containerStaggerVariant}
          initial={motionEnabled ? "hidden" : "visible"}
          animate={motionEnabled ? "show" : "visible"}
        >
          <motion.div variants={motionEnabled ? undefined : undefined}>
            <motion.p className="text-sm uppercase tracking-[0.24em] text-secondary" variants={motionEnabled ? motionTheme.variants.fadeUp(0) : undefined}>{project.company}</motion.p>
            <motion.h2 className="mt-3 text-3xl font-semibold text-white" variants={motionEnabled ? motionTheme.variants.fadeUp(0.02) : undefined}>{project.title}</motion.h2>
            <motion.p className="mt-2 text-sm text-slate-400" variants={motionEnabled ? motionTheme.variants.fadeUp(0.04) : undefined}>{project.role} • {project.period}</motion.p>
            <motion.div
              className="mt-6 space-y-5 text-slate-300"
              variants={containerStaggerVariant3}
              initial={motionEnabled ? "hidden" : "visible"}
              animate={motionEnabled ? "show" : "visible"}
            >
              <motion.div variants={motionEnabled ? motionTheme.variants.fadeUp(0.06) : undefined}>
                <h3 className="text-sm uppercase tracking-[0.22em] text-slate-400">Business problem</h3>
                <p className="mt-3 text-sm leading-7">{project.businessProblem}</p>
              </motion.div>
              <motion.div variants={motionEnabled ? motionTheme.variants.fadeUp(0.08) : undefined}>
                <h3 className="text-sm uppercase tracking-[0.22em] text-slate-400">Scale</h3>
                <p className="mt-3 text-sm leading-7">{project.scale}</p>
              </motion.div>
              <motion.div variants={motionEnabled ? motionTheme.variants.fadeUp(0.1) : undefined}>
                <h3 className="text-sm uppercase tracking-[0.22em] text-slate-400">Impact</h3>
                <ul className="mt-3 space-y-2 text-sm leading-7">
                  {project.impact.map((item: string, idx: number) => (
                    <motion.li key={item} className="list-disc list-inside" variants={motionEnabled ? motionTheme.variants.fadeUp(idx * 0.02) : undefined}>{item}</motion.li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div
            className="space-y-5"
            variants={containerStaggerVariant2}
            initial={motionEnabled ? "hidden" : "visible"}
            animate={motionEnabled ? "show" : "visible"}
          >
            <motion.div className="rounded-3xl border border-white/10 bg-white/5 p-4" variants={motionEnabled ? motionTheme.variants.fadeUp(0.06) : undefined}>
              <h4 className="text-sm uppercase tracking-[0.24em] text-slate-400">Technologies</h4>
              <motion.div
                className="mt-4 flex flex-wrap gap-2"
                variants={containerStaggerVariant3}
                initial={motionEnabled ? "hidden" : "visible"}
                animate={motionEnabled ? "show" : "visible"}
              >
                {project.tech.map((skill: string, i: number) => (
                  <motion.span key={skill} className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-200" variants={motionEnabled ? motionTheme.variants.fadeUp(i * 0.02) : undefined}>{skill}</motion.span>
                ))}
              </motion.div>
            </motion.div>
            <motion.div className="rounded-3xl border border-white/10 bg-black/30 p-4" variants={motionEnabled ? motionTheme.variants.fadeUp(0.08) : undefined}>
              <h4 className="text-sm uppercase tracking-[0.24em] text-slate-400">Architecture</h4>
              <div className="mt-3 p-3 rounded-3xl bg-[#0b1320]">
                <ArchitectureDiagram project={project} />
              </div>
              <p className="mt-3 text-xs text-slate-500">Drag nodes or focus and move with arrow keys for an interactive system sketch.</p>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5" variants={motionEnabled ? motionTheme.variants.fadeUp(0.12) : undefined}>
          <h4 className="text-sm uppercase tracking-[0.24em] text-slate-400">Sample code</h4>
          <pre className="mt-4 max-h-72 overflow-auto rounded-3xl bg-black/90 p-4 text-sm font-mono text-slate-100"><code>{project.sampleCode}</code></pre>
        </motion.div>
      </motion.div>
    </div>
  )
}
