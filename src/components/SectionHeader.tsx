import { cn } from '../lib/classes'

type SectionHeaderProps = {
  eyebrow: string
  title: string
  description?: string
  layout?: 'split' | 'stacked'
  variant?: 'default' | 'compact'
  className?: string
  eyebrowClassName?: string
  titleClassName?: string
  descriptionClassName?: string
}

const headerStyles = {
  default: {
    eyebrow: 'text-sm uppercase tracking-[0.24em] text-slate-400',
    title: 'mt-3 text-3xl md:text-4xl font-display',
    description: 'max-w-2xl text-slate-300'
  },
  compact: {
    eyebrow: 'text-xs sm:text-sm uppercase tracking-[0.24em] text-slate-400',
    title: 'mt-2 sm:mt-3 text-2xl sm:text-3xl md:text-4xl font-display',
    description: 'max-w-2xl text-sm sm:text-base text-slate-300'
  }
}

export default function SectionHeader({
  eyebrow,
  title,
  description,
  layout = 'split',
  variant = 'default',
  className,
  eyebrowClassName,
  titleClassName,
  descriptionClassName
}: SectionHeaderProps) {
  const styles = headerStyles[variant]

  return (
    <div className={cn(layout === 'split' ? 'flex flex-col gap-4 md:flex-row md:items-end md:justify-between' : '', className)}>
      <div>
        <p className={cn(styles.eyebrow, eyebrowClassName)}>{eyebrow}</p>
        <h2 className={cn(styles.title, titleClassName)}>{title}</h2>
      </div>
      {description ? (
        <p className={cn(styles.description, descriptionClassName)}>{description}</p>
      ) : null}
    </div>
  )
}
