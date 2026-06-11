<script setup lang="ts">
// Delta pill ported from the design handoff (project/lib/ui.jsx).
import { fmtSigned, fmtPct } from '~/utils/format'

const props = withDefaults(defineProps<{
  pct: number
  value?: number | null
  pill?: boolean
  showArrow?: boolean
}>(), {
  pill: false,
  showArrow: true,
})

const up = computed(() => props.pct >= 0)
const text = computed(() =>
  (props.value != null ? fmtSigned(props.value) + '  ' : '') + fmtPct(props.pct),
)
</script>

<template>
  <span class="delta" :class="[up ? 'up' : 'down', { pill }]">
    <span v-if="showArrow" class="delta-tri" :data-up="up" />
    {{ text }}
  </span>
</template>
