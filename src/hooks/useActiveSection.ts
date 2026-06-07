"use client"

import { useEffect, useState } from 'react'

type UseActiveSectionOptions = {
  pathname: string | null
  sectionIds: readonly string[]
  defaultSectionId?: string
  blogSectionId?: string
}

export function useActiveSection({
  pathname,
  sectionIds,
  defaultSectionId = sectionIds[0] ?? '',
  blogSectionId = 'blog'
}: UseActiveSectionOptions) {
  const [activeSection, setActiveSection] = useState(defaultSectionId)

  useEffect(() => {
    const currentPath = pathname || '/'

    if (currentPath !== '/') {
      setActiveSection(currentPath.startsWith('/blog') ? blogSectionId : '')
      return
    }

    let frame = 0

    const getSections = () => sectionIds
      .map(section => document.getElementById(section))
      .filter(Boolean) as HTMLElement[]

    const updateActiveSection = () => {
      const sections = getSections()
      if (sections.length === 0) return

      const activationPoint = window.scrollY + Math.min(window.innerHeight * 0.38, 320)
      const active = sections.reduce((current, section) => {
        return section.offsetTop <= activationPoint ? section.id : current
      }, sections[0].id)

      const bottomReached = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
      setActiveSection(bottomReached ? sections[sections.length - 1].id : active)
    }

    const scheduleUpdate = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        updateActiveSection()
      })
    }

    updateActiveSection()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
    }
  }, [blogSectionId, defaultSectionId, pathname, sectionIds])

  return { activeSection, setActiveSection }
}
