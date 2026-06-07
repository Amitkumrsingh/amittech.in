import TagList from './TagList'

export default function ArticleTags({ tags, limit = 4 }: { tags: string[]; limit?: number }) {
  return (
    <TagList
      items={tags}
      limit={limit}
      className="mt-5"
      itemClassName="border border-white/10 bg-white/[0.04] px-3 py-1 text-slate-300"
    />
  )
}
