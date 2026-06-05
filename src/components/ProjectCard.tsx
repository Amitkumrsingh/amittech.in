"use client"

import { motion } from '../lib/motion'
import motionTheme from '../lib/motionTheme'
import MicroButton from './MicroButton'
import { trackProjectView } from '../lib/analytics'
import type { Project } from '../data/projects'

type ProjectCardProps = {
  project: Project
  onOpen: (project: Project) => void
}

export default function ProjectCard({ project, onOpen }: ProjectCardProps) {
  return (
    <motion.article layout variants={motionTheme.variants.fadeUp()} whileHover={{ y: -6, scale: 1.01 }} transition={{ duration: motionTheme.duration.base }} className="rounded-[24px] sm:rounded-[32px] border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-2xl shadow-sm hover:shadow-md" role="article" aria-labelledby={`proj-${project.id}`}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3 sm:gap-4">
          <div>
            <h3 id={`proj-${project.id}`} className="text-lg sm:text-xl font-semibold text-white">{project.title}</h3>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-400">{project.company} — {project.period}</p>
          </div>
          <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs uppercase tracking-[0.18em] text-secondary flex-shrink-0">{project.role}</span>
        </div>

        <p className="text-sm leading-6 sm:leading-7 text-slate-300">{project.businessProblem}</p>

        <div className="mt-2 flex flex-wrap gap-2">
          {project.tech.map((t: string) => (
            <span key={t} className="rounded-full bg-white/5 px-2 sm:px-3 py-1 text-xs text-slate-200">{t}</span>
          ))}
        </div>

        <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
          <MicroButton onClick={() => { onOpen(project); trackProjectView(project.id) }} className="rounded-full bg-secondary px-4 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-black transition hover:bg-secondary/90">View details</MicroButton>
          {project.demoLink ? (
            <a href={project.demoLink} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/10 px-4 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm text-slate-200 hover:bg-white/5">Live</a>
          ) : null}
        </div>
      </div>
    </motion.article>
  )
}
