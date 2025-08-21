// server/services/challengeService.ts - Adapté aux modèles existants
import { connectMongoDB } from '../utils/db'
import { Challenge, ChallengeParticipant, ProgressLog } from '../utils/models'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ===== CRÉATION (format mis à jour) =====
export async function createChallenge(challengeData: {
  creator_id: number
  title: string
  description: string
  category: string
  type: 'individual' | 'group'
  mode?: 'common' | 'collective'
  visibility: 'private' | 'public_open' | 'public_invite'
  target_value: number
  unit: string
  end_date: Date | string
}) {
  await connectMongoDB()

  if (typeof challengeData.end_date === 'string') {
    challengeData.end_date = new Date(challengeData.end_date)
  }

  const challenge = new Challenge({
    ...challengeData,
    status: 'active'
  })

  const savedChallenge = await challenge.save()

  // Créer participation créateur
  await ChallengeParticipant.create({
    user_id: challengeData.creator_id,
    challenge_id: savedChallenge._id,
    role: 'creator',
    personal_target: challengeData.type === 'individual' || challengeData.mode === 'common' 
      ? challengeData.target_value 
      : null,  // null pour collective
    personal_current: 0,
    status: 'active'
  })

  return savedChallenge
}

// ===== LISTE UTILISATEUR (calculs ajoutés) =====
export async function getUserChallenges(userId: number) {
  await connectMongoDB()

  const userParticipations = await ChallengeParticipant.find({
    user_id: userId,
    status: { $in: ['active', 'completed'] }
  }).lean()

  const challengeIds = userParticipations.map(p => p.challenge_id)

  const challenges = await Challenge.find({
    _id: { $in: challengeIds },
    status: { $in: ['active', 'completed'] }
  }).lean()

  const allParticipants = await ChallengeParticipant.find({
    challenge_id: { $in: challenges.map(c => c._id) },
    status: { $in: ['active', 'completed'] }
  }).lean()

  const uniqueUserIds = [...new Set(allParticipants.map(p => p.user_id))]
  const users = await prisma.user.findMany({
    where: { id: { in: uniqueUserIds } },
    select: {
      id: true,
      username: true,
      firstname: true,
      lastname: true,
      avatarUrl: true
    }
  })

  const userMap = new Map(users.map(user => [user.id, user]))

  const enrichedChallenges = challenges.map((challenge) => {
    const challengeParticipants = allParticipants
      .filter(p => p.challenge_id.toString() === challenge._id.toString())
      
    const enrichedParticipants = challengeParticipants.map(participant => {
      const user = userMap.get(participant.user_id)
      return {
        id: participant._id.toString(),
        user_id: participant.user_id,
        role: participant.role,
        personal_target: participant.personal_target,
        personal_current: participant.personal_current || 0,
        name: user ? `${user.firstname || ''} ${user.lastname || ''}`.trim() || 'Utilisateur' : 'Utilisateur',
        username: user?.username || 'unknown',
        avatar: user?.avatarUrl || '/default-avatar.png',
        status: participant.status,
        joined_at: participant.joined_at
      }
    })

    const userParticipation = challengeParticipants.find(p => p.user_id === userId)
    const isCreator = userParticipation?.role === 'creator'

    // ✅ CALCULS selon logique avec champs existants
    let currentValue = 0
    let targetValue = challenge.target_value
    let progress = 0

    if (challenge.type === 'individual') {
      // Individual: ma progression
      currentValue = userParticipation?.personal_current || 0
      targetValue = userParticipation?.personal_target || challenge.target_value
      progress = targetValue > 0 ? Math.round((currentValue / targetValue) * 100) : 0
      
    } else if (challenge.mode === 'common') {
      // Common: ma progression vers objectif commun
      currentValue = userParticipation?.personal_current || 0
      targetValue = challenge.target_value
      progress = targetValue > 0 ? Math.round((currentValue / targetValue) * 100) : 0
      
    } else if (challenge.mode === 'collective') {
      // Collective: total collecté
      currentValue = enrichedParticipants.reduce((sum, p) => sum + (p.personal_current || 0), 0)
      targetValue = challenge.target_value
      progress = targetValue > 0 ? Math.round((currentValue / targetValue) * 100) : 0
    }

    return {
      id: challenge._id.toString(),
      title: challenge.title,
      description: challenge.description,
      category: challenge.category,
      type: challenge.type,
      mode: challenge.mode,
      visibility: challenge.visibility,
      target_value: challenge.target_value,
      unit: challenge.unit,
      end_date: challenge.end_date,
      status: challenge.status,
      created_at: challenge.created_at,
      updated_at: challenge.updated_at,
      
      // Données calculées
      isCreator,
      currentValue,
      targetValue,
      progress,
      
      participants: enrichedParticipants,
      userParticipation: userParticipation ? {
        personal_target: userParticipation.personal_target,
        personal_current: userParticipation.personal_current || 0,
        status: userParticipation.status,
        joined_at: userParticipation.joined_at
      } : null
    }
  })

  return enrichedChallenges
}

// ===== DÉTAIL CHALLENGE =====
export async function getChallengeById(challengeId: string, userId: number) {
  await connectMongoDB()

  const challenge = await Challenge.findById(challengeId).lean()
  if (!challenge) throw new Error('Défi non trouvé')

  const userParticipation = await ChallengeParticipant.findOne({
    challenge_id: challenge._id,
    user_id: userId,
    status: { $in: ['active', 'completed'] }
  }).lean()

  if (!userParticipation) throw new Error('Non autorisé')

  const allParticipants = await ChallengeParticipant.find({
    challenge_id: challenge._id,
    status: { $in: ['active', 'completed'] }
  }).lean()

  const userIds = allParticipants.map(p => p.user_id)
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, firstname: true, lastname: true, avatarUrl: true }
  })

  const userMap = new Map(users.map(u => [u.id, u]))

  const participants = allParticipants.map(p => {
    const user = userMap.get(p.user_id)
    return {
      id: p.user_id,
      name: user ? `${user.firstname} ${user.lastname}`.trim() : 'Utilisateur',
      avatar: user?.avatarUrl || '/avatars/default.jpg',
      role: p.role,
      isCreator: p.role === 'creator',
      personal_current: p.personal_current || 0,
      personal_target: p.personal_target,
      status: p.status
    }
  })

  const recentActivity = await ProgressLog.find({ challenge_id: challenge._id })
    .sort({ timestamp: -1 })
    .limit(10)
    .lean()

  const activity = recentActivity.map(a => {
    const user = userMap.get(a.user_id)
    return {
      id: a._id.toString(),
      user: {
        id: a.user_id,
        name: user ? `${user.firstname} ${user.lastname}`.trim() : 'Utilisateur',
        avatar: user?.avatarUrl || '/avatars/default.jpg'
      },
      message: a.note || `a mis à jour sa progression`,
      value: a.value,
      total_value: a.value,
      note: a.note,
      createdAt: a.timestamp
    }
  })

  const isCreator = userParticipation.role === 'creator'
  const currentValue = userParticipation.personal_current || 0
  const targetValue = userParticipation.personal_target || challenge.target_value
  const personalPercentage = targetValue > 0 ? Math.round((currentValue / targetValue) * 100) : 0

  // Icônes
  const icons = {
    fitness: '🏃‍♂️', finance: '💰', learning: '📚',
    health: '🍎', creative: '🎨', lifestyle: '🌱'
  }

  return {
    id: challenge._id.toString(),
    title: challenge.title,
    description: challenge.description,
    category: challenge.category.charAt(0).toUpperCase() + challenge.category.slice(1),
    icon: icons[challenge.category] || '🎯',
    type: challenge.type,
    mode: challenge.mode,
    status: challenge.status,
    isCreator,
    currentUserId: userId,
    
    currentValue,
    targetValue: challenge.target_value,
    personalPercentage,
    
    unit: challenge.unit,
    endDate: challenge.end_date,
    participants,
    recentActivity: activity
  }
}

// ===== MISE À JOUR PROGRESSION (logique additive) =====
export async function updateChallengeProgress(
  challengeId: string,
  userId: number,
  data: { added_value: number; note?: string }
) {
  await connectMongoDB()

  const challenge = await Challenge.findById(challengeId)
  if (!challenge) {
    throw new Error('Défi non trouvé')
  }

  const participant = await ChallengeParticipant.findOne({
    challenge_id: challengeId,
    user_id: userId,
    status: { $in: ['active', 'completed'] }
  })

  if (!participant) {
    throw new Error('Participant introuvable pour ce challenge')
  }

  // ✅ NOUVELLE LOGIQUE: additive
  const newValue = (participant.personal_current || 0) + data.added_value

  // ✅ CALCULER STATUT avec champs existants
  let newStatus = participant.status

  if (challenge.mode !== 'collective') {
    // Individual/Common: vérifier completion
    const target = participant.personal_target || challenge.target_value
    const percentage = target > 0 ? Math.round((newValue / target) * 100) : 0
    
    if (percentage >= 100 && participant.status !== 'completed') {
      newStatus = 'completed'
    }
  }
  // Collective: reste toujours 'active' individuellement

  // Mettre à jour participant
  participant.personal_current = newValue
  participant.status = newStatus
  await participant.save()

  // ✅ LOG avec format existant (pas de added_value dans le modèle)
  const log = new ProgressLog({
    challenge_id: challengeId,
    user_id: userId,
    value: newValue,  // Valeur totale
    note: data.note || ''
  })
  await log.save()

  // ✅ METTRE À JOUR statut global du challenge si nécessaire
  await updateChallengeGlobalStatus(challengeId)

  return { 
    success: true, 
    new_value: newValue,
    added_value: data.added_value,
    status: newStatus
  }
}

// ✅ NOUVELLE FONCTION: Statut global avec champs existants
async function updateChallengeGlobalStatus(challengeId: string) {
  const challenge = await Challenge.findById(challengeId)
  if (!challenge) return

  const participants = await ChallengeParticipant.find({ 
    challenge_id: challengeId,
    status: { $in: ['active', 'completed'] }
  })

  if (participants.length === 0) return

  let shouldComplete = false

  if (challenge.type === 'individual') {
    // Individual: basé sur le créateur
    const creator = participants.find(p => p.role === 'creator')
    shouldComplete = creator?.status === 'completed'
    
  } else if (challenge.mode === 'common') {
    // Common: TOUS doivent être completed
    const completedCount = participants.filter(p => p.status === 'completed').length
    shouldComplete = completedCount === participants.length
    
  } else if (challenge.mode === 'collective') {
    // Collective: total ≥ objectif
    const totalCollected = participants.reduce((sum, p) => sum + (p.personal_current || 0), 0)
    shouldComplete = totalCollected >= challenge.target_value
  }

  // Mettre à jour le challenge si nécessaire
  if (shouldComplete && challenge.status !== 'completed') {
    await Challenge.updateOne(
      { _id: challengeId }, 
      { status: 'completed', updated_at: new Date() }
    )
  }
}