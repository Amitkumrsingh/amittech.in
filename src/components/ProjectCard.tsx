"use client"

import { motion } from '../lib/motion'
import motionTheme from '../lib/motionTheme'
import type { Project } from '../features/projects'
import TagList from './TagList'

type ProjectCardProps = {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <motion.article layout variants={motionTheme.variants.fadeUp()} whileHover={{ y: -6, scale: 1.01 }} transition={{ duration: motionTheme.duration.base }} className="rounded-[24px] sm:rounded-[32px] border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-2xl shadow-sm hover:shadow-md" role="article" aria-labelledby={`proj-${project.id}`}>
      <div className="flex h-full flex-col gap-5">
        <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3 sm:gap-4">
          <div>
            <h3 id={`proj-${project.id}`} className="text-lg sm:text-xl font-semibold text-white">{project.title}</h3>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-400">{project.company} — {project.period}</p>
          </div>
          <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs uppercase tracking-[0.18em] text-secondary flex-shrink-0">{project.role}</span>
        </div>

        <p className="text-sm leading-6 sm:leading-7 text-slate-300">{project.businessProblem}</p>

        <ProjectDetail label="Scale" value={project.scale} />
        <ProjectDetail label="Architecture" value={project.architecture} />

        <div className="grid gap-4 md:grid-cols-2">
          <ProjectList title="Impact" items={project.impact} />
          <ProjectList title="Engineering challenges" items={project.challenges} />
        </div>

        <TagList
          items={project.tech}
          itemClassName="bg-white/5 px-2 sm:px-3 py-1 text-slate-200"
        />

        {project.demoLink ? (
          <a href={project.demoLink} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex w-max items-center justify-center rounded-full border border-white/10 px-4 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm text-slate-200 hover:bg-white/5">Live</a>
        ) : null}
      </div>
    </motion.article>
  )
}

function ProjectDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-white/10 pt-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{value}</p>
    </div>
  )
}

function ProjectList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="border-t border-white/10 pt-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{title}</p>
      <ul className="mt-2 space-y-2 text-sm leading-6 text-slate-300">
        {items.map(item => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
