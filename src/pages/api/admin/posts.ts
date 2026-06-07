import type { NextApiRequest, NextApiResponse } from 'next'
import { requireSuperAdmin } from '../../../lib/api/auth'
import { methodNotAllowed, ok, withApiErrorHandling } from '../../../lib/api/http'
import { listPosts } from '../../../lib/api/posts'
import { postQuerySchema } from '../../../lib/api/schemas'

export default withApiErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET'])

  await requireSuperAdmin(req)
  const query = postQuerySchema.parse({ ...req.query, includeDeleted: req.query.includeDeleted || 'true' })
  const posts = await listPosts(query, 'admin')
  return ok(res, posts)
})
