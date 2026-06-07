import sanitizeHtml from 'sanitize-html'

const WORDS_PER_MINUTE = 220
const safeColorPattern = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/
const safeRgbPattern = /^rgba?\(\s*(?:\d{1,3}\s*,\s*){2}\d{1,3}(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/

const sanitizeOptions: sanitizeHtml.IOptions = {
  allowedTags: [
    'p',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'strong',
    'em',
    'u',
    's',
    'mark',
    'code',
    'pre',
    'blockquote',
    'ul',
    'ol',
    'li',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'img',
    'figure',
    'figcaption',
    'iframe',
    'a',
    'br',
    'hr',
    'span',
    'div'
  ],
  allowedAttributes: {
    a: ['href', 'name', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    iframe: ['src', 'width', 'height', 'allow', 'allowfullscreen', 'title'],
    '*': ['class', 'style']
  },
  allowedStyles: {
    '*': {
      color: [safeColorPattern, safeRgbPattern],
      'background-color': [safeColorPattern, safeRgbPattern],
      'font-size': [/^(0\.875|1\.125|1\.375)rem$/],
      'text-align': [/^(left|center|right|justify)$/]
    }
  },
  allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'player.vimeo.com'],
  transformTags: {
    a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' })
  }
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function sanitizeEditorHtml(html?: string | null) {
  if (!html) return null
  return sanitizeHtml(html, sanitizeOptions)
}

export function estimateReadingTime(input: { title?: string; excerpt?: string | null; html?: string | null; content?: unknown }) {
  const text = [
    input.title,
    input.excerpt,
    input.html ? sanitizeHtml(input.html, { allowedTags: [], allowedAttributes: {} }) : '',
    input.content ? JSON.stringify(input.content) : ''
  ].join(' ')
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))
}
