"use client"

import type { MouseEvent } from 'react'
import MicroButton from './MicroButton'
import { useResumeDownload } from '../features/resume'

type Props = {
  href: string
  filename?: string
  label?: string
  className?: string
}

export default function ResumeButton({ href, filename, label = 'Download Resume', className = '' }: Props) {
  const { loading, download } = useResumeDownload({ href, filename })

  async function handleClick(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    await download()
  }

  return (
    <MicroButton
      onClick={handleClick}
      className={className}
      aria-label={label}
      type="button"
    >
      <span className="inline-flex items-center gap-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M12 3v10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 11l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M21 21H3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>{loading ? 'Preparing…' : label}</span>
      </span>
    </MicroButton>
  )
}
