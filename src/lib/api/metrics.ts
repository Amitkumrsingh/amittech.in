import { prisma } from './prisma'

type MetricInput = {
  route: string
  method: string
  statusCode: number
  latencyMs: number
}

type SummaryRow = {
  requests: number
  errors: number
  serverErrors: number
  avgLatencyMs: number | null
  p50LatencyMs: number | null
  p95LatencyMs: number | null
  maxLatencyMs: number | null
}

type EndpointRow = SummaryRow & {
  route: string
  method: string
}

type TimelineRow = {
  bucket: Date
  requests: number
  errors: number
  avgLatencyMs: number | null
}

type SlowRequestRow = {
  route: string
  method: string
  statusCode: number
  latencyMs: number
  createdAt: Date
}

function toNumber(value: unknown, fallback = 0) {
  if (typeof value === 'bigint') return Number(value)
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }
  return fallback
}

function normalizeRow<T extends Record<string, unknown>>(row: T) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => {
      if (value instanceof Date) return [key, value.toISOString()]
      if (typeof value === 'bigint') return [key, Number(value)]
      return [key, value]
    })
  )
}

function shouldRecordMetrics() {
  return Boolean(process.env.DATABASE_URL) && process.env.API_METRICS_DISABLED !== 'true'
}

function getEnvironment() {
  return process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown'
}

export function normalizeApiRoute(url?: string) {
  const path = (url || '/api/unknown').split('?')[0]

  return path
    .replace(/^\/api\/posts\/[^/]+\/(publish|unpublish|archive)$/, '/api/posts/[id]/$1')
    .replace(/^\/api\/posts\/[^/]+$/, '/api/posts/[id]')
    .replace(/^\/api\/admin\/posts\/[^/]+\/feature$/, '/api/admin/posts/[id]/feature')
    .replace(/^\/api\/admin\/posts\/[^/]+$/, '/api/admin/posts/[id]')
    .replace(/^\/api\/admin\/users\/[^/]+\/(role|status)$/, '/api/admin/users/[id]/$1')
    .replace(/^\/api\/media\/[^/]+$/, '/api/media/[id]')
}

async function pruneOldMetrics() {
  const retentionDays = Math.min(Math.max(Number(process.env.API_METRICS_RETENTION_DAYS || 30), 1), 365)
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000)
  await prisma.apiMetric.deleteMany({ where: { createdAt: { lt: cutoff } } })
}

export async function recordApiMetric(input: MetricInput) {
  if (!shouldRecordMetrics()) return

  try {
    await prisma.apiMetric.create({
      data: {
        route: input.route,
        method: input.method,
        statusCode: input.statusCode,
        latencyMs: Math.max(0, Math.round(input.latencyMs)),
        ok: input.statusCode < 400,
        environment: getEnvironment()
      }
    })

    if (Math.random() < 0.01) {
      await pruneOldMetrics()
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn('[api-metrics] failed to record metric', error)
    }
  }
}

export async function getApiMetricsOverview(hours: number) {
  const safeHours = Math.min(Math.max(Math.round(hours), 1), 24 * 30)
  const since = new Date(Date.now() - safeHours * 60 * 60 * 1000)

  const [summaryRows, endpointRows, timelineRows, slowRows] = await Promise.all([
    prisma.$queryRaw<SummaryRow[]>`
      SELECT
        COUNT(*)::int AS "requests",
        SUM(CASE WHEN "statusCode" >= 400 THEN 1 ELSE 0 END)::int AS "errors",
        SUM(CASE WHEN "statusCode" >= 500 THEN 1 ELSE 0 END)::int AS "serverErrors",
        AVG("latencyMs")::int AS "avgLatencyMs",
        (PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY "latencyMs"))::int AS "p50LatencyMs",
        (PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY "latencyMs"))::int AS "p95LatencyMs",
        MAX("latencyMs")::int AS "maxLatencyMs"
      FROM "ApiMetric"
      WHERE "createdAt" >= ${since}
    `,
    prisma.$queryRaw<EndpointRow[]>`
      SELECT
        "route",
        "method",
        COUNT(*)::int AS "requests",
        SUM(CASE WHEN "statusCode" >= 400 THEN 1 ELSE 0 END)::int AS "errors",
        SUM(CASE WHEN "statusCode" >= 500 THEN 1 ELSE 0 END)::int AS "serverErrors",
        AVG("latencyMs")::int AS "avgLatencyMs",
        (PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY "latencyMs"))::int AS "p50LatencyMs",
        (PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY "latencyMs"))::int AS "p95LatencyMs",
        MAX("latencyMs")::int AS "maxLatencyMs"
      FROM "ApiMetric"
      WHERE "createdAt" >= ${since}
      GROUP BY "route", "method"
      ORDER BY "requests" DESC, "p95LatencyMs" DESC
      LIMIT 40
    `,
    prisma.$queryRaw<TimelineRow[]>`
      SELECT
        DATE_TRUNC('hour', "createdAt") AS "bucket",
        COUNT(*)::int AS "requests",
        SUM(CASE WHEN "statusCode" >= 400 THEN 1 ELSE 0 END)::int AS "errors",
        AVG("latencyMs")::int AS "avgLatencyMs"
      FROM "ApiMetric"
      WHERE "createdAt" >= ${since}
      GROUP BY "bucket"
      ORDER BY "bucket" ASC
    `,
    prisma.$queryRaw<SlowRequestRow[]>`
      SELECT "route", "method", "statusCode", "latencyMs", "createdAt"
      FROM "ApiMetric"
      WHERE "createdAt" >= ${since}
      ORDER BY "latencyMs" DESC
      LIMIT 8
    `
  ])

  const summary = summaryRows[0] || {
    requests: 0,
    errors: 0,
    serverErrors: 0,
    avgLatencyMs: 0,
    p50LatencyMs: 0,
    p95LatencyMs: 0,
    maxLatencyMs: 0
  }

  return {
    generatedAt: new Date().toISOString(),
    rangeHours: safeHours,
    summary: {
      requests: toNumber(summary.requests),
      errors: toNumber(summary.errors),
      serverErrors: toNumber(summary.serverErrors),
      avgLatencyMs: toNumber(summary.avgLatencyMs),
      p50LatencyMs: toNumber(summary.p50LatencyMs),
      p95LatencyMs: toNumber(summary.p95LatencyMs),
      maxLatencyMs: toNumber(summary.maxLatencyMs),
      errorRate: toNumber(summary.requests) ? Number(((toNumber(summary.errors) / toNumber(summary.requests)) * 100).toFixed(2)) : 0
    },
    endpoints: endpointRows.map(row => ({
      route: row.route,
      method: row.method,
      requests: toNumber(row.requests),
      errors: toNumber(row.errors),
      serverErrors: toNumber(row.serverErrors),
      avgLatencyMs: toNumber(row.avgLatencyMs),
      p50LatencyMs: toNumber(row.p50LatencyMs),
      p95LatencyMs: toNumber(row.p95LatencyMs),
      maxLatencyMs: toNumber(row.maxLatencyMs),
      errorRate: toNumber(row.requests) ? Number(((toNumber(row.errors) / toNumber(row.requests)) * 100).toFixed(2)) : 0
    })),
    timeline: timelineRows.map(row => normalizeRow(row)),
    slowest: slowRows.map(row => normalizeRow(row))
  }
}
