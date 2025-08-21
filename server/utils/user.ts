// server/utils/user.ts
import { PrismaClient } from '@prisma/client'
import { verifyPassword } from './auth'
const prisma = new PrismaClient()

export async function isEmailTaken(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
      where: { email }
  })
  return !!user
}

export async function createUser({ email, password, username, firstname, lastname }: { email: string, password: string, username: string, firstname: string, lastname: string }) {
  const user = await prisma.user.create({
      data: { email, password, username, firstname, lastname }
  })
  return {id: user.id}
}

export async function loginUser({ email, password }: { email: string, password: string }) {
  const user = await prisma.user.findUnique({ where: { email: email } })

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Identifiants invalides',
    })
  }
  
  const isValid = await verifyPassword(password, user.password)

  if (!isValid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Identifiants invalides',
    })
  }

  return user
}
