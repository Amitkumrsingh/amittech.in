import SectionHeader from './SectionHeader'

export default function AboutSection() {
  return (
    <section id="about" className="mt-12 rounded-[32px] border border-white/10 bg-white/5 p-5 sm:p-6 shadow-[0_40px_120px_-90px_rgba(236,72,153,0.45)] backdrop-blur-2xl">
      <SectionHeader
        eyebrow="About"
        title="From business workflows to distributed systems."
        description="I work closest to the places where software meets operations: onboarding flows, payment rails, CRM automation, data synchronization, retries, migrations, and production incidents. The pattern is usually the same: turn messy real-world processes into systems that are observable, recoverable, and clear enough for teams to operate."
        layout="stacked"
        descriptionClassName="mt-4 leading-7"
      />
    </section>
  )
}
