import type { NextApiRequest, NextApiResponse } from 'next'
import { requireUser } from '../../../lib/api/auth'
import { created, methodNotAllowed, ok, withApiErrorHandling } from '../../../lib/api/http'
import { createPost, listPosts } from '../../../lib/api/posts'
import { postCreateSchema, postQuerySchema } from '../../../lib/api/schemas'

export default withApiErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const query = postQuerySchema.parse(req.query)
    const posts = await listPosts(query, 'public')
    return ok(res, posts)
  }

  if (req.method === 'POST') {
    const user = await requireUser(req)
    const payload = postCreateSchema.parse(req.body)
    const post = await createPost(user.id, payload, user)
    return created(res, { post })
  }

  return methodNotAllowed(res, ['GET', 'POST'])
})
