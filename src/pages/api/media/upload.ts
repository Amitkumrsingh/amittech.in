import type { NextApiRequest, NextApiResponse } from 'next'
import { canManageResource, requireUser } from '../../../lib/api/auth'
import { ApiError, methodNotAllowed, ok, withApiErrorHandling } from '../../../lib/api/http'
import { getMediaType, parseMultipartUpload, uploadToMediaStorage } from '../../../lib/api/media'
import { prisma } from '../../../lib/api/prisma'

export const config = {
  api: {
    bodyParser: false
  }
}

export default withApiErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

  const user = await requireUser(req)
  const { file, postId } = await parseMultipartUpload(req)

  if (postId) {
    const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true, deletedAt: true } })
    if (!post || post.deletedAt) throw new ApiError(404, 'Post not found', 'POST_NOT_FOUND')
    if (!canManageResource(user, post.authorId)) throw new ApiError(403, 'Cannot upload media for this post', 'MEDIA_FORBIDDEN')
  }

  const type = getMediaType(file)
  const url = await uploadToMediaStorage(file, type)
  const media = await prisma.media.create({
    data: {
      url,
      type,
      filename: file.originalFilename || file.newFilename,
      mimeType: file.mimetype || 'application/octet-stream',
      size: Number(file.size || 0),
      uploadedById: user.id,
      postId
    }
  })

  return ok(res, { media }, 201)
})
