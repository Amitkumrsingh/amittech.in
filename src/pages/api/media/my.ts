import type { NextApiRequest, NextApiResponse } from 'next'
import { requireUser } from '../../../lib/api/auth'
import { methodNotAllowed, ok, withApiErrorHandling } from '../../../lib/api/http'
import { prisma } from '../../../lib/api/prisma'

export default withApiErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET'])

  const user = await requireUser(req)
  const media = await prisma.media.findMany({
    where: {
      uploadedById: user.id,
      deletedAt: null
    },
    orderBy: { createdAt: 'desc' }
  })

  return ok(res, { media })
})
