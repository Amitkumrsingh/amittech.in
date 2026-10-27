import type { ImpactMetric as ImpactMetricShape } from '../features/impact'

export type { ImpactMetric } from '../features/impact'

export const IMPACT_METRICS = [
  { label: 'Employees Supported', value: '150K+' },
  { label: 'Onboarding Turnaround', value: '60% reduction' },
  { label: 'DB Performance', value: '35% improvement' },
  { label: 'Deployment Time', value: '80% faster' },
  { label: 'AI Focus', value: 'RAG + MCP' },
  { label: 'Experience', value: '3+ years' }
] satisfies ImpactMetricShape[]
