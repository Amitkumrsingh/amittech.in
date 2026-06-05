"use client"

import { motion } from '../lib/motion'
import motionTheme from '../lib/motionTheme'
import { PROJECTS, type Project } from '../data/projects'
import ProjectCard from './ProjectCard'
import SectionHeader from './SectionHeader'

type ProjectsSectionProps = {
  onProjectOpen: (project: Project) => void
}

export default function ProjectsSection({ onProjectOpen }: ProjectsSectionProps) {
  return (
    <section id="projects" className="mt-12 sm:mt-16">
      <SectionHeader
        eyebrow="Projects"
        title="Product-grade systems, not generic showcase work."
        description="Five engineering case studies that highlight distributed architecture, compliance, payments, CRM, and dynamic workflows."
        variant="compact"
        className="gap-3 sm:gap-4"
      />

      <motion.div className="mt-6 sm:mt-8 grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-2" variants={motionTheme.variants.containerStagger(0.06)} initial="hidden" whileInView="show" viewport={{ once: true }}>
        {PROJECTS.map(project => (
          <ProjectCard key={project.id} project={project} onOpen={onProjectOpen} />
        ))}
      </motion.div>
    </section>
  )
}
