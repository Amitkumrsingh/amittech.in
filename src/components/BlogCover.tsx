import { cn } from '../lib/classes'
import type { BlogPost } from '../data/blog'

type BlogCoverProps = {
  post: BlogPost
  featured?: boolean
}

export default function BlogCover({ post, featured = false }: BlogCoverProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[24px] border border-white/10 bg-[#0A0A0F]',
        featured ? 'min-h-[260px] sm:min-h-[320px]' : 'min-h-[190px]'
      )}
      aria-label={`${post.title} cover image`}
    >
      <div className={cn('absolute inset-0 bg-gradient-to-br', post.cover.gradient)} />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.14)_0,rgba(255,255,255,0.02)_38%,rgba(10,10,15,0.74)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[length:28px_28px] opacity-30" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />

      <div className="relative flex h-full min-h-[inherit] flex-col justify-between p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <span className="rounded-full border border-white/15 bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/85 backdrop-blur">
            {post.category}
          </span>
          <span className={cn('h-2.5 w-2.5 rounded-full shadow-[0_0_28px_currentColor]', post.cover.accent)} />
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/65">{post.cover.kicker}</p>
          <p className={cn('mt-2 font-display font-semibold leading-tight text-white', featured ? 'text-3xl sm:text-4xl' : 'text-2xl')}>
            {post.cover.metric}
          </p>
        </div>
      </div>
    </div>
  )
}
