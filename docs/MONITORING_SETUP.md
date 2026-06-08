# Monitoring Setup

This project uses GlitchTip for error/performance monitoring through the Sentry-compatible runtime SDK. It also exposes a lightweight health endpoint for uptime checks.

GlitchTip is the monitoring backend. The `@sentry/nextjs` package remains in the code because GlitchTip accepts the Sentry SDK protocol. The project intentionally does not use the Sentry build wrapper, so there is no Sentry Cloud release creation, source-map upload, or build telemetry.

## What Is Covered

- Browser runtime errors
- React/App Router render errors
- Server/API exceptions
- Performance traces
- Report-only security/CSP violation reports
- Public uptime check at `/api/health`
- Private super-admin API dashboard inside `/admin`
- Per-endpoint request count, avg latency, p50, p95, max latency, and error rate

## Production URLs

- Health check: `https://amittech.in/api/health`
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
8. Open `https://amittech.in/admin`, sign in as a super admin, and check the API Monitoring panel.

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

The `/admin` dashboard includes a super-admin-only API Monitoring panel.

It is powered by the `ApiMetric` PostgreSQL table and records API requests from the shared API handler plus resume download endpoints.

Stored fields are intentionally minimal:

- route pattern
- HTTP method
- status code
- latency in milliseconds
- environment
- timestamp

It does not store IP addresses, user agents, request bodies, cookies, or authorization headers.

Set `API_METRICS_RETENTION_DAYS` to control automatic cleanup. The default is 30 days.

## Alerting Recommendations

- Alert on new high-frequency API errors.
- Alert when `/api/health` returns non-200.
- Alert when p95 transaction duration crosses 2 seconds for `/blog` or CMS APIs.
- Keep trace sampling at `0.1` unless traffic is very low.
- Do not enable personally identifiable information capture unless there is a clear reason.
