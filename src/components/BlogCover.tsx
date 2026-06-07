import { cn } from '../lib/classes'
import type { BlogCoverMotif, BlogPost } from '../features/blog'

type BlogCoverProps = {
  post: BlogPost
  featured?: boolean
  quiet?: boolean
}

export default function BlogCover({ post, featured = false, quiet = false }: BlogCoverProps) {
  return (
    <div
      className={cn(
        'relative isolate overflow-hidden border border-white/10 bg-[#070A10]',
        featured ? 'min-h-[300px] rounded-[32px] sm:min-h-[420px]' : 'min-h-[210px] rounded-[24px]'
      )}
      role="img"
      aria-label={`${post.title} cover image`}
    >
      {post.coverImage ? (
        <img src={post.coverImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : null}
      <div className={cn('absolute inset-0 bg-gradient-to-br', post.cover.gradient, post.coverImage ? 'opacity-45 mix-blend-multiply' : undefined)} />
      <div className={cn('absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(255,255,255,0.18),transparent_28%),linear-gradient(125deg,rgba(255,255,255,0.12)_0,rgba(255,255,255,0.03)_36%,rgba(4,7,12,0.82)_100%)]', post.coverImage ? 'bg-black/30' : undefined)} />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] bg-[length:30px_30px] opacity-25" />
      <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10 bg-white/5 blur-2xl" />
      <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-black/80 to-transparent" />

      {post.coverImage ? null : <VisualMotif motif={post.cover.motif} featured={featured} />}

      <div className="relative z-10 flex h-full min-h-[inherit] flex-col justify-between p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <span className="max-w-[72%] rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur">
            {post.category}
          </span>
          <span className={cn('h-2.5 w-2.5 rounded-full shadow-[0_0_32px_currentColor]', post.cover.accent)} />
        </div>

        <div className={quiet ? 'sr-only' : undefined}>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/60">{post.cover.kicker}</p>
          <p className={cn('mt-2 max-w-xl font-display font-semibold leading-tight text-white', featured ? 'text-3xl sm:text-5xl' : 'text-2xl')}>
            {post.cover.metric}
          </p>
        </div>
      </div>
    </div>
  )
}

function VisualMotif({ motif, featured }: { motif: BlogCoverMotif; featured: boolean }) {
  if (motif === 'database') return <DatabaseMotif featured={featured} />
  if (motif === 'ai') return <AiMotif featured={featured} />
  if (motif === 'career') return <CareerMotif featured={featured} />
  if (motif === 'cloud') return <CloudMotif featured={featured} />
  if (motif === 'events') return <EventsMotif featured={featured} />
  return <SystemsMotif featured={featured} />
}

function EventsMotif({ featured }: { featured: boolean }) {
  return (
    <div className="absolute inset-0">
      <div className="absolute left-[18%] top-[22%] h-[54%] w-px bg-white/18" />
      <div className="absolute right-[14%] top-[18%] h-[62%] w-px bg-white/10" />
      {Array.from({ length: featured ? 7 : 5 }).map((_, index) => (
        <div
          key={index}
          className="absolute h-10 rounded-full border border-white/15 bg-black/25 shadow-[0_18px_70px_-42px_rgba(34,211,238,0.8)] backdrop-blur"
          style={{
            left: `${18 + index * 9}%`,
            top: `${24 + (index % 3) * 15}%`,
            width: `${74 + (index % 2) * 28}px`
          }}
        />
      ))}
      <div className="absolute left-[21%] top-[38%] h-px w-[58%] bg-gradient-to-r from-white/0 via-white/30 to-white/0" />
      <div className="absolute left-[28%] top-[58%] h-px w-[46%] bg-gradient-to-r from-white/0 via-cyan-200/35 to-white/0" />
    </div>
  )
}

function DatabaseMotif({ featured }: { featured: boolean }) {
  return (
    <div className="absolute inset-0">
      <div className={cn('absolute rounded-full border border-white/15 bg-black/20 backdrop-blur', featured ? 'left-[16%] top-[18%] h-56 w-56' : 'left-[12%] top-[24%] h-36 w-36')} />
      <div className={cn('absolute rounded-full border border-white/10 bg-white/5', featured ? 'left-[22%] top-[30%] h-56 w-56' : 'left-[26%] top-[34%] h-32 w-32')} />
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="absolute right-[12%] h-8 rounded-full border border-white/10 bg-black/25"
          style={{
            top: `${22 + index * 10}%`,
            width: `${featured ? 170 : 112}px`
          }}
        />
      ))}
    </div>
  )
}

function SystemsMotif({ featured }: { featured: boolean }) {
  const nodes = featured
    ? [
        ['18%', '22%'],
        ['42%', '18%'],
        ['68%', '30%'],
        ['28%', '58%'],
        ['56%', '66%']
      ]
    : [
        ['18%', '26%'],
        ['52%', '24%'],
        ['70%', '58%'],
        ['30%', '64%']
      ]

  return (
    <div className="absolute inset-0">
      <div className="absolute left-[20%] top-[30%] h-px w-[52%] rotate-12 bg-white/18" />
      <div className="absolute left-[27%] top-[56%] h-px w-[42%] -rotate-12 bg-white/14" />
      {nodes.map(([left, top], index) => (
        <div
          key={`${left}-${top}`}
          className="absolute grid h-16 w-16 place-items-center rounded-2xl border border-white/15 bg-black/25 text-xs font-semibold text-white/65 backdrop-blur"
          style={{ left, top }}
        >
          0{index + 1}
        </div>
      ))}
    </div>
  )
}

function AiMotif({ featured }: { featured: boolean }) {
  return (
    <div className="absolute inset-0">
      <div className={cn('absolute rounded-full border border-white/15 bg-black/20 shadow-[0_0_90px_-35px_rgba(236,72,153,0.8)] backdrop-blur', featured ? 'left-[24%] top-[18%] h-64 w-64' : 'left-[22%] top-[24%] h-40 w-40')} />
      {Array.from({ length: featured ? 10 : 7 }).map((_, index) => (
        <div
          key={index}
          className="absolute h-2.5 w-2.5 rounded-full bg-white/70 shadow-[0_0_24px_currentColor]"
          style={{
            left: `${18 + ((index * 11) % 62)}%`,
            top: `${20 + ((index * 17) % 54)}%`
          }}
        />
      ))}
      <div className="absolute left-[18%] top-[52%] h-px w-[64%] bg-gradient-to-r from-white/0 via-white/30 to-white/0" />
    </div>
  )
}

function CareerMotif({ featured }: { featured: boolean }) {
  return (
    <div className="absolute inset-0">
      <div className="absolute left-[14%] top-[28%] h-px w-[70%] bg-white/15" />
      {Array.from({ length: featured ? 5 : 4 }).map((_, index) => (
        <div
          key={index}
          className="absolute rounded-full border border-white/15 bg-black/25 backdrop-blur"
          style={{
            left: `${14 + index * 16}%`,
            top: `${24 + (index % 2) * 18}%`,
            height: `${featured ? 74 : 54}px`,
            width: `${featured ? 74 : 54}px`
          }}
        />
      ))}
      <div className="absolute bottom-[18%] left-[18%] h-12 w-[54%] rounded-full border border-white/10 bg-white/5" />
    </div>
  )
}

function CloudMotif({ featured }: { featured: boolean }) {
  return (
    <div className="absolute inset-0">
      <div className={cn('absolute rounded-[32px] border border-white/15 bg-black/20 backdrop-blur', featured ? 'left-[16%] top-[24%] h-44 w-[58%]' : 'left-[14%] top-[30%] h-28 w-[64%]')} />
      {Array.from({ length: featured ? 8 : 5 }).map((_, index) => (
        <div
          key={index}
          className="absolute rounded-xl border border-white/10 bg-white/5"
          style={{
            left: `${22 + (index % 4) * 13}%`,
            top: `${32 + Math.floor(index / 4) * 18}%`,
            height: `${featured ? 48 : 34}px`,
            width: `${featured ? 72 : 52}px`
          }}
        />
      ))}
    </div>
  )
}
