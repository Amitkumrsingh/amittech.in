import type { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed, ok, withApiErrorHandling } from '../../../lib/api/http'

export default withApiErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET'])

  const googleClientId = process.env.GOOGLE_CLIENT_ID || null
  return ok(res, {
    googleClientId,
    googleConfigured: Boolean(googleClientId)
  })
})
