import type { NextApiRequest, NextApiResponse } from 'next'
import { canManageResource, requireUser } from '../../../lib/api/auth'
import { ApiError, getQueryString, methodNotAllowed, ok, withApiErrorHandling } from '../../../lib/api/http'
import { prisma } from '../../../lib/api/prisma'

export default withApiErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = getQueryString(req.query.id)
  if (!id) throw new ApiError(400, 'Media id is required', 'MEDIA_ID_REQUIRED')

  if (req.method !== 'DELETE') return methodNotAllowed(res, ['DELETE'])

  const user = await requireUser(req)
  const media = await prisma.media.findUnique({ where: { id }, select: { uploadedById: true, deletedAt: true } })
  if (!media || media.deletedAt) throw new ApiError(404, 'Media not found', 'MEDIA_NOT_FOUND')
  if (!canManageResource(user, media.uploadedById)) throw new ApiError(403, 'Cannot delete this media', 'MEDIA_FORBIDDEN')

  const deleted = await prisma.media.update({
    where: { id },
    data: { deletedAt: new Date() },
    select: {
      id: true,
      url: true,
      type: true,
      filename: true,
      mimeType: true,
      size: true,
      createdAt: true,
      deletedAt: true
    }
  })

  return ok(res, { media: deleted })
})
