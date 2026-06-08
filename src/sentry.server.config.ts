import * as Sentry from '@sentry/nextjs'

function numberFromEnv(value: string | undefined, fallback: number) {
  if (!value) return fallback
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const dsn = process.env.GLITCHTIP_DSN || process.env.NEXT_PUBLIC_GLITCHTIP_DSN || process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  environment: process.env.GLITCHTIP_ENVIRONMENT || process.env.SENTRY_ENVIRONMENT || process.env.VERCEL_ENV || process.env.NODE_ENV,
  release: process.env.SENTRY_RELEASE || process.env.VERCEL_GIT_COMMIT_SHA,
  sendDefaultPii: false,
  enableLogs: true,
  integrations: [Sentry.consoleLoggingIntegration({ levels: ['warn', 'error'] })],
  tracesSampleRate: numberFromEnv(
    process.env.GLITCHTIP_TRACES_SAMPLE_RATE || process.env.SENTRY_TRACES_SAMPLE_RATE,
    process.env.NODE_ENV === 'development' ? 1 : 0.1
  ),
  beforeSend(event) {
    if (event.request?.headers) {
      delete event.request.headers.cookie
      delete event.request.headers.authorization
    }

    return event
  }
})
