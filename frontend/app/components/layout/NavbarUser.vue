<template>
  <div class="flex items-center gap-2 px-2 py-2 rounded-md" :class="collapsed ? 'justify-center' : ''">
    <UAvatar
      :alt="authStore.user?.name ?? 'U'"
      size="xs"
      class="shrink-0 bg-[#58a6ff] text-white"
    />
    <template v-if="!collapsed">
      <div class="flex-1 min-w-0">
        <p class="text-xs text-highlighted truncate">{{ authStore.user?.name }}</p>
        <p class="text-xs text-muted truncate">{{ authStore.user?.email }}</p>
      </div>
      <UButton
        variant="ghost"
        color="neutral"
        icon="i-lucide-log-out"
        size="xs"
        title="Logout"
        :loading="loggingOut"
        @click="logout"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
defineProps<{ collapsed: boolean }>()

const authStore = useAuthStore()
const authApi = useAuthApi()
const router = useRouter()
const loggingOut = ref(false)

async function logout() {
  loggingOut.value = true
  if (authStore.token) {
    await authApi.logout(authStore.token)
  }
  authStore.clearSession()
  router.push('/login')
  loggingOut.value = false
}
</script>
