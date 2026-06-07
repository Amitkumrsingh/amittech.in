import type { NextApiRequest, NextApiResponse } from 'next'
import { incrementDownloadCount } from '../../lib/downloadCounter'
import { forwardResumeDownloadAnalytics } from '../../lib/serverAnalytics'

const isDev = process.env.NODE_ENV === 'development'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false })

  const body = req.body || {}
  const isResumeDownload = body.event === 'resume_download' || Boolean(body.file)

  if (isDev) console.log('[track-download]', body)

  try {
    await forwardResumeDownloadAnalytics(body)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('analytics forward failed', err)
  }
  let counter = null
  if (isResumeDownload) {
    try {
      counter = await incrementDownloadCount()
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('download counter update failed', e)
    }
  }

  res.setHeader('Cache-Control', 'no-store, max-age=0')
  res.status(200).json({ ok: true, ...counter })
}
