// server/middleware/auth.ts - Version propre sans debug
import { H3Event } from 'h3'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const publicRoutes = [
  '/api/auth/login',
  '/api/auth/register'
]

function isPublicRoute(path: string | undefined): boolean {
  if (!path) return false
  
  // Exact match pour la racine
  if (path === '/') return true
  
  // Check des routes API publiques
  return publicRoutes.some(route => path.startsWith(route))
}

export default defineEventHandler(async (event: H3Event) => {
  const url = getRequestURL(event)
  const path = url.pathname

  if (isPublicRoute(path) || 
      path.startsWith('/_nuxt/') || 
      path.startsWith('/assets/') ||
      !path.startsWith('/api/')) {
    return
  }
  try {
    const token = getCookie(event, 'accessToken')

    if (!token) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token d\'authentification manquant',
        data: { code: 'MISSING_TOKEN' }
      })
    }

    const config = useRuntimeConfig(event)
    const decoded = jwt.verify(token, config.jwtSecret)

    if (typeof decoded !== 'object' || !decoded.id) {
      throw new Error('Token invalide')
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        username: true,
        firstname: true,
        lastname: true,
        avatarUrl: true
      }
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Utilisateur non trouvé',
        data: { code: 'USER_NOT_FOUND' }
      })
    }

    event.context.user = user
  } catch (error) {
    console.error('Erreur d\'authentification:', error)
    
    if (error instanceof jwt.JsonWebTokenError) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Token invalide',
        data: { code: 'INVALID_TOKEN' }
      })
    }

    if (error instanceof jwt.TokenExpiredError) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Session expirée',
        data: { code: 'TOKEN_EXPIRED' }
      })
    }

    throw error
  }
})