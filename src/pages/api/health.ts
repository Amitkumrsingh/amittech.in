import type { NextApiRequest, NextApiResponse } from 'next'
import { methodNotAllowed } from '../../lib/api/http'
import { prisma } from '../../lib/api/prisma'

type HealthState = 'ok' | 'degraded' | 'skipped'

type HealthCheck = {
  status: HealthState
  latencyMs?: number
  message?: string
}

type HealthResponse = {
  ok: boolean
  service: string
  environment: string
  timestamp: string
  checks: {
    app: HealthCheck
    database: HealthCheck
    media: HealthCheck
    monitoring: HealthCheck
  }
}

async function measure<T>(fn: () => Promise<T>) {
  const startedAt = Date.now()
  const value = await fn()
  return { value, latencyMs: Date.now() - startedAt }
}

async function checkDatabase(): Promise<HealthCheck> {
  if (!process.env.DATABASE_URL) {
    return { status: 'skipped', message: 'DATABASE_URL is not configured' }
  }

  try {
    const { latencyMs } = await measure(() => prisma.$queryRaw`SELECT 1`)
    return { status: 'ok', latencyMs }
  } catch {
    return { status: 'degraded', message: 'Database query failed' }
  }
}

function envCheck(isConfigured: boolean, missingMessage: string): HealthCheck {
  if (isConfigured) return { status: 'ok' }
  return { status: 'skipped', message: missingMessage }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<HealthResponse | { ok: false; error: string }>) {
  if (req.method !== 'GET' && req.method !== 'HEAD') return methodNotAllowed(res, ['GET', 'HEAD'])

  const database = await checkDatabase()
  const response: HealthResponse = {
    ok: database.status !== 'degraded',
    service: 'amittech-portfolio',
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown',
    timestamp: new Date().toISOString(),
    checks: {
      app: { status: 'ok' },
      database,
      media: envCheck(
        Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET),
        'Cloudinary upload env vars are not fully configured'
      ),
      monitoring: envCheck(
        Boolean(process.env.GLITCHTIP_DSN || process.env.NEXT_PUBLIC_GLITCHTIP_DSN || process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN),
        'GlitchTip DSN is not configured'
      )
    }
  }

  const statusCode = response.ok ? 200 : 503
  res.setHeader('Cache-Control', 'no-store, max-age=0')
  if (req.method === 'HEAD') return res.status(statusCode).end()
  return res.status(statusCode).json(response)
}
