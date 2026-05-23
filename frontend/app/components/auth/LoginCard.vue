<template>
  <div class="w-full max-w-sm">
    <div class="bg-[#161b22] border border-[#30363d] rounded-xl p-8 space-y-6 shadow-2xl">
      <!-- Logo / title -->
      <div class="text-center space-y-1">
        <div class="flex justify-center mb-3">
          <div class="w-10 h-10 rounded-lg bg-[#58a6ff] flex items-center justify-center">
            <UIcon name="i-lucide-candlestick-chart" class="w-6 h-6 text-white" />
          </div>
        </div>
        <h1 class="text-xl font-semibold text-[#e6edf3]">StockViz</h1>
        <p class="text-sm text-[#8b949e]">Sign in to your account</p>
      </div>

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
        <div class="flex-1 h-px bg-[#30363d]" />
        <span class="text-xs text-[#8b949e]">or</span>
        <div class="flex-1 h-px bg-[#30363d]" />
      </div>

      <!-- Google OAuth -->
      <UButton
        variant="outline"
        color="neutral"
        class="w-full justify-center gap-2"
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

const authStore = useAuthStore()
const router = useRouter()

async function handleLogin() {
  if (!email.value || !password.value) return
  loading.value = true
  await new Promise(r => setTimeout(r, 400))
  authStore.login(email.value, password.value)
  loading.value = false
  router.push('/dashboard')
}

async function handleGoogle() {
  loading.value = true
  await new Promise(r => setTimeout(r, 400))
  authStore.login('demo@example.com', '')
  loading.value = false
  router.push('/dashboard')
}
</script>
