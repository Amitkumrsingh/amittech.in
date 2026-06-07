import type { NextApiRequest, NextApiResponse } from 'next'
import { requireSuperAdmin } from '../../../../../lib/api/auth'
import { ApiError, getQueryString, methodNotAllowed, ok, withApiErrorHandling } from '../../../../../lib/api/http'
import { prisma } from '../../../../../lib/api/prisma'
import { userStatusUpdateSchema } from '../../../../../lib/api/schemas'

export default withApiErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') return methodNotAllowed(res, ['PATCH'])

  await requireSuperAdmin(req)
  const id = getQueryString(req.query.id)
  if (!id) throw new ApiError(400, 'User id is required', 'USER_ID_REQUIRED')

  const payload = userStatusUpdateSchema.parse(req.body)
  const user = await prisma.user.update({
    where: { id },
    data: { status: payload.status },
    select: {
      id: true,
      name: true,
      email: true,
      profileImage: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true
    }
  })

  if (payload.status !== 'ACTIVE') {
    await prisma.session.updateMany({
      where: { userId: id, revokedAt: null },
      data: { revokedAt: new Date() }
    })
  }

  return ok(res, { user })
})
