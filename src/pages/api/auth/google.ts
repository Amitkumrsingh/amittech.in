import type { NextApiRequest, NextApiResponse } from 'next'
import { created, methodNotAllowed, withApiErrorHandling } from '../../../lib/api/http'
import { createSessionForUser, setSessionCookie, upsertGoogleUser, verifyGoogleCredential } from '../../../lib/api/auth'
import { googleLoginSchema } from '../../../lib/api/schemas'

export default withApiErrorHandling(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST'])

  const payload = googleLoginSchema.parse(req.body)
  const profile = await verifyGoogleCredential(payload.credential)
  const user = await upsertGoogleUser(profile)
  const sessionToken = await createSessionForUser(user.id)

  setSessionCookie(res, sessionToken)
  return created(res, { user })
})
