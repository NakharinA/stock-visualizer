interface UserOut {
  id: string
  name: string
  email: string
  avatar?: string | null
}

interface LoginResponse {
  user: UserOut
  token: string
}

export function useAuthApi() {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase

  async function login(email: string, password: string): Promise<LoginResponse> {
    return $fetch<LoginResponse>('/auth/login', {
      baseURL,
      method: 'POST',
      body: { email, password },
    })
  }

  async function loginWithGoogle(): Promise<LoginResponse> {
    return $fetch<LoginResponse>('/auth/login/google', {
      baseURL,
      method: 'POST',
      body: {},
    })
  }

  async function logout(token: string): Promise<void> {
    await $fetch('/auth/logout', {
      baseURL,
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {
      // Best-effort — clear client state even if backend call fails
    })
  }

  return { login, loginWithGoogle, logout }
}
