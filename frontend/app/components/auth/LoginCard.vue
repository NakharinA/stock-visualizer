<template>
  <div class="w-full max-w-sm">
    <div class="bg-elevated border border-default rounded-xl p-8 space-y-6 shadow-2xl">
      <!-- Logo / title -->
      <div class="text-center space-y-1">
        <div class="flex justify-center mb-3">
          <div class="w-10 h-10 rounded-lg bg-[#58a6ff] flex items-center justify-center">
            <UIcon name="i-lucide-candlestick-chart" class="w-6 h-6 text-white" />
          </div>
        </div>
        <h1 class="text-xl font-semibold text-highlighted">StockViz</h1>
        <p class="text-sm text-muted">Sign in to your account</p>
      </div>

      <!-- Error alert -->
      <UAlert
        v-if="error"
        color="error"
        variant="subtle"
        :description="error"
        icon="i-lucide-alert-circle"
      />

      <!-- Form -->
      <form class="space-y-4" @submit.prevent="handleLogin">
        <UFormField label="Email" name="email">
          <UInput
            v-model="email"
            type="email"
            placeholder="you@example.com"
            autocomplete="email"
            required
            class="w-full"
          />
        </UFormField>

        <UFormField label="Password" name="password">
          <UInput
            v-model="password"
            type="password"
            placeholder="••••••••"
            autocomplete="current-password"
            required
            class="w-full"
          />
        </UFormField>

        <UButton
          type="submit"
          color="primary"
          class="w-full justify-center"
          :loading="loading"
        >
          Sign in
        </UButton>
      </form>

      <!-- Divider -->
      <div class="flex items-center gap-3">
        <div class="flex-1 h-px bg-muted" />
        <span class="text-xs text-muted">or</span>
        <div class="flex-1 h-px bg-muted" />
      </div>

      <!-- Google OAuth -->
      <UButton
        variant="outline"
        color="neutral"
        class="w-full justify-center gap-2"
        :loading="loading"
        @click="handleGoogle"
      >
        <UIcon name="i-simple-icons-google" class="w-4 h-4" />
        Sign in with Google
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const authStore = useAuthStore()
const authApi = useAuthApi()
const router = useRouter()

async function handleLogin() {
  if (!email.value || !password.value) return
  loading.value = true
  error.value = null
  try {
    const res = await authApi.login(email.value, password.value)
    authStore.setSession(res.user, res.token)
    router.push('/dashboard')
  }
  catch (err: any) {
    const status = err?.response?.status
    if (status === 401) {
      error.value = 'Invalid email or password.'
    }
    else {
      error.value = 'Something went wrong. Please try again.'
    }
  }
  finally {
    loading.value = false
  }
}

async function handleGoogle() {
  loading.value = true
  error.value = null
  try {
    const res = await authApi.loginWithGoogle()
    authStore.setSession(res.user, res.token)
    router.push('/dashboard')
  }
  catch (err: any) {
    const status = err?.response?.status
    if (status === 501) {
      error.value = 'Google login is not yet available.'
    }
    else {
      error.value = 'Something went wrong. Please try again.'
    }
  }
  finally {
    loading.value = false
  }
}
</script>
