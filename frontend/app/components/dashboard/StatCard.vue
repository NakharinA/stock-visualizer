<template>
  <UCard class="bg-[#161b22] border-[#30363d] h-full">
    <div class="space-y-1">
      <p class="text-xs text-[#8b949e]">{{ label }}</p>
      <p class="text-xl font-semibold" :class="positive === true ? 'text-[#3fb950]' : positive === false ? 'text-[#f85149]' : 'text-[#e6edf3]'">
        {{ value }}
      </p>
      <p v-if="sub" class="text-xs" :class="positive === true ? 'text-[#3fb950]' : positive === false ? 'text-[#f85149]' : 'text-[#8b949e]'">
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
