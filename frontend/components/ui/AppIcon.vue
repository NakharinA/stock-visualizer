<script setup lang="ts">
// Inline line-icon set ported from the design handoff (project/lib/ui.jsx).
const props = withDefaults(defineProps<{
  name: string
  size?: number
  weight?: number
}>(), {
  size: 18,
  weight: 1.7,
})

const PATHS: Record<string, string> = {
  dashboard: 'M3 3h7v7H3zM14 3h7v4h-7zM14 11h7v10h-7zM3 14h7v7H3z',
  chart: 'M3 3v18h18 M7 14l3-4 3 3 4-6',
  table: 'M3 5h18M3 12h18M3 19h18',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-3.5-3.5',
  plus: 'M12 5v14M5 12h14',
  x: 'M6 6l12 12M18 6L6 18',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  chevron: 'M9 6l6 6-6 6',
  star: 'M12 3l2.7 5.8 6.3.8-4.6 4.4 1.2 6.2L12 17.8 6.4 20.2l1.2-6.2L3 9.6l6.3-.8z',
  arrowUp: 'M12 19V5M6 11l6-6 6 6',
  bolt: 'M13 2L4 14h7l-1 8 9-12h-7z',
  layers: 'M12 3l9 5-9 5-9-5zM3 13l9 5 9-5',
}

const path = computed(() => PATHS[props.name] ?? '')
const filled = computed(() => props.name === 'star')
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    :fill="filled ? 'currentColor' : 'none'"
    stroke="currentColor"
    :stroke-width="weight"
    stroke-linecap="round"
    stroke-linejoin="round"
    style="display: block; flex: none;"
  >
    <path :d="path" />
  </svg>
</template>
