<template>
  <div class="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
    <AuthLoginCard />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const authStore = useAuthStore()
const router = useRouter()
if (authStore.isAuthenticated) {
  await navigateTo('/dashboard')
}
</script>
