import type { NextApiRequest, NextApiResponse } from 'next'
import { getDownloadCount } from '../../lib/downloadCounter'
import { normalizeApiRoute, recordApiMetric } from '../../lib/api/metrics'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startedAt = Date.now()

  try {
    if (req.method !== 'GET') return res.status(405).json({ ok: false })
    res.setHeader('Cache-Control', 'no-store, max-age=0')
    const count = await getDownloadCount()
    res.status(200).json(count)
  } finally {
    await recordApiMetric({
      route: normalizeApiRoute(req.url),
      method: req.method || 'UNKNOWN',
      statusCode: res.statusCode || 200,
      latencyMs: Date.now() - startedAt
    })
  }
}
