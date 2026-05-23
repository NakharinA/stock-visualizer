<template>
  <div class="flex items-center gap-2 px-2 py-2 rounded-md" :class="collapsed ? 'justify-center' : ''">
    <UAvatar
      :alt="authStore.user?.name ?? 'U'"
      size="xs"
      class="shrink-0 bg-[#58a6ff] text-white"
    />
    <template v-if="!collapsed">
      <div class="flex-1 min-w-0">
        <p class="text-xs text-[#e6edf3] truncate">{{ authStore.user?.name }}</p>
        <p class="text-xs text-[#8b949e] truncate">{{ authStore.user?.email }}</p>
      </div>
      <UButton
        variant="ghost"
        color="neutral"
        icon="i-lucide-log-out"
        size="xs"
        title="Logout"
        @click="logout"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
defineProps<{ collapsed: boolean }>()

const authStore = useAuthStore()
const router = useRouter()

function logout() {
  authStore.logout()
  router.push('/login')
}
</script>
