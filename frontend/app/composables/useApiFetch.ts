/**
 * Thin wrapper around $fetch that injects:
 *  - baseURL from runtimeConfig.public.apiBase
 *  - Authorization: Bearer <token> when a token exists in the auth cookie
 */
export function useApiFetch() {
  const config = useRuntimeConfig()
  const token = useCookie<string | null>('stockviz-token')

  async function apiFetch<T>(path: string, options: Parameters<typeof $fetch>[1] = {}): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> | undefined),
    }
    if (token.value) {
      headers['Authorization'] = `Bearer ${token.value}`
    }

    return $fetch<T>(path, {
      ...options,
      baseURL: config.public.apiBase,
      headers,
    })
  }

  return { apiFetch }
}
