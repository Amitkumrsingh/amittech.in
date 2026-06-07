import type { NextApiRequest, NextApiResponse } from 'next'
import { clearSessionCookie, revokeSession } from '../../../lib/api/auth'
import { methodNotAllowed, ok, withApiErrorHandling } from '../../../lib/api/http'

export default withApiErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

  await revokeSession(req)
  clearSessionCookie(res)
  return ok(res, { loggedOut: true })
})
