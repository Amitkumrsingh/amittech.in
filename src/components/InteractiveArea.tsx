"use client"

import ExperienceTimeline from './ExperienceTimeline'
import ImpactMetrics from './ImpactMetrics'
import ExpertiseGrid from './ExpertiseGrid'
import ProjectsSection from './ProjectsSection'
import ContactSection from './ContactSection'

export default function InteractiveArea() {
  return (
    <>
      <ImpactMetrics />
      <ExperienceTimeline />

      <ProjectsSection />
      <ExpertiseGrid />
      <ContactSection />
    </>
  )
}
