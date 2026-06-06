"use client"

import { useEffect, useState } from 'react'

const SOCIAL_LINKS = [
  {
    label: 'Email Amit',
    href: 'mailto:aksingh1109@gmail.com',
    icon: <MailIcon />
  },
  {
    label: 'GitHub',
    href: 'https://github.com/Amitkumrsingh',
    icon: <GitHubIcon />
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/amitkumrsingh/',
    icon: <LinkedInIcon />
  }
]

export default function Footer() {
  const [year, setYear] = useState('2026')

  useEffect(() => {
    setYear(String(new Date().getFullYear()))
  }, [])

  return (
    <footer className="px-4 pb-8 pt-8 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 border-t border-white/10 pt-5 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year} · Made with <span className="text-accent">♥</span> by{' '}
          <a
            href="https://github.com/Amitkumrsingh"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-white transition hover:text-secondary"
          >
            Amit Kumar
          </a>
        </p>

        <div className="flex items-center gap-2">
          {SOCIAL_LINKS.map(link => (
            <a
              key={link.label}
              href={link.href}
              target={link.href.startsWith('mailto:') ? undefined : '_blank'}
              rel={link.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
              aria-label={link.label}
              title={link.label}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-secondary/60 hover:bg-secondary/10 hover:text-secondary"
            >
              {link.icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}

function MailIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 6.5h16v11H4v-11Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m5 7 7 6 7-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9.1 19.2c-4.1 1.2-4.1-2-5.7-2.4m11.4 4v-3.1c0-.9.3-1.5.8-2-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.2 11.2 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.5-2.7 5.5-5.3 5.8.5.5.9 1.3.9 2.6v3.8"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(-2 -1)"
      />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6.5 9.5v8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M10.5 17.5v-8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M10.5 12.5c.6-1.9 4.5-2.2 4.5 1.3v3.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M6.5 6.6v.1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M4.5 3.8h15a.7.7 0 0 1 .7.7v15a.7.7 0 0 1-.7.7h-15a.7.7 0 0 1-.7-.7v-15a.7.7 0 0 1 .7-.7Z" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}
