import ButtonLink, { buttonClassName } from './ButtonLink'
import DownloadCounter from './DownloadCounter'
import ResumeButton from './ResumeButton'
import SectionHeader from './SectionHeader'

const RESUME_FILE = 'Amit_Kumar_Singh_Resume.pdf'

export default function ContactSection() {
  return (
    <section id="contact" className="mt-16 rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_40px_120px_-80px_rgba(124,58,237,0.45)] backdrop-blur-2xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <SectionHeader
          eyebrow="Contact"
          title="Ready to build the next scalable platform?"
          description="I’m interested in backend and distributed systems roles at product-first companies, startups, and engineering teams looking for a strong SDE engineer."
          layout="stacked"
          descriptionClassName="mt-4"
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
          <ButtonLink href="mailto:aksingh1109@gmail.com" variant="secondary" size="contact" radius="full" className="shrink-0">
            Email me
          </ButtonLink>
          <div className="flex items-center gap-3">
            <ResumeButton
              href={`/${RESUME_FILE}`}
              filename={RESUME_FILE}
              label="Download Resume"
              className={buttonClassName({ variant: 'ghost', size: 'contact', radius: 'full' })}
            />
            <DownloadCounter />
          </div>
          <ButtonLink href="#hero" variant="ghost" size="contact" radius="full">
            Back to top
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
