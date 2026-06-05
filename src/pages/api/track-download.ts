import type { NextApiRequest, NextApiResponse } from 'next'

async function forwardToGA4(body: any) {
  const measurementId = process.env.GA4_MEASUREMENT_ID
  const apiSecret = process.env.GA4_API_SECRET
  if (!measurementId || !apiSecret) return

  const payload = {
    client_id: body.client_id || 'resume-download',
    events: [
      {
        name: 'resume_download',
        params: {
          file: body.file,
          ts: body.ts
        }
      }
    ]
  }

  await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

async function forwardToMixpanel(body: any) {
  const token = process.env.MIXPANEL_TOKEN
  if (!token) return

  const event = {
    event: 'resume_download',
    properties: {
      token,
      file: body.file,
      ts: body.ts
    }
  }

  const payload = Buffer.from(JSON.stringify(event)).toString('base64')
  await fetch('https://api.mixpanel.com/track?verbose=1', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(payload)}`
  })
}

async function forwardToSegment(body: any) {
  const writeKey = process.env.SEGMENT_WRITE_KEY
  if (!writeKey) return

  const payload = {
    event: 'Resume Downloaded',
    userId: body.userId || 'anonymous',
    properties: {
      file: body.file,
      ts: body.ts
    }
  }

  await fetch('https://api.segment.io/v1/track', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(writeKey + ':').toString('base64')}`
    },
    body: JSON.stringify(payload)
  })
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false })

  const body = req.body || {}

  // Log locally
  // eslint-disable-next-line no-console
  console.log('[track-download]', body)

  const provider = process.env.ANALYTICS_PROVIDER || ''

  try {
    if (provider === 'ga4') {
      await forwardToGA4(body)
    } else if (provider === 'mixpanel') {
      await forwardToMixpanel(body)
    } else if (provider === 'segment') {
      await forwardToSegment(body)
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('analytics forward failed', err)
  }
  // Increment server-side persistent counter (data/downloads.json)
  try {
    const { promises: fs } = await import('fs')
    const { join } = await import('path')
    const DATA_PATH = join(process.cwd(), 'data')
    const FILE = join(DATA_PATH, 'downloads.json')
    await fs.mkdir(DATA_PATH, { recursive: true })
    let count = 0
    try {
      const raw = await fs.readFile(FILE, 'utf-8')
      const json = JSON.parse(raw)
      count = Number(json.downloads || 0)
    } catch (e) {
      count = 0
    }
    count = count + 1
    await fs.writeFile(FILE, JSON.stringify({ downloads: count }, null, 2), 'utf-8')
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('download counter update failed', e)
  }

  res.status(200).json({ ok: true })
}
