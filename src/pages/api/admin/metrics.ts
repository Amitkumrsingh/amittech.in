import type { NextApiRequest, NextApiResponse } from 'next'
import { requireSuperAdmin } from '../../../lib/api/auth'
import { getQueryNumber, methodNotAllowed, ok, withApiErrorHandling } from '../../../lib/api/http'
import { getApiMetricsOverview } from '../../../lib/api/metrics'

export default withApiErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET'])

  await requireSuperAdmin(req)
  const hours = getQueryNumber(req.query.hours, 24)
  const metrics = await getApiMetricsOverview(hours)
  return ok(res, metrics)
})
