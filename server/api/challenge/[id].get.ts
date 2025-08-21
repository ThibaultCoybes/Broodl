import { getChallengeById } from '~/server/services/challengeService'

export default defineEventHandler(async (event) => {

  const challengeId = getRouterParam(event, 'id')
  const userId = event.context.user.id

  try {
    const challenge = await getChallengeById(challengeId as string, userId)
    return { success: true, data: challenge }
  } catch (error) {
    return { success: false, message: error }
  }
})
