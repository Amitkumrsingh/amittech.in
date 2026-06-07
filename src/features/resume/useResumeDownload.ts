"use client"

import { useState } from 'react'
import {
  createResumeDownloadPayload,
  dispatchResumeDownloaded,
  forwardResumeDownloadToClientAnalytics,
  recordResumeDownloadExperimentMetric,
  trackResumeDownload,
  triggerResumeFileDownload
} from './resume.client'

type UseResumeDownloadOptions = {
  href: string
  filename?: string
}

export function useResumeDownload({ href, filename }: UseResumeDownloadOptions) {
  const [loading, setLoading] = useState(false)

  async function download() {
    setLoading(true)

    try {
      const payload = createResumeDownloadPayload(filename || href)
      void forwardResumeDownloadToClientAnalytics(payload)

      const tracking = trackResumeDownload(payload)
      triggerResumeFileDownload(href, filename)

      const result = await tracking
      dispatchResumeDownloaded(
        typeof result?.downloads === 'number'
          ? { downloads: Number(result.downloads), storage: result.storage }
          : undefined
      )
      recordResumeDownloadExperimentMetric()
    } catch (e) {
      dispatchResumeDownloaded()
    } finally {
      setLoading(false)
    }
  }

  return { loading, download }
}
