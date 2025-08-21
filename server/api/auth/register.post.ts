import { z } from 'zod'
import { createUser, isEmailTaken } from '../../../server/utils/user'
import { hashPassword } from '~~/server/utils/auth'

const bodySchema = z.object({
  email: z.string().email({ message: "* Email invalide" }),

  username: z.string()
    .min(3, { message: "* Le nom d'utilisateur doit faire au moins 3 caractères" })
    .max(20, { message: "* Le nom d'utilisateur doit faire au plus 20 caractères" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "* Le nom d'utilisateur ne doit contenir que des lettres, chiffres ou underscore" }),

  firstname: z.string()
    .min(2, { message: "* Le prénom doit faire au moins 2 caractères" })
    .max(30, { message: "* Le prénom doit faire au plus 30 caractères" })
    .regex(/^[a-zA-ZÀ-ÖØ-öø-ÿ' -]+$/, { message: "* Le prénom ne doit contenir que des lettres, espaces, tirets ou apostrophes" }),

  lastname: z.string()
    .min(2, { message: "* Le nom doit faire au moins 2 caractères" })
    .max(30, { message: "* Le nom doit faire au plus 30 caractères" })
    .regex(/^[a-zA-ZÀ-ÖØ-öø-ÿ' -]+$/, { message: "* Le nom ne doit contenir que des lettres, espaces, tirets ou apostrophes" }),

  password: z.string()
    .min(8, { message: "* Le mot de passe doit faire au moins 8 caractères" })
    .max(100, { message: "* Le mot de passe est trop long" })
    .regex(/[A-Z]/, { message: "* Le mot de passe doit contenir au moins une majuscule" })
    .regex(/[a-z]/, { message: "* Le mot de passe doit contenir au moins une minuscule" })
    .regex(/[0-9]/, { message: "* Le mot de passe doit contenir au moins un chiffre" })
    .regex(/[\W_]/, { message: "* Le mot de passe doit contenir au moins un caractère spécial" }),
});


export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const validation = bodySchema.safeParse(body)

    if (!validation.success) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Validation Error',
            data: {
                issues: validation.error.issues
            }
        })
    }

    const { email, password, username, firstname, lastname } = validation.data

    if (await isEmailTaken(email)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Email déjà utilisé',
            data: { type: 'email_taken' }
        })
    }
    const hashedPassword = await hashPassword(password)

    const userId = await createUser({ email, password: hashedPassword, username, firstname, lastname })
    const token = generateAccessToken({ id: userId.id , email: email, username: username })

    setCookie(event, 'accessToken', token, {
        httpOnly: false,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24
    })

    return { success: true }
})