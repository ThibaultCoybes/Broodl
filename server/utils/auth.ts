import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

export function generateAccessToken(user: { id: number, email: string, username: string }) {
  return jwt.sign(
    { id: user.id, email: user.email, username: user.username },
    process.env.NUXT_JWT_SECRET!,
    { expiresIn: '1d' }
  )
}

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return await bcrypt.compare(password, hashedPassword)
}

