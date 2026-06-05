export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://amittech.in'
export const SITE_NAME = 'Amit Kumar Singh'

export function absoluteUrl(path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${normalizedPath}`
}

export function getOgImageUrl(title: string, category = 'Engineering Insights') {
  const params = new URLSearchParams({ title, category })
  return absoluteUrl(`/og?${params.toString()}`)
}
