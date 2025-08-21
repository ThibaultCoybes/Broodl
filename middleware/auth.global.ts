export default defineNuxtRouteMiddleware(async (to) => {
  if (!import.meta.client) return 

  const publicPages = ["/auth/login", "/auth/register", "/"]
  const isPublicPage = publicPages.includes(to.path)
  const token = useCookie('accessToken')

  if (!token.value && !isPublicPage) {
    return navigateTo('/auth/login')
  }

  if (token.value && isPublicPage && to.path !== '/') {
    return navigateTo('/dashboard')
  }

  if (token.value) {
    try {
      const user = await $fetch('/api/auth/me')
      useState('authUser', () => user)
    } catch (error) {
      return navigateTo('/auth/login')
    }
  }
})
