export function useAuthApi() {
  async function login(email: string, password: string) {
    await new Promise(r => setTimeout(r, 400))
    if (!email || !password) throw new Error('Invalid credentials')
    return { user: { name: email.split('@')[0] ?? 'User', email } }
  }

  async function loginWithGoogle() {
    await new Promise(r => setTimeout(r, 400))
    return { user: { name: 'Demo User', email: 'demo@example.com' } }
  }

  async function logout() {
    await new Promise(r => setTimeout(r, 100))
  }

  return { login, loginWithGoogle, logout }
}
