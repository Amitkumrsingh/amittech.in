import type { NextApiRequest, NextApiResponse } from 'next'
import { randomBytes, createHash } from 'crypto'
import { OAuth2Client } from 'google-auth-library'
import type { Role, User } from '@prisma/client'
import { prisma } from './prisma'
import { ApiError } from './http'

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'amittech_session'
const SESSION_DAYS = Number(process.env.SESSION_DAYS || 30)
const SESSION_MAX_AGE_SECONDS = SESSION_DAYS * 24 * 60 * 60

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export type AuthenticatedUser = Pick<User, 'id' | 'name' | 'email' | 'profileImage' | 'role' | 'status' | 'createdAt' | 'updatedAt'>

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME
}

function hashSessionToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

function parseCookies(cookieHeader = '') {
  return Object.fromEntries(
    cookieHeader
      .split(';')
      .map(cookie => cookie.trim())
      .filter(Boolean)
      .map(cookie => {
        const [key, ...value] = cookie.split('=')
        return [decodeURIComponent(key), decodeURIComponent(value.join('='))]
      })
  )
}

export function getSessionToken(req: NextApiRequest) {
  return parseCookies(req.headers.cookie)[SESSION_COOKIE_NAME]
}

export function setSessionCookie(res: NextApiResponse, token: string) {
  const secure = process.env.NODE_ENV === 'production'
  res.setHeader('Set-Cookie', [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SECONDS}${secure ? '; Secure' : ''}`
  ])
}

export function clearSessionCookie(res: NextApiResponse) {
  const secure = process.env.NODE_ENV === 'production'
  res.setHeader('Set-Cookie', [
    `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? '; Secure' : ''}`
  ])
}

function getSuperAdminEmails() {
  return new Set(
    (process.env.SUPER_ADMIN_EMAILS || '')
      .split(',')
      .map(email => email.trim().toLowerCase())
      .filter(Boolean)
  )
}

function getRoleForEmail(email: string): Role {
  return getSuperAdminEmails().has(email.toLowerCase()) ? 'SUPER_ADMIN' : 'USER'
}

export async function verifyGoogleCredential(credential: string) {
  const audience = process.env.GOOGLE_CLIENT_ID
  if (!audience) throw new ApiError(500, 'Google OAuth is not configured', 'AUTH_CONFIG_MISSING')

  const ticket = await googleClient.verifyIdToken({ idToken: credential, audience })
  const payload = ticket.getPayload()

  if (!payload?.email || !payload.email_verified) {
    throw new ApiError(401, 'Google account email could not be verified', 'GOOGLE_EMAIL_NOT_VERIFIED')
  }

  return {
    providerAccountId: payload.sub,
    email: payload.email,
    name: payload.name || payload.email.split('@')[0],
    profileImage: payload.picture || null
  }
}

export async function createSessionForUser(userId: string) {
  const rawToken = randomBytes(48).toString('base64url')
  const tokenHash = hashSessionToken(rawToken)
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000)

  await prisma.session.create({
    data: {
      sessionTokenHash: tokenHash,
      userId,
      expiresAt
    }
  })

  return rawToken
}

export async function revokeSession(req: NextApiRequest) {
  const token = getSessionToken(req)
  if (!token) return

  await prisma.session.updateMany({
    where: {
      sessionTokenHash: hashSessionToken(token),
      revokedAt: null
    },
    data: {
      revokedAt: new Date()
    }
  })
}

export async function getCurrentUser(req: NextApiRequest): Promise<AuthenticatedUser | null> {
  const token = getSessionToken(req)
  if (!token) return null

  const session = await prisma.session.findUnique({
    where: { sessionTokenHash: hashSessionToken(token) },
    include: {
      user: {
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
      }
    }
  })

  if (!session || session.revokedAt || session.expiresAt <= new Date()) return null
  if (session.user.status !== 'ACTIVE') throw new ApiError(403, 'User account is not active', 'USER_INACTIVE')

  return session.user
}

export async function requireUser(req: NextApiRequest) {
  const user = await getCurrentUser(req)
  if (!user) throw new ApiError(401, 'Authentication required', 'AUTH_REQUIRED')
  return user
}

export async function requireSuperAdmin(req: NextApiRequest) {
  const user = await requireUser(req)
  if (user.role !== 'SUPER_ADMIN') throw new ApiError(403, 'Super admin access required', 'SUPER_ADMIN_REQUIRED')
  return user
}

export function canManageResource(user: AuthenticatedUser, ownerId: string) {
  return user.role === 'SUPER_ADMIN' || user.id === ownerId
}

export async function upsertGoogleUser(profile: Awaited<ReturnType<typeof verifyGoogleCredential>>) {
  const role = getRoleForEmail(profile.email)

  return prisma.user.upsert({
    where: { email: profile.email },
    update: {
      name: profile.name,
      profileImage: profile.profileImage,
      role: role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : undefined,
      accounts: {
        upsert: {
          where: {
            provider_providerAccountId: {
              provider: 'google',
              providerAccountId: profile.providerAccountId
            }
          },
          create: {
            provider: 'google',
            providerAccountId: profile.providerAccountId
          },
          update: {}
        }
      }
    },
    create: {
      email: profile.email,
      name: profile.name,
      profileImage: profile.profileImage,
      role,
      accounts: {
        create: {
          provider: 'google',
          providerAccountId: profile.providerAccountId
        }
      }
    },
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
}
