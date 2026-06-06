"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ResumeButton from './ResumeButton'
import { buttonClassName } from './ButtonLink'

const RESUME_FILE = 'Amit_Kumar_Singh_Resume.pdf'

const NAV_LINKS = [
  { label: 'Home', href: '/#hero', section: 'hero' },
  { label: 'About', href: '/#about', section: 'about' },
  { label: 'Experience', href: '/#experience', section: 'experience' },
  { label: 'Projects', href: '/#projects', section: 'projects' },
  { label: 'Skills', href: '/#expertise', section: 'expertise' },
  { label: 'Blog', href: '/blog', section: 'blog' },
  { label: 'Contact', href: '/#contact', section: 'contact' }
]

const HOME_SECTION_IDS = NAV_LINKS
  .map(link => link.section)
  .filter(section => section !== 'blog')

export default function Navbar() {
  const pathname = usePathname()
  const [activeSection, setActiveSection] = useState('hero')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const currentPath = pathname || '/'

    if (currentPath !== '/') {
      setActiveSection(currentPath.startsWith('/blog') ? 'blog' : '')
      return
    }

    let frame = 0

    const getSections = () => HOME_SECTION_IDS
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
  }, [pathname])

  return (
    <header className="fixed inset-x-0 top-3 z-[998] px-3 sm:top-4 sm:px-6">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-full border border-white/10 bg-[#0A0A0F]/72 px-3 py-2 shadow-[0_24px_80px_-55px_rgba(6,182,212,0.55)] backdrop-blur-2xl">
        <Link href="/#hero" className="inline-flex items-center gap-3 rounded-full px-2 py-1" onClick={() => setOpen(false)}>
          <span className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-white">AKS</span>
          <span className="hidden text-sm font-semibold text-white sm:inline">Amit Kumar Singh</span>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map(link => (
            <NavLink key={link.label} link={link} active={activeSection === link.section} onSelect={() => setActiveSection(link.section)} />
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <ResumeButton
            href={`/${RESUME_FILE}`}
            filename={RESUME_FILE}
            label="Resume"
            className={buttonClassName({ variant: 'secondary', size: 'contact', radius: 'full', className: 'h-10 px-5' })}
          />
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 lg:hidden"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen(current => !current)}
        >
          <span className="flex flex-col gap-1.5">
            <span className={`h-0.5 w-5 rounded-full bg-white transition ${open ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`h-0.5 w-5 rounded-full bg-white transition ${open ? 'opacity-0' : ''}`} />
            <span className={`h-0.5 w-5 rounded-full bg-white transition ${open ? '-translate-y-2 -rotate-45' : ''}`} />
          </span>
        </button>
      </nav>

      {open ? (
        <div className="mx-auto mt-3 max-w-6xl rounded-[28px] border border-white/10 bg-[#0A0A0F]/92 p-3 shadow-[0_40px_100px_-70px_rgba(124,58,237,0.65)] backdrop-blur-2xl lg:hidden">
          <div className="grid gap-1">
            {NAV_LINKS.map(link => (
              <Link
                key={link.label}
                href={link.href}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${activeSection === link.section ? 'bg-secondary/15 text-secondary' : 'text-slate-200 hover:bg-white/5'}`}
                onClick={() => {
                  setActiveSection(link.section)
                  setOpen(false)
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 border-t border-white/10 pt-3">
            <ResumeButton
              href={`/${RESUME_FILE}`}
              filename={RESUME_FILE}
              label="Resume"
              className={buttonClassName({ variant: 'secondary', size: 'contact', radius: 'full', className: 'w-full' })}
            />
          </div>
        </div>
      ) : null}
    </header>
  )
}

function NavLink({
  link,
  active,
  onSelect
}: {
  link: typeof NAV_LINKS[number]
  active: boolean
  onSelect: () => void
}) {
  return (
    <Link
      href={link.href}
      onClick={onSelect}
      className={`rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${active ? 'bg-secondary/15 text-secondary' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}
    >
      {link.label}
    </Link>
  )
}
