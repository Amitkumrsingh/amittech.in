import type { NextApiRequest, NextApiResponse } from 'next'
import { requireUser } from '../../../lib/api/auth'
import { methodNotAllowed, ok, withApiErrorHandling } from '../../../lib/api/http'
import { listPosts } from '../../../lib/api/posts'
import { postQuerySchema } from '../../../lib/api/schemas'

export default withApiErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET'])

  const user = await requireUser(req)
  const query = postQuerySchema.parse(req.query)
  const posts = await listPosts(query, 'owner', user.id)
  return ok(res, posts)
})
