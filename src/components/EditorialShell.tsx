"use client"

import { Moon, PenLine, Sun } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'

type ReadingTheme = 'light' | 'dark'

export default function EditorialShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [theme, setTheme] = useState<ReadingTheme>('light')
  const isAdmin = pathname.startsWith('/admin')

  useEffect(() => {
    const stored = window.localStorage.getItem('amittech-reading-theme')
    const nextTheme: ReadingTheme = stored === 'dark' ? 'dark' : 'light'
    setTheme(nextTheme)
    document.documentElement.dataset.editorialTheme = nextTheme
  }, [])

  function toggleTheme() {
    const nextTheme: ReadingTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    window.localStorage.setItem('amittech-reading-theme', nextTheme)
    document.documentElement.dataset.editorialTheme = nextTheme
  }

  return (
    <div className="editorial-shell min-h-screen" data-theme={theme}>
      <header className="editorial-header">
        <Link href="/blog" className="editorial-brand" aria-label="Amit Kumar Engineering Notes">
          <span className="editorial-brand-mark">AKS</span>
          <span>
            <strong>{isAdmin ? 'Writing Studio' : 'Engineering Notes'}</strong>
            <small>by Amit Kumar Singh</small>
          </span>
        </Link>

        <nav aria-label="Editorial navigation" className="editorial-nav">
          <Link href="/blog">Stories</Link>
          <Link href="/#ai">AI work</Link>
          <Link href="/#about">About</Link>
          {!isAdmin ? <Link href="/admin" className="editorial-write"><PenLine size={16} aria-hidden="true" />Write</Link> : null}
          <button type="button" className="editorial-theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} aria-pressed={theme === 'dark'}>
            {theme === 'light' ? <Moon size={17} aria-hidden="true" /> : <Sun size={17} aria-hidden="true" />}
            <span>{theme === 'light' ? 'Dark' : 'Light'}</span>
          </button>
        </nav>
      </header>
      {children}
    </div>
  )
}
