import type { NextApiRequest, NextApiResponse } from 'next'
import * as Sentry from '@sentry/nextjs'
import { requireSuperAdmin } from '../../../lib/api/auth'
import { methodNotAllowed, ok, withApiErrorHandling } from '../../../lib/api/http'

type TestMode = 'log' | 'error'

function getMode(value: unknown): TestMode {
  return value === 'error' ? 'error' : 'log'
}

export default withApiErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

  const user = await requireSuperAdmin(req)
  const mode = getMode(req.body?.mode)

  if (mode === 'error') {
    Sentry.logger.error('Manual monitoring error test triggered', {
      route: '/api/admin/monitoring-test',
      triggeredBy: user.email
    })

    throw new Error('Manual GlitchTip error test from AmitTech admin dashboard')
  }

  Sentry.logger.warn('Manual monitoring log test triggered', {
    route: '/api/admin/monitoring-test',
    triggeredBy: user.email
  })

  return ok(res, { sent: true, mode })
})
