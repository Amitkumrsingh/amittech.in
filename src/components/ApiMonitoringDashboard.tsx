"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { motion } from '../lib/motion'
import motionTheme from '../lib/motionTheme'
import { cn } from '../lib/classes'
import MicroButton from './MicroButton'

type Role = 'USER' | 'SUPER_ADMIN'
type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED'

type AuthUser = {
  id: string
  name: string
  email: string
  profileImage?: string | null
  role: Role
  status: UserStatus
}

type ApiEnvelope<T> = {
  ok: boolean
  data?: T
  error?: string
  code?: string
}

type ApiMetricsResponse = {
  generatedAt: string
  rangeHours: number
  rangeMinutes: number
  summary: {
    requests: number
    errors: number
    serverErrors: number
    avgLatencyMs: number
    p50LatencyMs: number
    p95LatencyMs: number
    maxLatencyMs: number
    errorRate: number
  }
  endpoints: Array<{
    route: string
    method: string
    requests: number
    errors: number
    serverErrors: number
    avgLatencyMs: number
    p50LatencyMs: number
    p95LatencyMs: number
    maxLatencyMs: number
    errorRate: number
  }>
  timeline: Array<{
    bucket: string
    requests: number
    errors: number
    avgLatencyMs: number
  }>
  slowest: Array<{
    route: string
    method: string
    statusCode: number
    latencyMs: number
    createdAt: string
  }>
}

const API_METRICS_POLL_INTERVAL_MS = 5000

const rangeOptions = [
  { label: '15m', value: 15 },
  { label: '1h', value: 60 },
  { label: '6h', value: 360 },
  { label: '24h', value: 1440 },
  { label: '7d', value: 10080 }
]

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: init?.body instanceof FormData ? init.headers : { 'content-type': 'application/json', ...init?.headers },
    credentials: 'same-origin'
  })
  const payload = (await response.json()) as ApiEnvelope<T>
  if (!response.ok || !payload.ok) throw new Error(payload.error || 'Request failed')
  return payload.data as T
}

function formatMs(value: number) {
  if (!value) return '0 ms'
  if (value >= 1000) return `${(value / 1000).toFixed(1)}s`
  return `${Math.round(value)} ms`
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit' }).format(new Date(value))
}

function formatBucket(value: string, rangeMinutes: number) {
  const date = new Date(value)
  if (rangeMinutes > 1440) {
    return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date)
  }
  return new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit' }).format(date)
}

function formatRange(minutes: number) {
  if (minutes < 60) return `${minutes} minutes`
  if (minutes < 1440) return `${Math.round(minutes / 60)} hours`
  return `${Math.round(minutes / 1440)} days`
}

export default function ApiMonitoringDashboard() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const [metrics, setMetrics] = useState<ApiMetricsResponse | null>(null)
  const [rangeMinutes, setRangeMinutes] = useState(60)
  const [live, setLive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [testMode, setTestMode] = useState<'log' | 'error' | null>(null)

  const isSuperAdmin = user?.role === 'SUPER_ADMIN'

  const refreshMe = useCallback(async () => {
    setAuthLoading(true)
    setAuthError('')
    try {
      const data = await requestJson<{ user: AuthUser | null }>('/api/auth/me')
      setUser(data.user)
    } catch (requestError) {
      setAuthError(requestError instanceof Error ? requestError.message : 'Unable to check session')
    } finally {
      setAuthLoading(false)
    }
  }, [])

  const loadMetrics = useCallback(async (options?: { silent?: boolean }) => {
    if (!isSuperAdmin) return
    if (!options?.silent) {
      setLoading(true)
      setError('')
    }
    try {
      const data = await requestJson<ApiMetricsResponse>(`/api/admin/metrics?minutes=${rangeMinutes}`)
      setMetrics(data)
    } catch (requestError) {
      if (!options?.silent) {
        setError(requestError instanceof Error ? requestError.message : 'Unable to load API metrics')
      }
    } finally {
      if (!options?.silent) setLoading(false)
    }
  }, [isSuperAdmin, rangeMinutes])

  useEffect(() => {
    refreshMe()
  }, [refreshMe])

  useEffect(() => {
    loadMetrics()
  }, [loadMetrics])

  useEffect(() => {
    if (!isSuperAdmin || !live) return

    const refreshLiveMetrics = () => {
      if (document.visibilityState === 'visible') {
        void loadMetrics({ silent: true })
      }
    }

    const intervalId = window.setInterval(refreshLiveMetrics, API_METRICS_POLL_INTERVAL_MS)
    document.addEventListener('visibilitychange', refreshLiveMetrics)

    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', refreshLiveMetrics)
    }
  }, [isSuperAdmin, live, loadMetrics])

  async function sendMonitoringTest(mode: 'log' | 'error') {
    setTestMode(mode)
    setError('')
    setMessage('')

    try {
      await requestJson<{ sent: boolean; mode: 'log' | 'error' }>('/api/admin/monitoring-test', {
        method: 'POST',
        body: JSON.stringify({ mode })
      })
      setMessage(mode === 'log' ? 'Test log sent to GlitchTip' : 'Test error sent to GlitchTip')
    } catch (requestError) {
      if (mode === 'error') {
        setMessage('Test error triggered. Check GlitchTip Issues and Logs.')
      } else {
        setError(requestError instanceof Error ? requestError.message : 'Monitoring test failed')
      }
    } finally {
      setTestMode(null)
      await loadMetrics()
    }
  }

  return (
    <motion.section
      initial="hidden"
      animate="show"
      variants={motionTheme.variants.containerStagger(0.04)}
      className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.035] p-4 shadow-[0_40px_140px_-90px_rgba(6,182,212,0.65)] backdrop-blur-2xl sm:p-6"
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-44 rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.24),transparent_65%)] blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-32 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(236,72,153,0.16),transparent_68%)] blur-3xl" />

      <div className="relative flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-secondary">Super Admin Observability</p>
            {isSuperAdmin ? (
              <span className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]', live ? 'border-secondary/30 bg-secondary/10 text-secondary' : 'border-white/10 bg-white/5 text-slate-400')}>
                <span className={cn('h-2 w-2 rounded-full', live ? 'animate-pulse bg-secondary' : 'bg-slate-500')} />
                {live ? 'Live 5s' : 'Paused'}
              </span>
            ) : null}
          </div>
          <h1 className="mt-3 font-display text-3xl font-semibold text-white sm:text-5xl">API Monitoring</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
            Live traffic, latency, errors, and slow requests for production APIs. Health checks and dashboard polling are excluded from the graph.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-secondary/50 hover:text-secondary">
            CMS
          </Link>
          <Link href="/blog" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-secondary/50 hover:text-secondary">
            Blog
          </Link>
        </div>
      </div>

      {authLoading ? (
        <DashboardGrid>
          <Panel className="lg:col-span-12">
            <p className="text-sm text-slate-300">Checking session...</p>
          </Panel>
        </DashboardGrid>
      ) : !user ? (
        <DashboardGrid>
          <Panel className="lg:col-span-12">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Authentication</p>
            <h2 className="mt-4 font-display text-3xl font-semibold text-white">Sign in from the CMS first.</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
              API monitoring is private. Open the CMS, sign in with Google, then come back to this page.
            </p>
            <div className="mt-6">
              <Link href="/admin" className="inline-flex min-h-10 items-center rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-black transition hover:bg-auroraTeal">
                Go to CMS sign in
              </Link>
            </div>
            {authError ? <Alert tone="error">{authError}</Alert> : null}
          </Panel>
        </DashboardGrid>
      ) : !isSuperAdmin ? (
        <DashboardGrid>
          <Panel className="lg:col-span-12">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Access blocked</p>
            <h2 className="mt-4 font-display text-3xl font-semibold text-white">This dashboard is only for super admins.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              Signed in as {user.email}. The API endpoint also rejects non-super-admin sessions, so traffic and latency data stays private.
            </p>
          </Panel>
        </DashboardGrid>
      ) : (
        <DashboardGrid>
          {message ? <Alert tone="success" className="lg:col-span-12">{message}</Alert> : null}
          {error ? <Alert tone="error" className="lg:col-span-12">{error}</Alert> : null}

          <Panel className="lg:col-span-12">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Live Window</p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-white">
                  Last {formatRange(rangeMinutes)} - generated {metrics ? formatTime(metrics.generatedAt) : 'waiting'}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Polling every 5 seconds while this tab is visible. The refresh API itself is not counted.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {rangeOptions.map(option => (
                  <MicroButton
                    key={option.value}
                    type="button"
                    onClick={() => setRangeMinutes(option.value)}
                    className={cn(
                      'rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition',
                      rangeMinutes === option.value
                        ? 'border-secondary bg-secondary/15 text-secondary'
                        : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-white'
                    )}
                  >
                    {option.label}
                  </MicroButton>
                ))}
                <ActionButton onClick={() => setLive(current => !current)} variant={live ? 'primary' : 'default'}>
                  {live ? 'Live on' : 'Live off'}
                </ActionButton>
                <ActionButton onClick={() => loadMetrics()} disabled={loading}>
                  {loading ? 'Refreshing...' : 'Refresh'}
                </ActionButton>
              </div>
            </div>
          </Panel>

          <MetricTile label="Requests" value={(metrics?.summary.requests || 0).toLocaleString()} tone="cyan" />
          <MetricTile label="Errors" value={(metrics?.summary.errors || 0).toLocaleString()} tone={metrics?.summary.errors ? 'pink' : 'neutral'} />
          <MetricTile label="Error rate" value={`${(metrics?.summary.errorRate || 0).toFixed(2)}%`} tone={metrics?.summary.errorRate ? 'pink' : 'neutral'} />
          <MetricTile label="P95 latency" value={formatMs(metrics?.summary.p95LatencyMs || 0)} tone={(metrics?.summary.p95LatencyMs || 0) > 1500 ? 'gold' : 'cyan'} />
          <MetricTile label="Avg latency" value={formatMs(metrics?.summary.avgLatencyMs || 0)} tone="neutral" />
          <MetricTile label="Max latency" value={formatMs(metrics?.summary.maxLatencyMs || 0)} tone={(metrics?.summary.maxLatencyMs || 0) > 2500 ? 'gold' : 'neutral'} />

          <Panel className="lg:col-span-12">
            <LiveTrafficGraph metrics={metrics} rangeMinutes={rangeMinutes} />
          </Panel>

          <Panel className="lg:col-span-12">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-secondary">Endpoint Breakdown</p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-white">Traffic by route</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <ActionButton onClick={() => sendMonitoringTest('log')} disabled={Boolean(testMode)}>
                  {testMode === 'log' ? 'Sending...' : 'Send test log'}
                </ActionButton>
                <ActionButton onClick={() => sendMonitoringTest('error')} disabled={Boolean(testMode)} variant="danger">
                  {testMode === 'error' ? 'Triggering...' : 'Send test error'}
                </ActionButton>
              </div>
            </div>
            <EndpointTable metrics={metrics} />
          </Panel>

          <Panel className="lg:col-span-12">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">Slow Requests</p>
                <h2 className="mt-2 font-display text-2xl font-semibold text-white">Worst samples in this window</h2>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-400">
                Top {metrics?.slowest.length || 0}
              </span>
            </div>
            <SlowRequestGrid metrics={metrics} />
          </Panel>
        </DashboardGrid>
      )}
    </motion.section>
  )
}

function DashboardGrid({ children }: { children: ReactNode }) {
  return <div className="relative mt-6 grid gap-4 lg:grid-cols-12">{children}</div>
}

function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={motionTheme.variants.fadeUp()} className={cn('rounded-[28px] border border-white/10 bg-white/[0.045] p-4 shadow-[0_28px_100px_-80px_rgba(124,58,237,0.65)] backdrop-blur-xl sm:p-5', className)}>
      {children}
    </motion.div>
  )
}

function Alert({ children, tone, className }: { children: ReactNode; tone: 'success' | 'error'; className?: string }) {
  return (
    <div className={cn('rounded-2xl border px-4 py-3 text-sm', tone === 'success' ? 'border-secondary/30 bg-secondary/10 text-secondary' : 'border-accent/30 bg-accent/10 text-accent', className)}>
      {children}
    </div>
  )
}

function ActionButton({
  children,
  onClick,
  disabled,
  variant = 'default'
}: {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  variant?: 'default' | 'primary' | 'danger'
}) {
  return (
    <MicroButton
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'min-h-10 rounded-full border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary'
          ? 'border-secondary bg-secondary text-black hover:bg-auroraTeal'
          : variant === 'danger'
            ? 'border-accent/40 bg-accent/10 text-accent hover:bg-accent/20'
            : 'border-white/10 bg-white/5 text-slate-200 hover:border-secondary/40 hover:text-secondary'
      )}
    >
      {children}
    </MicroButton>
  )
}

function MetricTile({ label, value, tone }: { label: string; value: string; tone: 'cyan' | 'pink' | 'gold' | 'neutral' }) {
  const toneClass = {
    cyan: 'text-secondary',
    pink: 'text-accent',
    gold: 'text-gold',
    neutral: 'text-white'
  }[tone]

  return (
    <Panel className="lg:col-span-2">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className={cn('mt-2 font-display text-3xl font-semibold', toneClass)}>{value}</p>
    </Panel>
  )
}

function LiveTrafficGraph({ metrics, rangeMinutes }: { metrics: ApiMetricsResponse | null; rangeMinutes: number }) {
  const points = useMemo(() => {
    const source = metrics?.timeline || []
    const maxPoints = rangeMinutes <= 60 ? 60 : rangeMinutes <= 360 ? 72 : 84
    return source.slice(-maxPoints)
  }, [metrics?.timeline, rangeMinutes])

  if (!points.length) {
    return (
      <div className="grid min-h-[320px] place-items-center rounded-[24px] border border-dashed border-white/10 bg-black/20 p-6 text-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-secondary">Waiting for traffic</p>
          <h3 className="mt-3 font-display text-2xl font-semibold text-white">No API samples in this window yet.</h3>
          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400">
            Hit production APIs or wait for real users. The chart updates automatically when live mode is on.
          </p>
        </div>
      </div>
    )
  }

  const width = 960
  const height = 320
  const padding = { top: 38, right: 54, bottom: 54, left: 54 }
  const innerWidth = width - padding.left - padding.right
  const innerHeight = height - padding.top - padding.bottom
  const baseline = padding.top + innerHeight
  const maxTraffic = Math.max(1, ...points.map(point => point.requests))
  const maxLatency = Math.max(1, ...points.map(point => point.avgLatencyMs))
  const xFor = (index: number) => padding.left + (points.length === 1 ? innerWidth : (index / (points.length - 1)) * innerWidth)
  const yTraffic = (requests: number) => baseline - (requests / maxTraffic) * innerHeight
  const yLatency = (latency: number) => baseline - (latency / maxLatency) * innerHeight
  const barWidth = Math.max(4, Math.min(18, innerWidth / points.length * 0.62))
  const trafficPath = [
    `M ${xFor(0)} ${baseline}`,
    ...points.map((point, index) => `L ${xFor(index)} ${yTraffic(point.requests)}`),
    `L ${xFor(points.length - 1)} ${baseline}`,
    'Z'
  ].join(' ')
  const latencyPath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${xFor(index)} ${yLatency(point.avgLatencyMs)}`).join(' ')
  const labelIndexes = Array.from(new Set([0, Math.floor((points.length - 1) / 2), points.length - 1]))

  return (
    <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-secondary">Live Traffic Graph</p>
          <h3 className="mt-2 font-display text-2xl font-semibold text-white">Requests vs latency</h3>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-slate-400">
          <LegendDot color="bg-secondary" label="Traffic" />
          <LegendDot color="bg-primary" label="Avg latency" />
          <LegendDot color="bg-accent" label="Errors" />
        </div>
      </div>

      <svg className="mt-4 h-[320px] w-full overflow-visible" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Live API traffic and latency chart">
        <defs>
          <linearGradient id="trafficFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgb(6, 182, 212)" stopOpacity="0.42" />
            <stop offset="100%" stopColor="rgb(6, 182, 212)" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id="trafficBar" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgb(34, 211, 238)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="rgb(14, 165, 233)" stopOpacity="0.24" />
          </linearGradient>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map(level => {
          const y = padding.top + level * innerHeight
          return (
            <g key={level}>
              <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="rgba(255,255,255,0.08)" />
            </g>
          )
        })}

        <path d={trafficPath} fill="url(#trafficFill)" />

        {points.map((point, index) => {
          const x = xFor(index)
          const barHeight = baseline - yTraffic(point.requests)
          return (
            <rect
              key={`${point.bucket}-bar`}
              x={x - barWidth / 2}
              y={baseline - Math.max(3, barHeight)}
              width={barWidth}
              height={Math.max(3, barHeight)}
              rx={barWidth / 2}
              fill={point.errors ? 'rgba(236,72,153,0.72)' : 'url(#trafficBar)'}
            />
          )
        })}

        <path d={latencyPath} fill="none" stroke="rgb(124,58,237)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#softGlow)" />

        {points.map((point, index) => point.errors ? (
          <g key={`${point.bucket}-error`}>
            <circle cx={xFor(index)} cy={Math.max(padding.top + 10, yLatency(point.avgLatencyMs) - 14)} r="6" fill="rgb(236,72,153)" />
            <text x={xFor(index)} y={Math.max(padding.top + 5, yLatency(point.avgLatencyMs) - 24)} textAnchor="middle" className="fill-accent text-[10px] font-semibold">
              {point.errors}
            </text>
          </g>
        ) : null)}

        <text x={padding.left} y={24} className="fill-slate-400 text-[12px]">
          traffic max {maxTraffic.toLocaleString()}
        </text>
        <text x={width - padding.right} y={24} textAnchor="end" className="fill-slate-400 text-[12px]">
          latency max {formatMs(maxLatency)}
        </text>

        {labelIndexes.map(index => (
          <text key={index} x={xFor(index)} y={height - 18} textAnchor={index === 0 ? 'start' : index === points.length - 1 ? 'end' : 'middle'} className="fill-slate-500 text-[11px]">
            {formatBucket(points[index].bucket, rangeMinutes)}
          </text>
        ))}
      </svg>
    </div>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={cn('h-2.5 w-2.5 rounded-full', color)} />
      {label}
    </span>
  )
}

function EndpointTable({ metrics }: { metrics: ApiMetricsResponse | null }) {
  return (
    <div className="mt-5 overflow-x-auto rounded-[24px] border border-white/10 bg-black/20">
      <table className="w-full min-w-[860px] text-left text-sm">
        <thead className="border-b border-white/10 text-xs uppercase tracking-[0.18em] text-slate-500">
          <tr>
            <th className="px-4 py-3">Endpoint</th>
            <th className="px-4 py-3">Method</th>
            <th className="px-4 py-3 text-right">Traffic</th>
            <th className="px-4 py-3 text-right">Avg</th>
            <th className="px-4 py-3 text-right">P50</th>
            <th className="px-4 py-3 text-right">P95</th>
            <th className="px-4 py-3 text-right">Max</th>
            <th className="px-4 py-3 text-right">Errors</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {metrics?.endpoints.length ? (
            metrics.endpoints.map(endpoint => (
              <tr key={`${endpoint.method}:${endpoint.route}`} className="text-slate-300">
                <td className="px-4 py-3 font-mono text-xs text-slate-200">{endpoint.route}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold text-secondary">{endpoint.method}</span>
                </td>
                <td className="px-4 py-3 text-right">{endpoint.requests.toLocaleString()}</td>
                <td className="px-4 py-3 text-right">{formatMs(endpoint.avgLatencyMs)}</td>
                <td className="px-4 py-3 text-right">{formatMs(endpoint.p50LatencyMs)}</td>
                <td className="px-4 py-3 text-right">{formatMs(endpoint.p95LatencyMs)}</td>
                <td className="px-4 py-3 text-right">{formatMs(endpoint.maxLatencyMs)}</td>
                <td className={cn('px-4 py-3 text-right', endpoint.errors ? 'text-accent' : 'text-slate-500')}>
                  {endpoint.errors.toLocaleString()} / {endpoint.errorRate.toFixed(2)}%
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                Waiting for API traffic.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function SlowRequestGrid({ metrics }: { metrics: ApiMetricsResponse | null }) {
  if (!metrics?.slowest.length) {
    return (
      <p className="mt-5 rounded-2xl border border-dashed border-white/10 p-5 text-sm text-slate-400">
        No slow request samples for this window yet.
      </p>
    )
  }

  return (
    <div className="mt-5 grid gap-3 lg:grid-cols-2">
      {metrics.slowest.map((request, index) => (
        <div key={`${request.route}-${request.createdAt}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-mono text-xs text-slate-200">{request.route}</p>
              <p className="mt-1 text-xs text-slate-500">{formatTime(request.createdAt)} - {request.method} - HTTP {request.statusCode}</p>
            </div>
            <span className="rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">{formatMs(request.latencyMs)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
