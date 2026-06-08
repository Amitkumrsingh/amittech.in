import type { NextApiRequest, NextApiResponse } from 'next'
import * as Sentry from '@sentry/nextjs'
import { ZodError } from 'zod'

export class ApiError extends Error {
  statusCode: number
  code: string

  constructor(statusCode: number, message: string, code = 'API_ERROR') {
    super(message)
    this.statusCode = statusCode
    this.code = code
  }
}

export type ApiHandler<T = unknown> = (req: NextApiRequest, res: NextApiResponse<T>) => Promise<void>

export function methodNotAllowed(res: NextApiResponse, allowed: string[]) {
  res.setHeader('Allow', allowed)
  return res.status(405).json({ ok: false, error: 'Method not allowed' })
}

export function ok<T>(res: NextApiResponse, data: T, statusCode = 200) {
  res.setHeader('Cache-Control', 'no-store, max-age=0')
  return res.status(statusCode).json({ ok: true, data })
}

export function created<T>(res: NextApiResponse, data: T) {
  return ok(res, data, 201)
}

export function getQueryString(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0]
  return value
}

export function getQueryNumber(value: string | string[] | undefined, fallback: number) {
  const raw = getQueryString(value)
  const parsed = Number(raw)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function captureApiException(req: NextApiRequest, error: unknown, statusCode = 500) {
  Sentry.withScope(scope => {
    scope.setTag('api.method', req.method || 'UNKNOWN')
    scope.setTag('api.path', req.url?.split('?')[0] || 'unknown')
    scope.setTag('api.status_code', String(statusCode))
    Sentry.captureException(error)
  })
}

export function withApiErrorHandling(handler: ApiHandler): ApiHandler {
  return async (req, res) => {
    try {
      await handler(req, res)
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.statusCode >= 500) {
          captureApiException(req, error, error.statusCode)
        }

        res.status(error.statusCode).json({ ok: false, error: error.message, code: error.code })
        return
      }

      if (error instanceof ZodError) {
        res.status(400).json({
          ok: false,
          error: 'Invalid request payload',
          code: 'VALIDATION_ERROR',
          details: error.flatten()
        })
        return
      }

      // eslint-disable-next-line no-console
      console.error('[api-error]', error)
      captureApiException(req, error)
      res.status(500).json({ ok: false, error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' })
    }
  }
}
