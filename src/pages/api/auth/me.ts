import type { NextApiRequest, NextApiResponse } from 'next'
import { getCurrentUser } from '../../../lib/api/auth'
import { methodNotAllowed, ok, withApiErrorHandling } from '../../../lib/api/http'

export default withApiErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET'])

  const user = await getCurrentUser(req)
  return ok(res, { user })
})
