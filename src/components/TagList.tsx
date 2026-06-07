import { cn } from '../lib/classes'

type TagListProps = {
  items: readonly string[]
  limit?: number
  className?: string
  itemClassName?: string
}

export default function TagList({
  items,
  limit,
  className,
  itemClassName
}: TagListProps) {
  const visibleItems = typeof limit === 'number' ? items.slice(0, limit) : items

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {visibleItems.map(item => (
        <span key={item} className={cn('rounded-full text-xs', itemClassName)}>
          {item}
        </span>
      ))}
    </div>
  )
}
