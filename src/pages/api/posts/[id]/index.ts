import type { NextApiRequest, NextApiResponse } from 'next'
import { PostStatus } from '@prisma/client'
import { canManageResource, getCurrentUser, requireUser } from '../../../../lib/api/auth'
import { ApiError, getQueryString, methodNotAllowed, ok, withApiErrorHandling } from '../../../../lib/api/http'
import { getPostInclude, softDeletePost, updatePost } from '../../../../lib/api/posts'
import { prisma } from '../../../../lib/api/prisma'
import { postUpdateSchema } from '../../../../lib/api/schemas'

export default withApiErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = getQueryString(req.query.id)
  if (!id) throw new ApiError(400, 'Post identifier is required', 'POST_IDENTIFIER_REQUIRED')

  if (req.method === 'GET') {
    const user = await getCurrentUser(req)
    const post = await prisma.post.findFirst({
      where: {
        OR: [{ slug: id }, { id }],
        deletedAt: null
      },
      include: getPostInclude()
    })

    if (!post) throw new ApiError(404, 'Post not found', 'POST_NOT_FOUND')
    if (post.status !== PostStatus.PUBLISHED && (!user || !canManageResource(user, post.authorId))) {
      throw new ApiError(404, 'Post not found', 'POST_NOT_FOUND')
    }

    if (post.status === PostStatus.PUBLISHED) {
      await prisma.post.update({ where: { id: post.id }, data: { views: { increment: 1 } } })
    }

    return ok(res, { post })
  }

  if (req.method === 'PUT') {
    const user = await requireUser(req)
    const payload = postUpdateSchema.parse(req.body)
    const post = await updatePost(id, payload, user)
    return ok(res, { post })
  }

  if (req.method === 'DELETE') {
    const user = await requireUser(req)
    const post = await softDeletePost(id, user)
    return ok(res, { post })
  }

  return methodNotAllowed(res, ['GET', 'PUT', 'DELETE'])
})
