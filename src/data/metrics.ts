import type { ImpactMetric as ImpactMetricShape } from '../features/impact'

export type { ImpactMetric } from '../features/impact'

export const IMPACT_METRICS = [
  { label: 'Employees Served', value: '300K+' },
  { label: 'Onboarding Turnaround', value: '60% reduction' },
  { label: 'DB Performance', value: '35% improvement' },
  { label: 'Deployment Effort', value: '80% reduction' },
  { label: 'Technologies', value: '15+' },
  { label: 'Experience', value: '3+ years' }
] satisfies ImpactMetricShape[]
