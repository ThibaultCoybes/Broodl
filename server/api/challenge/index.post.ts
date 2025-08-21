import { readBody } from 'h3'
import { PrismaClient } from '@prisma/client'
import { connectMongoDB } from '~/server/utils/db'
import { Challenge, ChallengeParticipant } from '~/server/utils/models'
import { CATEGORIES, TYPES, MODES, VISIBILITIES } from '~/config/challengeType'

const prisma = new PrismaClient()

// Fonction pour générer un code d'invitation unique
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Interface du body
interface CreateChallengeBody {
  category: string
  title: string
  description: string
  target_value: number
  unit: string
  end_date: string
  type: string
  mode?: string | null
  visibility: string
}

export default defineEventHandler(async (event) => {
  try {
    await connectMongoDB()
    console.log('✅ MongoDB connecté')

    const body = await readBody(event) as CreateChallengeBody
    if (!body) {
      throw createError({ statusCode: 400, statusMessage: 'Aucun corps fourni' })
    }

    console.log('📝 Données reçues:', body)

    // ------------------------
    // VALIDATIONS
    // ------------------------

    // Catégorie valide
    if (!Object.values(CATEGORIES).includes(body.category as any)) {
      throw createError({ statusCode: 400, statusMessage: 'Catégorie invalide' })
    }

    // Type valide
    if (!Object.values(TYPES).includes(body.type as any)) {
      throw createError({ statusCode: 400, statusMessage: 'Type invalide' })
    }

    // Solo = pas de mode, visibilité = private
    if (body.type === TYPES.INDIVIDUAL) {
      if (body.mode) {
        throw createError({ statusCode: 400, statusMessage: 'Un défi solo ne peut pas avoir de mode' })
      }
      if (body.visibility !== VISIBILITIES.PRIVATE) {
        throw createError({ statusCode: 400, statusMessage: 'Un défi solo doit être privé' })
      }
    }

    // Group = mode obligatoire
    if (body.type === TYPES.GROUP && !body.mode) {
      throw createError({ statusCode: 400, statusMessage: 'Un défi de groupe doit avoir un mode' })
    }

    // Fitness + Group = mode = Common uniquement
    if (body.category === CATEGORIES.FITNESS && body.type === TYPES.GROUP && body.mode !== MODES.COMMON) {
      throw createError({ statusCode: 400, statusMessage: 'Les défis Fitness en groupe doivent être en mode Common' })
    }

    // Finance + Group = mode = Collective uniquement
    if (body.category === CATEGORIES.FINANCE && body.type === TYPES.GROUP && body.mode !== MODES.COLLECTIVE) {
      throw createError({ statusCode: 400, statusMessage: 'Les défis Finance en groupe doivent être en mode Collective' })
    }

    // ------------------------
    // CREATION CHALLENGE
    // ------------------------
    const challenge = await Challenge.create({
      creator_id: event.context.user.id,
      title: body.title,
      description: body.description,
      category: body.category,
      type: body.type,
      mode: body.mode || null,
      visibility: body.visibility,
      target_value: body.target_value,
      unit: body.unit,
      end_date: new Date(body.end_date)
    })

    console.log('✅ Challenge créé:', challenge._id)

    // Créateur devient participant
    const participant = await ChallengeParticipant.create({
      user_id: event.context.user.id,
      challenge_id: challenge._id,
      role: 'creator',
      personal_target: body.target_value,
      personal_unit: body.unit,
      personal_current: 0
    })

    console.log('✅ Participant créé:', participant._id)

    // ------------------------
    // INVITE CODE (uniquement pour les groupes)
    // ------------------------
    let inviteCode: string | null = null

    if (body.type === TYPES.GROUP) {
      try {
        let attempts = 0
        let isUnique = false

        while (!isUnique && attempts < 10) {
          const code = generateInviteCode()
          const existingCode = await prisma.challengeInvite.findUnique({ where: { code } })

          if (!existingCode) {
            await prisma.challengeInvite.create({
              data: {
                code,
                challenge_id: challenge._id.toString(),
                creator_id: event.context.user.id
              }
            })
            inviteCode = code
            isUnique = true
            console.log('✅ Code d\'invitation généré:', code)
          }
          attempts++
        }

        if (!isUnique) {
          console.warn('⚠️ Impossible de générer un code unique après 10 tentatives')
        }
      } catch (prismaError) {
        console.error('❌ Erreur Prisma pour le code d\'invitation:', prismaError)
      }
    }

    // ------------------------
    // REPONSE
    // ------------------------
    const response: any = {
      success: true,
      challenge: {
        id: challenge._id.toString(),
        title: challenge.title,
        category: challenge.category,
        type: challenge.type,
        mode: challenge.mode,
        visibility: challenge.visibility,
        target_value: challenge.target_value,
        unit: challenge.unit,
        end_date: challenge.end_date
      },
      participant: {
        id: participant._id.toString(),
        role: participant.role,
        personal_target: participant.personal_target
      },
      message: ''
    }

    if (inviteCode) {
      response.invite_code = inviteCode
      response.message = `Défi de groupe créé ! Code d'invitation : ${inviteCode}`
    } else if (body.type === TYPES.INDIVIDUAL) {
      response.message = 'Défi solo créé avec succès !'
    } else {
      response.message = 'Défi créé avec succès !'
    }

    return response

  } catch (error: any) {
    console.error('❌ Erreur création challenge:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Erreur lors de la création du défi'
    })
  } finally {
    await prisma.$disconnect()
  }
})
