import { updateChallengeProgress } from '~/server/services/challengeService'

export default defineEventHandler(async (event) => {
  const challengeId = getRouterParam(event, 'id')
  const userId = event.context.user?.id
  const body = await readBody(event)
  
  console.log('Challenge ID:', challengeId)
  console.log('User ID:', userId)
  console.log('Body reçu:', body)
  
  // Validation utilisateur
  if (!userId) {
    return { success: false, message: 'Utilisateur non authentifié' }
  }

  // ✅ Support des deux formats: ancien (value) et nouveau (added_value)
  const addedValue = body.added_value || body.value || 0
  const note = body.note || ''

  // Validation valeur
  if (!addedValue || addedValue <= 0) {
    return { success: false, message: 'Valeur ajoutée doit être positive' }
  }
  
  try {
    const result = await updateChallengeProgress(challengeId as string, userId, {
      added_value: addedValue,
      note: note
    })
    
    return { 
      success: true, 
      data: result,
      message: result.status === 'completed' ? 'Objectif atteint ! 🎉' : 'Progression mise à jour'
    }
  } catch (error: any) {  
    console.error('Erreur dans progress.post.ts:', error)
    return { success: false, message: error.message || 'Erreur lors de la mise à jour' }  
  }
})