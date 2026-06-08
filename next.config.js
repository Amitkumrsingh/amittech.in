const { withSentryConfig } = require('@sentry/nextjs')

const glitchtipSecurityReportUri = process.env.GLITCHTIP_SECURITY_REPORT_URI

const contentSecurityPolicyReportOnly = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://accounts.google.com",
  "connect-src 'self' https: wss:",
  glitchtipSecurityReportUri ? `report-uri ${glitchtipSecurityReportUri}` : ''
].filter(Boolean).join('; ')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep default settings; appDir is enabled by default in recent Next versions.
  async headers() {
    if (!glitchtipSecurityReportUri) return []

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy-Report-Only',
            value: contentSecurityPolicyReportOnly
          }
        ]
      }
    ]
  }
}

// GlitchTip accepts the Sentry protocol, so the Sentry Next.js wrapper is still
// the right SDK integration even though events are sent to GlitchTip.
module.exports = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: '/monitoring',
  webpack: {
    treeshake: {
      removeDebugLogging: true
    }
  }
})
