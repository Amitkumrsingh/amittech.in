import type { Metadata } from 'next'
import AdminDashboard from '../../components/AdminDashboard'
import { absoluteUrl, getOgImageUrl, SITE_NAME } from '../../lib/site'

export const metadata: Metadata = {
  title: 'Admin Dashboard - Amit Kumar Singh',
  description: 'Private CMS dashboard for publishing engineering notes on Amit Kumar Singh portfolio.',
  alternates: {
    canonical: absoluteUrl('/admin')
  },
  robots: {
    index: false,
    follow: false
  },
  openGraph: {
    title: 'Admin Dashboard - Amit Kumar Singh',
    description: 'Private CMS dashboard for engineering notes.',
    url: absoluteUrl('/admin'),
    siteName: SITE_NAME,
    type: 'website',
    images: [
      {
        url: getOgImageUrl('Admin Dashboard', 'Engineering Notes')
      }
    ]
  }
}

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 pb-10 pt-24 sm:px-6 sm:pb-14 sm:pt-28">
      <AdminDashboard />
    </main>
  )
}
