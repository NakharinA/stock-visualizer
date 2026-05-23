<template>
  <UCard class="h-full">
    <div class="space-y-1">
      <p class="text-xs text-muted">{{ label }}</p>
      <p class="text-xl font-semibold" :class="positive === true ? 'text-[#3fb950]' : positive === false ? 'text-[#f85149]' : 'text-highlighted'">
        {{ value }}
      </p>
      <p v-if="sub" class="text-xs" :class="positive === true ? 'text-[#3fb950]' : positive === false ? 'text-[#f85149]' : 'text-muted'">
        {{ sub }}
      </p>
    </div>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value: string
  sub?: string
  positive?: boolean
}>()
</script>
