"use client"

import { useState } from 'react'
import type { Project } from '../data/projects'
import ProjectModal from './ProjectModal'
import ExperienceTimeline from './ExperienceTimeline'
import ImpactMetrics from './ImpactMetrics'
import ExpertiseGrid from './ExpertiseGrid'
import ProjectsSection from './ProjectsSection'
import ContactSection from './ContactSection'

export default function InteractiveArea() {
  const [open, setOpen] = useState<Project | null>(null)

  return (
    <>
      <ImpactMetrics />
      <ExperienceTimeline />

      <ProjectsSection onProjectOpen={setOpen} />
      <ExpertiseGrid />
      <ContactSection />
      <ProjectModal project={open} onClose={() => setOpen(null)} />
    </>
  )
}
