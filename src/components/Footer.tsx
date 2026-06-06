import Link from 'next/link'

const FOOTER_LINKS = [
  { label: 'Projects', href: '/#projects' },
  { label: 'Experience', href: '/#experience' },
  { label: 'Engineering Notes', href: '/blog' },
  { label: 'RSS', href: '/rss.xml' },
  { label: 'Contact', href: 'mailto:aksingh1109@gmail.com' }
]

export default function Footer() {
  return (
    <footer className="px-4 pb-8 pt-10 sm:px-6">
      <div className="mx-auto max-w-6xl border-t border-white/10 pt-6">
        <div className="flex flex-col gap-6 rounded-[28px] border border-white/10 bg-white/[0.035] p-5 shadow-[0_34px_110px_-90px_rgba(6,182,212,0.55)] backdrop-blur-2xl sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link href="/#hero" className="inline-flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full border border-secondary/25 bg-secondary/10 text-sm font-semibold text-secondary">AKS</span>
              <span>
                <span className="block font-display text-lg font-semibold text-white">Amit Kumar Singh</span>
                <span className="mt-1 block text-sm text-slate-400">Backend systems, distributed architecture, and production lessons.</span>
              </span>
            </Link>
          </div>

          <nav className="flex flex-wrap gap-2" aria-label="Footer navigation">
            {FOOTER_LINKS.map(link => (
              <Link
                key={link.label}
                href={link.href}
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300 transition hover:border-secondary/60 hover:bg-secondary/10 hover:text-secondary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-2 px-1 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Amit Kumar Singh. Built for production-minded engineering teams.</p>
          <p>amittech.in</p>
        </div>
      </div>
    </footer>
  )
}
