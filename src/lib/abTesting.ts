// A/B testing utilities for motion engagement experiments

export type Experiment = 'motion_engagement' | 'scroll_behavior' | 'interaction_style'
export type ExperimentVariant = 'control' | 'treatment' | 'treatment_b'

const STORAGE_KEY = 'ab_experiments'

interface ExperimentData {
  variant: ExperimentVariant
  startedAt: string
  engagementMetrics: {
    scrollDepth: number
    timeSpent: number
    interactionCount: number
    resumeDownloaded: boolean
    projectsViewed: number[]
    skillsExplored: string[]
  }
}

function getOrCreateVariant(experiment: Experiment): ExperimentVariant {
  try {
    const stored = window.localStorage.getItem(`${STORAGE_KEY}:${experiment}`)
    if (stored) return JSON.parse(stored).variant

    // Randomly assign variant (50/50 for control/treatment initially)
    const variant = Math.random() < 0.5 ? 'control' : 'treatment'
    const data: ExperimentData = {
      variant,
      startedAt: new Date().toISOString(),
      engagementMetrics: {
        scrollDepth: 0,
        timeSpent: 0,
        interactionCount: 0,
        resumeDownloaded: false,
        projectsViewed: [],
        skillsExplored: []
      }
    }
    window.localStorage.setItem(`${STORAGE_KEY}:${experiment}`, JSON.stringify(data))
    return variant
  } catch (e) {
    return 'control'
  }
}

export function useABExperiment(experiment: Experiment) {
  const variant = getOrCreateVariant(experiment)
  return { variant, isControl: variant === 'control', isTreatment: variant === 'treatment' }
}

export function recordExperimentMetric(experiment: Experiment, metric: string, value: any) {
  try {
    const key = `${STORAGE_KEY}:${experiment}`
    const data = JSON.parse(window.localStorage.getItem(key) || '{}') as ExperimentData

    switch (metric) {
      case 'scrollDepth':
        data.engagementMetrics.scrollDepth = Math.max(data.engagementMetrics.scrollDepth, value)
        break
      case 'timeSpent':
        data.engagementMetrics.timeSpent = value
        break
      case 'interactionCount':
        data.engagementMetrics.interactionCount += 1
        break
      case 'resumeDownloaded':
        data.engagementMetrics.resumeDownloaded = true
        break
      case 'projectViewed':
        if (!data.engagementMetrics.projectsViewed.includes(value)) {
          data.engagementMetrics.projectsViewed.push(value)
        }
        break
      case 'skillExplored':
        if (!data.engagementMetrics.skillsExplored.includes(value)) {
          data.engagementMetrics.skillsExplored.push(value)
        }
        break
    }

    window.localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    // silently fail
  }
}

export function getExperimentMetrics(experiment: Experiment) {
  try {
    const data = JSON.parse(window.localStorage.getItem(`${STORAGE_KEY}:${experiment}`) || '{}') as ExperimentData
    return data.engagementMetrics
  } catch (e) {
    return null
  }
}

// Motion engagement variant configurations
export const motionEngagementConfig = {
  control: {
    enableHero: true,
    enableStagger: true,
    enableParallax: true,
    enableMicroInteractions: true
  },
  treatment: {
    enableHero: true,
    enableStagger: true,
    enableParallax: false,
    enableMicroInteractions: true
  },
  treatment_b: {
    enableHero: true,
    enableStagger: false,
    enableParallax: true,
    enableMicroInteractions: false
  }
}
