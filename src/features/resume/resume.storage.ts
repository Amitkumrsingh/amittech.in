import { RESUME_DOWNLOAD_COUNT_KEY } from './resume.events'

export function readLocalResumeDownloadCount() {
  try {
    return Number(window.localStorage.getItem(RESUME_DOWNLOAD_COUNT_KEY) || 0)
  } catch (err) {
    return 0
  }
}

export function writeLocalResumeDownloadCount(downloads: number) {
  try {
    window.localStorage.setItem(RESUME_DOWNLOAD_COUNT_KEY, String(downloads))
  } catch (err) {
    // ignore local storage failures
  }
}
