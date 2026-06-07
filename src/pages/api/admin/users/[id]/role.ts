import type { NextApiRequest, NextApiResponse } from 'next'
import { requireSuperAdmin } from '../../../../../lib/api/auth'
import { ApiError, getQueryString, methodNotAllowed, ok, withApiErrorHandling } from '../../../../../lib/api/http'
import { prisma } from '../../../../../lib/api/prisma'
import { roleUpdateSchema } from '../../../../../lib/api/schemas'

export default withApiErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') return methodNotAllowed(res, ['PATCH'])

  await requireSuperAdmin(req)
  const id = getQueryString(req.query.id)
  if (!id) throw new ApiError(400, 'User id is required', 'USER_ID_REQUIRED')

  const payload = roleUpdateSchema.parse(req.body)
  const user = await prisma.user.update({
    where: { id },
    data: { role: payload.role },
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

  return ok(res, { user })
})
