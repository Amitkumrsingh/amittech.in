import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { requireSuperAdmin } from '../../../../../lib/api/auth'
import { ApiError, getQueryString, methodNotAllowed, ok, withApiErrorHandling } from '../../../../../lib/api/http'
import { getPostInclude } from '../../../../../lib/api/posts'
import { prisma } from '../../../../../lib/api/prisma'

const featureSchema = z.object({
  isFeatured: z.boolean()
})

export default withApiErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') return methodNotAllowed(res, ['PATCH'])

  await requireSuperAdmin(req)
  const id = getQueryString(req.query.id)
  if (!id) throw new ApiError(400, 'Post id is required', 'POST_ID_REQUIRED')

  const payload = featureSchema.parse(req.body)
  const post = await prisma.post.update({
    where: { id },
    data: { isFeatured: payload.isFeatured },
    include: getPostInclude()
  })

  return ok(res, { post })
})
