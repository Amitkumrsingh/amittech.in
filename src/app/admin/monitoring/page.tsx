import type { Metadata } from 'next'
import ApiMonitoringDashboard from '../../../components/ApiMonitoringDashboard'
import { absoluteUrl, getOgImageUrl, SITE_NAME } from '../../../lib/site'

export const metadata: Metadata = {
  title: 'API Monitoring',
  description: 'Private super-admin API monitoring dashboard for AmitTech production APIs.',
  alternates: {
    canonical: absoluteUrl('/admin/monitoring')
  },
  robots: {
    index: false,
    follow: false
  },
  openGraph: {
    title: 'API Monitoring - Amit Kumar Singh',
    description: 'Private API traffic, latency, and error monitoring dashboard.',
    url: absoluteUrl('/admin/monitoring'),
    siteName: SITE_NAME,
    type: 'website',
    images: [
      {
        url: getOgImageUrl('API Monitoring', 'AmitTech')
      }
    ]
  }
}

export default function AdminMonitoringPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 pb-10 pt-24 sm:px-6 sm:pb-14 sm:pt-28">
      <ApiMonitoringDashboard />
    </main>
  )
}
