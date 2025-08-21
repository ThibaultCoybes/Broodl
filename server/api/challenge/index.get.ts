// server/api/challenge/index.get.ts - Utilise challengeTypes.ts
import { getUserChallenges } from '~/server/services/challengeService'
import { challengeTypes } from '~/config/challengeType'

export default defineEventHandler(async (event) => {
    try {
        if (!event.context.user) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Non authentifié'
            })
        }
        
        const userId = event.context.user.id
        const rawChallenges = await getUserChallenges(userId)

        const frontendChallenges = rawChallenges.map(challenge => ({
            id: challenge.id,
            title: challenge.title,
            description: challenge.description,
            category: getCategoryDisplayName(challenge.category),
            icon: getCategoryIcon(challenge.category),
            status: getDisplayStatus(challenge),
            type: determineType(challenge, userId),
            isCreator: challenge.isCreator,
            progress: challenge.progress,
            currentValue: challenge.currentValue,
            targetValue: challenge.targetValue,
            unit: challenge.unit,
            participants: challenge.participants.map(p => ({
                id: p.user_id,
                name: p.name || 'Utilisateur',
                avatar: p.avatar || getDefaultAvatar(p.name)
            })),
            endDate: challenge.end_date,
            lastActivity: challenge.updated_at || challenge.created_at
        }))

        return {
            success: true,
            data: frontendChallenges
        }
        
    } catch (error) {
        console.error('Erreur API challenges:', error)
        
        if (error instanceof Error) {
            throw error
        }
            
        return {
            success: false,
            data: [],
            message: error || 'Erreur lors du chargement des défis'
        }
    }
})

// ===== FONCTIONS UTILISANT LA CONFIG =====

// ✅ Utilise challengeTypes.ts pour les icônes
function getCategoryIcon(category: string): string {
    const categoryConfig = challengeTypes.find(ct => ct.id === category)
    return categoryConfig?.icon || '🎯'
}

// ✅ Utilise challengeTypes.ts pour les noms d'affichage
function getCategoryDisplayName(category: string): string {
    const categoryConfig = challengeTypes.find(ct => ct.id === category)
    return categoryConfig?.name || category.charAt(0).toUpperCase() + category.slice(1)
}

// ✅ Fonctions utilitaires
function determineType(challenge: any, userId: number): string {
    if (challenge.status === 'completed') return 'completed'
    if (challenge.isCreator) return 'organized'
    return 'active'
}

function getDisplayStatus(challenge: any): string {
    if (challenge.status === 'completed') return 'completed'
    if (challenge.status === 'cancelled') return 'cancelled'
    
    const daysLeft = getDaysLeft(challenge.end_date)
    if (daysLeft <= 7 && daysLeft > 0) return 'ending_soon'
    
    return 'active'
}

// Fonction utilitaire centralisée pour le serveur
function getDaysLeft(endDate: string | Date): number {
    const today = new Date()
    const end = new Date(endDate)
    const diffTime = end.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

function getDefaultAvatar(name: string): string {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=random&color=fff&size=128`
}