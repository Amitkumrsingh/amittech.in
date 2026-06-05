// Analytics event tracking with validation and logging

export type AnalyticsEvent = 
  | 'page_load'
  | 'resume_download'
  | 'project_view'
  | 'skill_select'
  | 'motion_toggle'
  | 'modal_open'
  | 'scroll_depth'
  | 'section_view'

export interface AnalyticsPayload {
  event: AnalyticsEvent
  timestamp: string
  properties: Record<string, any>
}

const isDev = process.env.NODE_ENV === 'development'

export function validateEvent(payload: AnalyticsPayload): boolean {
  if (!payload.event || typeof payload.event !== 'string') return false
  if (!payload.timestamp || new Date(payload.timestamp).toString() === 'Invalid Date') return false
  if (!payload.properties || typeof payload.properties !== 'object') return false
  return true
}

export function logAnalyticsEvent(event: AnalyticsEvent, properties: Record<string, any> = {}) {
  const payload: AnalyticsPayload = {
    event,
    timestamp: new Date().toISOString(),
    properties: {
      ...properties,
      url: typeof window !== 'undefined' ? window.location.pathname : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
    }
  }

  // Validate payload
  if (!validateEvent(payload)) {
    if (isDev) console.warn(`Invalid analytics event: ${event}`, payload)
    return
  }

  // Add A/B experiment variant if available
  try {
    const { useABExperiment } = require('./abTesting')
    const { variant } = useABExperiment('motion_engagement')
    payload.properties.abExperimentVariant = variant
  } catch (e) {
    // A/B testing not available
  }

  // Log to console in development
  if (isDev) {
    console.log(`[Analytics] ${event}:`, payload.properties)
  }

  // Send to analytics providers
  try {
    // Forwarded to server for backend processing + provider dispatch
    fetch('/api/track-download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(e => isDev && console.warn('Analytics server failed:', e))

    // Client-side GA4 if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      try {
        (window as any).gtag('event', event, payload.properties)
      } catch (e) {
        isDev && console.warn('GA4 event failed:', e)
      }
    }
  } catch (err) {
    if (isDev) console.warn('Analytics tracking error:', err)
  }
}

export function trackPageLoad() {
  logAnalyticsEvent('page_load', {
    referrer: typeof document !== 'undefined' ? document.referrer : ''
  })
}

export function trackScrollDepth(percentage: number) {
  logAnalyticsEvent('scroll_depth', { percentage: Math.round(percentage) })
}

export function trackSectionView(sectionId: string) {
  logAnalyticsEvent('section_view', { section: sectionId })
}

export function trackProjectView(projectId: string) {
  logAnalyticsEvent('project_view', { project: projectId })
}

export function trackSkillSelect(skill: string) {
  logAnalyticsEvent('skill_select', { skill })
}

export function trackMotionToggle(enabled: boolean) {
  logAnalyticsEvent('motion_toggle', { motionEnabled: enabled })
}

export function trackModalOpen(projectId: string) {
  logAnalyticsEvent('modal_open', { project: projectId })
}
