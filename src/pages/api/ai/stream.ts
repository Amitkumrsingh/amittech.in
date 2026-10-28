import type { NextApiRequest, NextApiResponse } from 'next'
import { randomUUID } from 'crypto'
import { ZodError } from 'zod'
import { ApiError } from '../../../lib/api/http'
import {
  buildStreamingPrompt,
  cacheAiResponse,
  checkAiRateLimit,
  cleanupExpiredAiCache,
  getCachedAiResponse,
  streamGeminiText,
  type AiStreamInput
} from '../../../lib/api/ai'
import { canManageResource, requireUser } from '../../../lib/api/auth'
import { prisma } from '../../../lib/api/prisma'
import { aiStreamSchema } from '../../../lib/api/schemas'
import { recordAiGenerationMetric, recordApiMetric } from '../../../lib/api/metrics'
import { sanitizeMermaidSource } from '../../../lib/mermaid'

const diagramStart = /^(?:flowchart|graph|sequenceDiagram)\b/i

function sendError(res: NextApiResponse, error: unknown) {
  if (error instanceof ZodError) {
    res.status(400).json({ ok: false, error: 'Invalid request payload', code: 'VALIDATION_ERROR', details: error.flatten() })
    return
  }
  const apiError = error instanceof ApiError ? error : new ApiError(500, 'Internal server error', 'INTERNAL_SERVER_ERROR')
  if (!res.headersSent) res.status(apiError.statusCode).json({ ok: false, error: apiError.message, code: apiError.code })
}

function event(res: NextApiResponse, type: string, payload: Record<string, unknown> = {}) {
  res.write(`event: ${type}\ndata: ${JSON.stringify(payload)}\n\n`)
}

function safeDiagramSource(source: string) {
  const clean = sanitizeMermaidSource(source)
  return clean.length <= 18000 && diagramStart.test(clean) && !clean.includes('%%{') && !/\b(click|href|javascript:|<script)/i.test(clean) ? clean : ''
}

async function assertCanUseAiForStream(input: AiStreamInput, user: Awaited<ReturnType<typeof requireUser>>) {
  if (!input.postId) return
  const post = await prisma.post.findUnique({ where: { id: input.postId }, select: { authorId: true, deletedAt: true } })
  if (!post || post.deletedAt) throw new ApiError(404, 'Post not found', 'POST_NOT_FOUND')
  if (!canManageResource(user, post.authorId)) throw new ApiError(403, 'Cannot use AI on this post', 'AI_POST_FORBIDDEN')
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startedAt = Date.now()
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ ok: false, error: 'Method not allowed' })
    return
  }
  if (process.env.INLINE_AI_ENABLED !== 'true') {
    res.status(404).json({ ok: false, error: 'Inline AI is temporarily disabled', code: 'INLINE_AI_DISABLED' })
    return
  }

  let user: Awaited<ReturnType<typeof requireUser>>
  let input: AiStreamInput
  try {
    user = await requireUser(req)
    input = aiStreamSchema.parse(req.body)
    await assertCanUseAiForStream(input, user)
  } catch (error) {
    sendError(res, error)
    return
  }

  const cached = input.bypassCache ? null : await getCachedAiResponse(user.id, input)
  if (Math.random() < 0.05) void cleanupExpiredAiCache()
  const requestId = randomUUID()

  if (cached?.text) {
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')
    res.writeHead(200)
    event(res, 'start', { requestId, cached: true, contentType: cached.contentType })
    event(res, 'delta', { requestId, text: cached.text })
    event(res, 'complete', { requestId, cached: true, text: cached.text, contentType: cached.contentType })
    res.end()
    await recordApiMetric({ route: '/api/ai/stream', method: 'POST', statusCode: 200, latencyMs: Date.now() - startedAt })
    await recordAiGenerationMetric({
      userId: user.id,
      postId: input.postId,
      requestId,
      action: input.action,
      cacheOutcome: 'hit',
      timeToFirstOutputMs: Date.now() - startedAt,
      totalLatencyMs: Date.now() - startedAt,
      completionState: 'completed'
    })
    console.info('[ai-stream]', { action: input.action, cache: 'hit', requestId })
    return
  }

  try {
    await checkAiRateLimit(user)
  } catch (error) {
    sendError(res, error)
    return
  }

  const controller = new AbortController()
  let clientDisconnected = false
  let timedOut = false
  const configuredTimeoutMs = Number(process.env.AI_STREAM_TIMEOUT_MS || 55000)
  const timeoutMs = Number.isFinite(configuredTimeoutMs) && configuredTimeoutMs > 0 ? configuredTimeoutMs : 55000
  const timeout = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, timeoutMs)
  const onClose = () => {
    clientDisconnected = true
    controller.abort()
  }
  res.once('close', onClose)
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.writeHead(200)
  event(res, 'start', { requestId, cached: false, contentType: input.action === 'system-diagram' ? 'mermaid' : 'markdown' })
  const heartbeat = setInterval(() => {
    try {
      res.write(': keep-alive\n\n')
    } catch {
      clientDisconnected = true
      controller.abort()
    }
  }, 15000)
  let completed = false
  let firstOutputAt: number | undefined
  let validationErrorCode: string | undefined

  try {
    const prompt = buildStreamingPrompt(input.action, input)
    let text = ''
    for await (const chunk of streamGeminiText(prompt, input.action, controller.signal)) {
      if (firstOutputAt === undefined) firstOutputAt = Date.now()
      text += chunk
      event(res, 'delta', { requestId, text: chunk })
    }

    const finalText = input.action === 'system-diagram' ? safeDiagramSource(text) : text.trim()
    if (!finalText) {
      validationErrorCode = 'AI_INVALID_RESPONSE'
      throw new ApiError(502, input.action === 'system-diagram' ? 'Gemini returned invalid Mermaid source.' : 'AI returned an empty response.', 'AI_INVALID_RESPONSE')
    }
    await cacheAiResponse(user.id, input, finalText, input.action === 'system-diagram' ? 'mermaid' : 'markdown')
    completed = true
    event(res, 'complete', { requestId, cached: false, text: finalText, contentType: input.action === 'system-diagram' ? 'mermaid' : 'markdown' })
  } catch (error) {
    if (error instanceof ApiError && error.code === 'AI_INVALID_RESPONSE') validationErrorCode = error.code
    if (!clientDisconnected) {
      event(res, 'error', {
        requestId,
        error: timedOut ? 'AI generation timed out. Please try again.' : error instanceof ApiError ? error.message : 'AI generation failed.'
      })
    }
  } finally {
    clearTimeout(timeout)
    clearInterval(heartbeat)
    res.removeListener('close', onClose)
    res.end()
    const totalLatencyMs = Date.now() - startedAt
    const completionState = completed ? 'completed' : clientDisconnected ? 'cancelled' : 'failed'
    await recordApiMetric({ route: '/api/ai/stream', method: 'POST', statusCode: completed ? 200 : completionState === 'cancelled' ? 499 : 502, latencyMs: totalLatencyMs })
    await recordAiGenerationMetric({
      userId: user.id,
      postId: input.postId,
      requestId,
      action: input.action,
      cacheOutcome: input.bypassCache ? 'bypassed' : 'miss',
      timeToFirstOutputMs: firstOutputAt === undefined ? undefined : firstOutputAt - startedAt,
      totalLatencyMs,
      completionState,
      validationErrorCode
    })
    console.info('[ai-stream]', { action: input.action, cache: input.bypassCache ? 'bypassed' : 'miss', completed, completionState, requestId })
  }
}
