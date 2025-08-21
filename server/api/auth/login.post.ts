import { z } from 'zod'
import { loginUser } from '../../../server/utils/user'
import { generateAccessToken } from '~~/server/utils/auth'

const bodySchema = z.object({
    email: z.string().email({ message: "* Email invalide" }),
    password: z.string().min(1, { message: "* Mot de passe requis" }),
})

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const validation = bodySchema.safeParse(body)

    if (!validation.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Validation Error',
            data: {
                issues: validation.error.issues,
            },
        })
    }

    const { email, password } = validation.data
    const user = await loginUser({ email, password })
    const token = generateAccessToken({ id: user.id, email: user.email, username: user.username })

    setCookie(event, 'accessToken', token, {
        httpOnly: false,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24
    })
    
    return { success: true, token: token }
})
