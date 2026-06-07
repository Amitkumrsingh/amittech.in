import { motion } from '../lib/motion'
import motionTheme from '../lib/motionTheme'
import { IMPACT_METRICS } from '../data/metrics'
import type { ImpactMetric } from '../features/impact'
import SectionHeader from './SectionHeader'

export default function ImpactMetrics() {
  return (
    <section id="impact" className="mt-12 rounded-[32px] border border-white/10 bg-[#12121A]/70 p-6 backdrop-blur-2xl">
      <SectionHeader
        eyebrow="Impact metrics"
        title="Engineering outcomes that prove scale."
        description="Built infrastructure and event-driven systems that drove measurable improvements in onboarding, performance, deployment speed, and platform resilience."
      />

      <motion.div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" variants={motionTheme.variants.containerStagger(0.06)} initial="hidden" whileInView="show" viewport={{ once: true }}>
        {IMPACT_METRICS.map((metric, idx) => <MetricCard key={metric.label} metric={metric} index={idx} />)}
      </motion.div>
    </section>
  )
}

function MetricCard({ metric, index }: { metric: ImpactMetric; index: number }) {
  return (
    <motion.div
      className="rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5 shadow-[0_30px_80px_-60px_rgba(124,58,237,0.5)]"
      variants={motionTheme.variants.fadeUp(index * 0.04)}
    >
      <p className="text-2xl sm:text-3xl font-semibold text-white leading-tight">{metric.value}</p>
      <p className="mt-2 text-xs sm:text-sm uppercase tracking-[0.18em] text-slate-400">{metric.label}</p>
    </motion.div>
  )
}
