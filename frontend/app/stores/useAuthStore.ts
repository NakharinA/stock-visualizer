import { defineStore } from 'pinia'

interface User {
  name: string
  email: string
  avatar?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => !!user.value)

  function login(email: string, _password: string) {
    user.value = {
      name: email.split('@')[0] ?? 'User',
      email,
      avatar: undefined,
    }
  }

  function logout() {
    user.value = null
  }

  return { user, isAuthenticated, login, logout }
}, { persist: true })
