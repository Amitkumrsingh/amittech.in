import { recordExperimentMetric } from '../../lib/abTesting'
import {
  RESUME_DOWNLOADED_EVENT,
  RESUME_DOWNLOAD_EVENT,
  type ResumeDownloadedDetail,
  type ResumeDownloadPayload
} from './resume.events'

type DownloadCountResponse = {
  downloads?: number
  storage?: string
}

export function createResumeDownloadPayload(file: string): ResumeDownloadPayload {
  return {
    event: RESUME_DOWNLOAD_EVENT,
    file,
    ts: new Date().toISOString()
  }
}

export async function forwardResumeDownloadToClientAnalytics(payload: ResumeDownloadPayload) {
  try {
    const provider = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER

    if (provider === 'mixpanel' && process.env.NEXT_PUBLIC_MIXPANEL_TOKEN) {
      const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN
      const event = { event: RESUME_DOWNLOAD_EVENT, properties: { token, file: payload.file, ts: payload.ts } }
      const encoded = typeof window !== 'undefined' ? btoa(JSON.stringify(event)) : ''

      if (encoded) {
        fetch('https://api.mixpanel.com/track?verbose=1', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `data=${encodeURIComponent(encoded)}`
        }).catch(() => {})
      }
    } else if (provider === 'ga4' && typeof window !== 'undefined') {
      const gtag = window.gtag

      if (typeof gtag === 'function') {
        try {
          gtag('event', RESUME_DOWNLOAD_EVENT, { file: payload.file, ts: payload.ts })
        } catch (e) {}
      } else if (window.dataLayer) {
        window.dataLayer.push({ event: RESUME_DOWNLOAD_EVENT, file: payload.file, ts: payload.ts })
      }
    }
  } catch (err) {
    console.warn('client analytics failed', err)
  }
}

export async function trackResumeDownload(payload: ResumeDownloadPayload): Promise<DownloadCountResponse | null> {
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

export async function fetchResumeDownloadCount(): Promise<number | null> {
  try {
    const res = await fetch('/api/download-count', { cache: 'no-store' })
    if (!res.ok) return null

    const json = await res.json()
    return Number(json.downloads || 0)
  } catch (err) {
    return null
  }
}

export function triggerResumeFileDownload(href: string, filename?: string) {
  const anchor = document.createElement('a')
  anchor.href = href
  if (filename) anchor.download = filename
  anchor.rel = 'noopener noreferrer'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
}

export function dispatchResumeDownloaded(detail?: ResumeDownloadedDetail) {
  window.dispatchEvent(new CustomEvent<ResumeDownloadedDetail>(RESUME_DOWNLOADED_EVENT, { detail }))
}

export function recordResumeDownloadExperimentMetric() {
  recordExperimentMetric('motion_engagement', 'resumeDownloaded', true)
}
