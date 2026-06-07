import {
  CONTACT_EMAIL,
  GITHUB_PROFILE_URL,
  LINKEDIN_PROFILE_URL,
  SEO_KEYWORDS,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  absoluteUrl
} from './site'

export function getPersonSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': absoluteUrl('/#person'),
    name: SITE_NAME,
    url: SITE_URL,
    email: `mailto:${CONTACT_EMAIL}`,
    jobTitle: 'Backend Engineer',
    description: SITE_DESCRIPTION,
    knowsAbout: SEO_KEYWORDS.filter(keyword => keyword !== SITE_NAME),
    sameAs: [GITHUB_PROFILE_URL, LINKEDIN_PROFILE_URL]
  }
}

export function getWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': absoluteUrl('/#website'),
    name: SITE_NAME,
    alternateName: 'AmitTech',
    headline: SITE_TITLE,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: 'en',
    publisher: {
      '@id': absoluteUrl('/#person')
    }
  }
}

export function getProfilePageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    '@id': absoluteUrl('/#profile'),
    url: SITE_URL,
    name: SITE_TITLE,
    description: SITE_DESCRIPTION,
    mainEntity: {
      '@id': absoluteUrl('/#person')
    }
  }
}
