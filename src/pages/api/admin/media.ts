import type { NextApiRequest, NextApiResponse } from 'next'
import { requireSuperAdmin } from '../../../lib/api/auth'
import { getQueryNumber, methodNotAllowed, ok, withApiErrorHandling } from '../../../lib/api/http'
import { prisma } from '../../../lib/api/prisma'

export default withApiErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET'])

  await requireSuperAdmin(req)

  const page = getQueryNumber(req.query.page, 1)
  const pageSize = Math.min(getQueryNumber(req.query.pageSize, 25), 100)
  const skip = (page - 1) * pageSize

  const [items, total] = await prisma.$transaction([
    prisma.media.findMany({
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        post: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize
    }),
    prisma.media.count()
  ])

  return ok(res, {
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  })
})
