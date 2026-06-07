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

function createExperimentData(variant: ExperimentVariant): ExperimentData {
  return {
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
}

function getExperimentStorageKey(experiment: Experiment) {
  return `${STORAGE_KEY}:${experiment}`
}

function readExperimentData(experiment: Experiment): ExperimentData | null {
  try {
    const stored = window.localStorage.getItem(getExperimentStorageKey(experiment))
    return stored ? JSON.parse(stored) : null
  } catch (e) {
    return null
  }
}

function writeExperimentData(experiment: Experiment, data: ExperimentData) {
  window.localStorage.setItem(getExperimentStorageKey(experiment), JSON.stringify(data))
}

function getOrCreateExperimentData(experiment: Experiment): ExperimentData {
  try {
    const stored = readExperimentData(experiment)
    if (stored) return stored

    // Randomly assign variant (50/50 for control/treatment initially)
    const variant = Math.random() < 0.5 ? 'control' : 'treatment'
    const data = createExperimentData(variant)
    writeExperimentData(experiment, data)
    return data
  } catch (e) {
    return createExperimentData('control')
  }
}

export function useABExperiment(experiment: Experiment) {
  const variant = getABExperimentVariant(experiment)
  return { variant, isControl: variant === 'control', isTreatment: variant === 'treatment' }
}

export function getABExperimentVariant(experiment: Experiment) {
  return getOrCreateExperimentData(experiment).variant
}

export function recordExperimentMetric(experiment: Experiment, metric: string, value: unknown) {
  try {
    const data = getOrCreateExperimentData(experiment)

    switch (metric) {
      case 'scrollDepth':
        data.engagementMetrics.scrollDepth = Math.max(data.engagementMetrics.scrollDepth, Number(value))
        break
      case 'timeSpent':
        data.engagementMetrics.timeSpent = Number(value)
        break
      case 'interactionCount':
        data.engagementMetrics.interactionCount += 1
        break
      case 'resumeDownloaded':
        data.engagementMetrics.resumeDownloaded = true
        break
      case 'projectViewed':
        if (typeof value === 'number' && !data.engagementMetrics.projectsViewed.includes(value)) {
          data.engagementMetrics.projectsViewed.push(value)
        }
        break
      case 'skillExplored':
        if (typeof value === 'string' && !data.engagementMetrics.skillsExplored.includes(value)) {
          data.engagementMetrics.skillsExplored.push(value)
        }
        break
    }

    writeExperimentData(experiment, data)
  } catch (e) {
    // silently fail
  }
}

export function getExperimentMetrics(experiment: Experiment) {
  try {
    return readExperimentData(experiment)?.engagementMetrics ?? null
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
