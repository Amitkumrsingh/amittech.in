import type { NextApiRequest, NextApiResponse } from 'next'
import { requireSuperAdmin } from '../../../../lib/api/auth'
import { ApiError, getQueryString, methodNotAllowed, ok, withApiErrorHandling } from '../../../../lib/api/http'
import { softDeletePost, updatePost } from '../../../../lib/api/posts'
import { postUpdateSchema } from '../../../../lib/api/schemas'

export default withApiErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = getQueryString(req.query.id)
  if (!id) throw new ApiError(400, 'Post id is required', 'POST_ID_REQUIRED')

  const user = await requireSuperAdmin(req)

  if (req.method === 'PUT') {
    const payload = postUpdateSchema.parse(req.body)
    const post = await updatePost(id, payload, user)
    return ok(res, { post })
  }

  if (req.method === 'DELETE') {
    const post = await softDeletePost(id, user)
    return ok(res, { post })
  }

  return methodNotAllowed(res, ['PUT', 'DELETE'])
})
