import type { Prisma } from '@prisma/client'
import { PostStatus } from '@prisma/client'
import { prisma } from './prisma'
import { estimateReadingTime, sanitizeEditorHtml, slugify } from './content'
import { ApiError } from './http'
import type { AuthenticatedUser } from './auth'
import { canManageResource } from './auth'
import type { z } from 'zod'
import type { postCreateSchema, postQuerySchema, postUpdateSchema } from './schemas'

type PostCreateInput = z.infer<typeof postCreateSchema>
type PostUpdateInput = z.infer<typeof postUpdateSchema>
type PostQueryInput = z.infer<typeof postQuerySchema>

const postInclude = {
  author: {
    select: {
      id: true,
      name: true,
      email: true,
      profileImage: true
    }
  },
  category: true,
  tags: true,
  media: {
    where: {
      deletedAt: null
    }
  }
} satisfies Prisma.PostInclude

const postListSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  sanitizedHtml: true,
  coverImage: true,
  category: true,
  tags: true,
  status: true,
  readingTime: true,
  authorId: true,
  author: {
    select: {
      id: true,
      name: true,
      email: true,
      profileImage: true
    }
  },
  createdAt: true,
  updatedAt: true,
  publishedAt: true,
  metaTitle: true,
  metaDescription: true,
  ogImage: true,
  views: true,
  isFeatured: true,
  deletedAt: true
} satisfies Prisma.PostSelect

export function getPostInclude() {
  return postInclude
}

export async function createUniqueSlug(title: string, requestedSlug?: string, currentPostId?: string) {
  const baseSlug = slugify(requestedSlug || title)
  if (!baseSlug) throw new ApiError(400, 'Post slug could not be generated', 'INVALID_SLUG')

  let candidate = baseSlug
  let suffix = 2

  while (true) {
    const existing = await prisma.post.findUnique({
      where: { slug: candidate },
      select: { id: true }
    })

    if (!existing || existing.id === currentPostId) return candidate
    candidate = `${baseSlug}-${suffix}`
    suffix += 1
  }
}

async function getCategoryConnect(categoryName?: string | null) {
  if (!categoryName) return undefined
  const slug = slugify(categoryName)

  return {
    connectOrCreate: {
      where: { slug },
      create: { name: categoryName, slug }
    }
  }
}

function getTagConnect(tags: string[] = []) {
  return tags.map(name => ({
    where: { slug: slugify(name) },
    create: { name, slug: slugify(name) }
  }))
}

function preparePostFields(input: PostCreateInput | PostUpdateInput, existingTitle?: string) {
  const html = sanitizeEditorHtml(input.html)
  const title = input.title || existingTitle || ''
  const readingTime = estimateReadingTime({
    title,
    excerpt: input.excerpt,
    html,
    content: input.content
  })

  return { html, readingTime }
}

export async function createPost(authorId: string, input: PostCreateInput, user: AuthenticatedUser) {
  const slug = await createUniqueSlug(input.title, input.slug)
  const category = await getCategoryConnect(input.category)
  const { html, readingTime } = preparePostFields(input)
  const status = input.status
  const publishedAt = status === PostStatus.PUBLISHED ? new Date() : null

  return prisma.post.create({
    data: {
      title: input.title,
      slug,
      excerpt: input.excerpt || null,
      content: input.content as Prisma.InputJsonValue,
      sanitizedHtml: html,
      coverImage: input.coverImage || null,
      status,
      readingTime,
      author: { connect: { id: authorId } },
      category,
      tags: { connectOrCreate: getTagConnect(input.tags) },
      publishedAt,
      metaTitle: input.metaTitle || null,
      metaDescription: input.metaDescription || null,
      ogImage: input.ogImage || null,
      isFeatured: user.role === 'SUPER_ADMIN' ? Boolean(input.isFeatured) : false
    },
    include: postInclude
  })
}

export async function updatePost(postId: string, input: PostUpdateInput, user: AuthenticatedUser) {
  const existing = await prisma.post.findUnique({
    where: { id: postId },
    include: { tags: true }
  })

  if (!existing || existing.deletedAt) throw new ApiError(404, 'Post not found', 'POST_NOT_FOUND')
  if (!canManageResource(user, existing.authorId)) throw new ApiError(403, 'Cannot edit this post', 'POST_FORBIDDEN')

  const category = input.category === undefined ? undefined : await getCategoryConnect(input.category)
  const { html, readingTime } = preparePostFields(input, existing.title)
  const title = input.title ?? existing.title
  const slug = input.slug || input.title ? await createUniqueSlug(title, input.slug, existing.id) : undefined
  const status = input.status
  const nextPublishedAt = status === PostStatus.PUBLISHED && !existing.publishedAt ? new Date() : undefined
  const data: Prisma.PostUpdateInput = {
    title: input.title,
    slug,
    excerpt: input.excerpt,
    coverImage: input.coverImage,
    status,
    readingTime,
    category,
    tags: input.tags ? { set: [], connectOrCreate: getTagConnect(input.tags) } : undefined,
    publishedAt: nextPublishedAt,
    metaTitle: input.metaTitle,
    metaDescription: input.metaDescription,
    ogImage: input.ogImage,
    isFeatured: user.role === 'SUPER_ADMIN' ? input.isFeatured : undefined,
    author: user.role === 'SUPER_ADMIN' && input.authorId ? { connect: { id: input.authorId } } : undefined
  }

  if (input.content !== undefined) data.content = input.content as Prisma.InputJsonValue
  if (input.html !== undefined) data.sanitizedHtml = html

  return prisma.post.update({
    where: { id: postId },
    data,
    include: postInclude
  })
}

export async function softDeletePost(postId: string, user: AuthenticatedUser) {
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true, authorId: true, deletedAt: true } })
  if (!post || post.deletedAt) throw new ApiError(404, 'Post not found', 'POST_NOT_FOUND')
  if (!canManageResource(user, post.authorId)) throw new ApiError(403, 'Cannot delete this post', 'POST_FORBIDDEN')

  return prisma.post.update({
    where: { id: postId },
    data: { deletedAt: new Date() },
    include: postInclude
  })
}

export async function setPostStatus(postId: string, status: PostStatus, user: AuthenticatedUser) {
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { id: true, authorId: true, deletedAt: true, publishedAt: true } })
  if (!post || post.deletedAt) throw new ApiError(404, 'Post not found', 'POST_NOT_FOUND')
  if (!canManageResource(user, post.authorId)) throw new ApiError(403, 'Cannot update this post status', 'POST_FORBIDDEN')

  return prisma.post.update({
    where: { id: postId },
    data: {
      status,
      publishedAt: status === PostStatus.PUBLISHED ? post.publishedAt ?? new Date() : post.publishedAt
    },
    include: postInclude
  })
}

export function buildPostWhere(query: PostQueryInput, visibility: 'public' | 'owner' | 'admin', userId?: string): Prisma.PostWhereInput {
  const where: Prisma.PostWhereInput = {}

  if (query.includeDeleted !== 'true' || visibility !== 'admin') where.deletedAt = null
  if (visibility === 'public') where.status = PostStatus.PUBLISHED
  if (visibility === 'owner') where.authorId = userId
  if (query.status && visibility !== 'public') where.status = query.status
  if (query.featured) where.isFeatured = query.featured === 'true'
  if (query.category) where.category = { slug: slugify(query.category) }
  if (query.tag) where.tags = { some: { slug: slugify(query.tag) } }
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { excerpt: { contains: query.search, mode: 'insensitive' } },
      { metaDescription: { contains: query.search, mode: 'insensitive' } }
    ]
  }

  return where
}

export async function listPosts(query: PostQueryInput, visibility: 'public' | 'owner' | 'admin', userId?: string) {
  const where = buildPostWhere(query, visibility, userId)
  const skip = (query.page - 1) * query.pageSize

  const [items, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      select: postListSelect,
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      skip,
      take: query.pageSize
    }),
    prisma.post.count({ where })
  ])

  return {
    items,
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.ceil(total / query.pageSize)
    }
  }
}
