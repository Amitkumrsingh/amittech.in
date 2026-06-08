import type { NextApiRequest, NextApiResponse } from 'next'
import { requireSuperAdmin } from '../../../lib/api/auth'
import { getQueryNumber, methodNotAllowed, ok, withApiErrorHandling } from '../../../lib/api/http'
import { getApiMetricsOverview } from '../../../lib/api/metrics'

export default withApiErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET'])

  await requireSuperAdmin(req)
  const minutes = getQueryNumber(req.query.minutes, getQueryNumber(req.query.hours, 24) * 60)
  const metrics = await getApiMetricsOverview(minutes)
  return ok(res, metrics)
})
