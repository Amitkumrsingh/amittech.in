import type { NextApiRequest, NextApiResponse } from 'next'
import { getDownloadCount } from '../../lib/downloadCounter'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false })
  res.setHeader('Cache-Control', 'no-store, max-age=0')
  const count = await getDownloadCount()
  res.status(200).json(count)
}
