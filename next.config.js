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
  experimental: {
    instrumentationHook: true
  },
  webpack(config) {
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /node_modules\/require-in-the-middle/,
        message: /Critical dependency: require function is used in a way/
      }
    ]

    return config
  },
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

module.exports = nextConfig
