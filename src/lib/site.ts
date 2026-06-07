export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://amittech.in'
export const SITE_NAME = 'Amit Kumar Singh'
export const SITE_AUTHOR_SHORT_NAME = 'Amit Kumar'
export const SITE_TITLE = 'Amit Kumar Singh - Backend Engineer, Distributed Systems Engineer'
export const SITE_DESCRIPTION = 'Amit Kumar Singh is a Backend Engineer focused on distributed systems, Kafka, Python, AWS, system design, cloud platforms, AI engineering, and production reliability.'
export const CONTACT_EMAIL = 'aksingh1109@gmail.com'
export const RESUME_FILE = 'Amit_Kumar_Singh_Resume.pdf'
export const GITHUB_PROFILE_URL = 'https://github.com/Amitkumrsingh'
export const LINKEDIN_PROFILE_URL = 'https://www.linkedin.com/in/amitkumrsingh/'
export const SEO_KEYWORDS = [
  'Amit Kumar Singh',
  'Backend Engineer',
  'Software Developer',
  'Distributed Systems Engineer',
  'System Design',
  'Kafka',
  'Python Backend Engineer',
  'AWS',
  'Microservices',
  'AI Engineering',
  'Production Engineering',
  'Fintech Engineer',
  'HRMS Platform Engineer'
]

export const NAV_LINKS = [
  { label: 'Home', href: '/#hero', section: 'hero' },
  { label: 'About', href: '/#about', section: 'about' },
  { label: 'Experience', href: '/#experience', section: 'experience' },
  { label: 'Projects', href: '/#projects', section: 'projects' },
  { label: 'Skills', href: '/#expertise', section: 'expertise' },
  { label: 'Blog', href: '/blog', section: 'blog' },
  { label: 'Contact', href: '/#contact', section: 'contact' }
] as const

export const HOME_SECTION_IDS = NAV_LINKS
  .map(link => link.section)
  .filter(section => section !== 'blog')

export type NavLinkItem = typeof NAV_LINKS[number]

export const SOCIAL_LINKS = [
  {
    id: 'email',
    label: 'Email Amit',
    href: `mailto:${CONTACT_EMAIL}`
  },
  {
    id: 'github',
    label: 'GitHub',
    href: GITHUB_PROFILE_URL
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: LINKEDIN_PROFILE_URL
  }
] as const

export function absoluteUrl(path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${normalizedPath}`
}

export function getOgImageUrl(title: string, category = 'Engineering Notes') {
  const params = new URLSearchParams({ title, category })
  return absoluteUrl(`/og?${params.toString()}`)
}
