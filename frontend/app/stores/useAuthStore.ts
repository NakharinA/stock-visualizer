import { defineStore } from 'pinia'

interface User {
  id: string
  name: string
  email: string
  avatar?: string | null
}

export const useAuthStore = defineStore('auth', () => {
  // Token persisted in cookie (7-day expiry matches backend JWT)
  const token = useCookie<string | null>('stockviz-token', {
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  })

  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => !!token.value)

  // Hydrate user from cookie-stored user data on client
  const userCookie = useCookie<User | null>('stockviz-user', {
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
  })
  if (userCookie.value) {
    user.value = userCookie.value
  }

  function setSession(userData: User, accessToken: string) {
    token.value = accessToken
    user.value = userData
    userCookie.value = userData
  }

  function clearSession() {
    token.value = null
    user.value = null
    userCookie.value = null
  }

  return { token, user, isAuthenticated, setSession, clearSession }
})
