import type { NextApiRequest, NextApiResponse } from 'next'
import { requireSuperAdmin } from '../../../../lib/api/auth'
import { ApiError, getQueryNumber, methodNotAllowed } from '../../../../lib/api/http'
import { getApiMetricsOverview } from '../../../../lib/api/metrics'

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false
  },
  maxDuration: 60
}

const STREAM_INTERVAL_MS = 5000
const STREAM_HEARTBEAT_MS = 15000
const STREAM_MAX_DURATION_MS = 55000

function writeEvent(res: NextApiResponse, event: string, data: unknown) {
  res.write(`event: ${event}\n`)
  res.write(`data: ${JSON.stringify(data)}\n\n`)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET'])

  try {
    await requireSuperAdmin(req)
  } catch (error) {
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({ ok: false, error: error.message, code: error.code })
    }
    return res.status(500).json({ ok: false, error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' })
  }

  const minutes = getQueryNumber(req.query.minutes, 60)
  let closed = false
  let sending = false

  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders?.()
  res.write('retry: 3000\n\n')

  async function sendMetrics() {
    if (closed || sending) return
    sending = true

    try {
      const metrics = await getApiMetricsOverview(minutes)
      if (!closed) writeEvent(res, 'metrics', metrics)
    } catch {
      if (!closed) writeEvent(res, 'stream-error', { message: 'Unable to load API metrics', timestamp: new Date().toISOString() })
    } finally {
      sending = false
    }
  }

  const metricsInterval = windowlessSetInterval(sendMetrics, STREAM_INTERVAL_MS)
  const heartbeatInterval = windowlessSetInterval(() => {
    if (!closed) writeEvent(res, 'heartbeat', { timestamp: new Date().toISOString() })
  }, STREAM_HEARTBEAT_MS)
  const cleanup = () => {
    closed = true
    clearInterval(metricsInterval)
    clearInterval(heartbeatInterval)
    clearTimeout(maxDurationTimer)
  }
  const maxDurationTimer = windowlessSetTimeout(() => {
    if (!closed) {
      writeEvent(res, 'end', { reason: 'reconnect', timestamp: new Date().toISOString() })
      cleanup()
      res.end()
    }
  }, STREAM_MAX_DURATION_MS)

  req.on('close', cleanup)

  await sendMetrics()
}

function windowlessSetInterval(callback: () => void | Promise<void>, ms: number) {
  return setInterval(() => {
    void callback()
  }, ms)
}

function windowlessSetTimeout(callback: () => void, ms: number) {
  return setTimeout(callback, ms)
}
