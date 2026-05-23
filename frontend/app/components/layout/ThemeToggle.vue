<template>
  <UButton
    variant="ghost"
    color="neutral"
    :icon="isDark ? 'i-lucide-sun' : 'i-lucide-moon'"
    size="sm"
    :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    :class="collapsed ? 'w-full justify-center' : 'w-full justify-start px-2'"
    @click="toggleTheme"
  >
    <span v-if="!collapsed" class="text-sm text-[#8b949e]">{{ isDark ? 'Light mode' : 'Dark mode' }}</span>
  </UButton>
</template>

<script setup lang="ts">
defineProps<{ collapsed: boolean }>()

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

function toggleTheme() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}
</script>
