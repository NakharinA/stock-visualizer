import { defineStore } from 'pinia'

interface User {
  name: string
  email: string
  avatar?: string
}

const AUTH_KEY = 'stockviz-auth-user'

export const useAuthStore = defineStore('auth', () => {
  const stored = import.meta.client ? localStorage.getItem(AUTH_KEY) : null
  const user = ref<User | null>(stored ? JSON.parse(stored) : null)
  const isAuthenticated = computed(() => !!user.value)

  function login(email: string, _password: string) {
    user.value = {
      name: email.split('@')[0] ?? 'User',
      email,
      avatar: undefined,
    }
    localStorage.setItem(AUTH_KEY, JSON.stringify(user.value))
  }

  function logout() {
    user.value = null
    localStorage.removeItem(AUTH_KEY)
  }

  return { user, isAuthenticated, login, logout }
})
