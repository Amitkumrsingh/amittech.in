import type { NextApiRequest, NextApiResponse } from 'next'
import { PostStatus } from '@prisma/client'
import { requireUser } from '../../../../lib/api/auth'
import { ApiError, getQueryString, methodNotAllowed, ok, withApiErrorHandling } from '../../../../lib/api/http'
import { setPostStatus } from '../../../../lib/api/posts'

export default withApiErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') return methodNotAllowed(res, ['PATCH'])

  const id = getQueryString(req.query.id)
  if (!id) throw new ApiError(400, 'Post id is required', 'POST_ID_REQUIRED')

  const user = await requireUser(req)
  const post = await setPostStatus(id, PostStatus.PUBLISHED, user)
  return ok(res, { post })
})
