# Monitoring Setup

This project uses GlitchTip for error/performance monitoring through the Sentry-compatible runtime SDK. It also exposes a lightweight health endpoint for uptime checks.

GlitchTip is the monitoring backend. The `@sentry/nextjs` package remains in the code because GlitchTip accepts the Sentry SDK protocol. The project intentionally does not use the Sentry build wrapper, so there is no Sentry Cloud release creation, source-map upload, or build telemetry.

## What Is Covered

- Browser runtime errors
- React/App Router render errors
- Server/API exceptions
- Structured warn/error logs in GlitchTip Logs
- Performance traces
- Report-only security/CSP violation reports
- Public uptime check at `/api/health`
- Private super-admin API monitoring dashboard at `/admin/monitoring`
- Per-endpoint request count, avg latency, p50, p95, max latency, and error rate
- Live API metrics refresh through Server-Sent Events

## Production URLs

- Health check: `https://amittech.in/api/health`
- API monitoring dashboard: `https://amittech.in/admin/monitoring`
- API monitoring stream: `https://amittech.in/api/admin/metrics/stream?minutes=60`
- GlitchTip dashboard: `https://app.glitchtip.com/`
- GlitchTip SDK docs: `https://glitchtip.com/sdkdocs/`
- Vercel environment variables: `https://vercel.com/dashboard`

## Required Vercel Environment Variables

Add these in Vercel Project Settings -> Environment Variables.

```bash
GLITCHTIP_DSN="https://<public-key>@app.glitchtip.com/<project-id>"
NEXT_PUBLIC_GLITCHTIP_DSN="https://<public-key>@app.glitchtip.com/<project-id>"
GLITCHTIP_ENVIRONMENT="production"
NEXT_PUBLIC_GLITCHTIP_ENVIRONMENT="production"
GLITCHTIP_TRACES_SAMPLE_RATE="0.1"
NEXT_PUBLIC_GLITCHTIP_TRACES_SAMPLE_RATE="0.1"
GLITCHTIP_SECURITY_REPORT_URI="https://app.glitchtip.com/api/<project-id>/security/?glitchtip_key=<public-key>"
API_METRICS_DISABLED="false"
API_METRICS_RETENTION_DAYS="30"
```

`NEXT_PUBLIC_GLITCHTIP_DSN` is expected to be visible in browser JavaScript. Treat write/admin secrets separately; do not place private tokens in `NEXT_PUBLIC_*` variables.

## Setup Steps

1. Create a GlitchTip project.
2. Copy the project DSN into both `GLITCHTIP_DSN` and `NEXT_PUBLIC_GLITCHTIP_DSN`.
3. Copy the security endpoint into `GLITCHTIP_SECURITY_REPORT_URI`.
4. Add the variables in Vercel for Production, Preview, and Development as needed.
5. Redeploy the production project.
6. Open `https://amittech.in/api/health` and confirm `monitoring.status` is `ok`.
7. Open GlitchTip and confirm events arrive after a controlled test error.
8. Open `https://amittech.in/admin`, sign in as a super admin, then open `https://amittech.in/admin/monitoring`.
9. Use **Send test log** and **Send test error** in the API Monitoring dashboard to verify GlitchTip Logs and Issues.

## Health Endpoint Response

`GET /api/health` returns app, database, media, and monitoring readiness.

```json
{
  "ok": true,
  "service": "amittech-portfolio",
  "environment": "production",
  "timestamp": "2026-06-08T00:00:00.000Z",
  "checks": {
    "app": { "status": "ok" },
    "database": { "status": "ok", "latencyMs": 42 },
    "media": { "status": "ok" },
    "monitoring": { "status": "ok" }
  }
}
```

## Security Reports

When `GLITCHTIP_SECURITY_REPORT_URI` is configured, Next.js sends a `Content-Security-Policy-Report-Only` header.

This does not block scripts or styles. It only reports browser policy violations to GlitchTip so the policy can be tightened safely later.

## API Metrics Dashboard

The `/admin/monitoring` page is a super-admin-only API Monitoring dashboard. The CMS page links to it only after a super-admin session is detected.

It is powered by the `ApiMetric` PostgreSQL table and records API requests from the shared API handler plus resume download endpoints.

The dashboard uses Server-Sent Events instead of WebSockets. SSE is a good fit here because the browser only needs one-way metric updates from the server. The server pushes a fresh metrics snapshot every 5 seconds.

Because the app runs on Vercel serverless functions, the stream intentionally closes after roughly 55 seconds and lets the browser reconnect automatically. This keeps the live feel without relying on a permanently open serverless connection.

Live mode:

- receives a fresh metrics snapshot every 5 seconds
- reconnects automatically when the stream is closed by the platform
- supports 15m, 1h, 6h, 24h, and 7d windows
- shows a live traffic graph with request volume, average latency, and error markers
- uses slower fetch refresh only as a fallback if EventSource cannot connect
- excludes `/api/health`, `/api/admin/metrics`, and `/api/admin/metrics/stream` from recorded traffic so uptime checks and dashboard reads do not pollute the numbers

Stored fields are intentionally minimal:

- route pattern
- HTTP method
- status code
- latency in milliseconds
- environment
- timestamp

It does not store IP addresses, user agents, request bodies, cookies, or authorization headers.

Set `API_METRICS_RETENTION_DAYS` to control automatic cleanup. The default is 30 days.

## Debug Workflow

Use these surfaces together:

- GlitchTip Issues: exceptions with stack traces and request context.
- GlitchTip Logs: structured warning/error logs emitted by the SDK.
- GlitchTip Performance: sampled transaction traces.
- `/admin/monitoring`: SSE-powered live traffic graph, per-route traffic, p50/p95 latency, error rate, and slowest requests.
- Vercel Logs: raw serverless function logs for last-mile deployment/runtime debugging.

The monitoring dashboard includes two super-admin-only test controls:

- **Send test log** emits a warning log to GlitchTip Logs.
- **Send test error** emits an error log and throws a controlled exception so it appears in GlitchTip Issues.

Do not enable full `console.log` capture in production. The app captures only `console.warn` and `console.error` to avoid noisy logs and accidental sensitive data capture.

## Alerting Recommendations

- Alert on new high-frequency API errors.
- Alert when `/api/health` returns non-200.
- Alert when p95 transaction duration crosses 2 seconds for `/blog` or CMS APIs.
- Keep trace sampling at `0.1` unless traffic is very low.
- Do not enable personally identifiable information capture unless there is a clear reason.
