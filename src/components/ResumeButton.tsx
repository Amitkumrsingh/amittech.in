"use client"

import { useState } from 'react'
import MicroButton from './MicroButton'
import { recordExperimentMetric } from '../lib/abTesting'

type Props = {
  href: string
  filename?: string
  label?: string
  className?: string
}

export default function ResumeButton({ href, filename, label = 'Download Resume', className = '' }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    setLoading(true)

    const payload = { event: 'resume_download', file: filename || href, ts: new Date().toISOString() }

    // Client-side forwarding to public analytics providers (only using NEXT_PUBLIC keys)
    try {
      const provider = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER
      if (provider === 'mixpanel' && process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
        const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN
        const event = { event: 'resume_download', properties: { token, file: payload.file, ts: payload.ts } }
        const encoded = typeof window !== 'undefined' ? btoa(JSON.stringify(event)) : ''
        if (encoded) {
          fetch('https://api.mixpanel.com/track?verbose=1', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `data=${encodeURIComponent(encoded)}`
          }).catch(() => {})
        }
      } else if (provider === 'ga4' && typeof window !== 'undefined') {
        const gtag = (window as any).gtag
        if (typeof gtag === 'function') {
          try { gtag('event', 'resume_download', { file: payload.file, ts: payload.ts }) } catch (e) {}
        } else if ((window as any).dataLayer) {
          (window as any).dataLayer.push({ event: 'resume_download', file: payload.file, ts: payload.ts })
        }
      }
    } catch (err) {
      console.warn('client analytics failed', err)
    }

    const trackDownload = async () => {
      try {
        const res = await fetch('/api/track-download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          cache: 'no-store'
        })

        if (!res.ok) return null
        return await res.json()
      } catch (err) {
        console.warn('track-download failed', err)
        return null
      }
    }

    const tracking = trackDownload()

    // Trigger the download while still inside the click interaction.
    const a = document.createElement('a')
    a.href = href
    if (filename) a.download = filename
    a.rel = 'noopener noreferrer'
    document.body.appendChild(a)
    a.click()
    a.remove()

    try {
      const result = await tracking
      window.dispatchEvent(new CustomEvent('resume:downloaded', {
        detail: typeof result?.downloads === 'number' ? { downloads: Number(result.downloads), storage: result.storage } : undefined
      }))
      recordExperimentMetric('motion_engagement', 'resumeDownloaded', true)
    } catch (e) {}

    setLoading(false)
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
