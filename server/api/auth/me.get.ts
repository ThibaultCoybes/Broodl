export default defineEventHandler(async (event) => {
  return {
    message: 'Utilisateur connecté',
    user: event.context.user
  }
})