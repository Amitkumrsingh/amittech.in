import { PostStatus, UserStatus, Role } from '@prisma/client'
import { z } from 'zod'

const optionalString = z.string().trim().min(1).optional().nullable()

export const googleLoginSchema = z.object({
  credential: z.string().min(20)
})

const postInputBaseSchema = z.object({
  title: z.string().trim().min(3).max(180),
  slug: z.string().trim().min(3).max(220).optional(),
  excerpt: optionalString,
  content: z.unknown().optional(),
  html: optionalString,
  coverImage: optionalString,
  category: optionalString,
  tags: z.array(z.string().trim().min(1).max(48)).max(12).optional(),
  status: z.nativeEnum(PostStatus).optional(),
  metaTitle: optionalString,
  metaDescription: optionalString,
  ogImage: optionalString,
  isFeatured: z.boolean().optional()
})

export const postCreateSchema = postInputBaseSchema.extend({
  tags: z.array(z.string().trim().min(1).max(48)).max(12).default([]),
  status: z.nativeEnum(PostStatus).default('DRAFT')
})

export const postUpdateSchema = postInputBaseSchema.partial().extend({
  authorId: z.string().optional()
})

export const postQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  tag: z.string().trim().optional(),
  status: z.nativeEnum(PostStatus).optional(),
  featured: z.enum(['true', 'false']).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(12),
  includeDeleted: z.enum(['true', 'false']).optional()
})

export const roleUpdateSchema = z.object({
  role: z.nativeEnum(Role)
})

export const userStatusUpdateSchema = z.object({
  status: z.nativeEnum(UserStatus)
})

export const mediaQuerySchema = z.object({
  postId: z.string().optional()
})
