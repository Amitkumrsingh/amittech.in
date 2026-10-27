"use client"

import ExperienceTimeline from './ExperienceTimeline'
import ImpactMetrics from './ImpactMetrics'
import ExpertiseGrid from './ExpertiseGrid'
import ProjectsSection from './ProjectsSection'
import ContactSection from './ContactSection'
import AboutSection from './AboutSection'
import AISection from './AISection'

export default function InteractiveArea() {
  return (
    <>
      <AboutSection />
      <ImpactMetrics />
      <ExperienceTimeline />

      <ProjectsSection />
      <AISection />
      <ExpertiseGrid />
      <ContactSection />
    </>
  )
}
