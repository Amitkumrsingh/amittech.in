export const RESUME_DOWNLOADED_EVENT = 'resume:downloaded'
export const RESUME_DOWNLOAD_EVENT = 'resume_download'
export const RESUME_DOWNLOAD_COUNT_KEY = 'resume-download-count'

export type ResumeDownloadedDetail = {
  downloads?: number
  storage?: string
}

export type ResumeDownloadPayload = {
  event: typeof RESUME_DOWNLOAD_EVENT
  file: string
  ts: string
}
