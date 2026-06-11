<script setup lang="ts">
// SVG sparkline ported from the design handoff (project/lib/ui.jsx).
const props = withDefaults(defineProps<{
  values: number[]
  width?: number
  height?: number
  fill?: boolean
  color?: string
  weight?: number
}>(), {
  width: 96,
  height: 28,
  fill: true,
  weight: 1.6,
})

const PAD = 2

const geom = computed(() => {
  const vals = props.values || []
  if (vals.length < 2) return null
  let lo = Infinity, hi = -Infinity
  for (const v of vals) { if (v < lo) lo = v; if (v > hi) hi = v }
  const rng = hi - lo || 1
  const stepX = (props.width - PAD * 2) / (vals.length - 1)
  const pts = vals.map((v, i) => {
    const x = PAD + i * stepX
    const y = PAD + (props.height - PAD * 2) * (1 - (v - lo) / rng)
    return [x, y] as const
  })
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ')
  const last = pts[pts.length - 1]
  const first = pts[0]
  const area = `${line} L${last[0].toFixed(1)} ${props.height - PAD} L${first[0].toFixed(1)} ${props.height - PAD} Z`
  const up = vals[vals.length - 1] >= vals[0]
  const color = props.color || (up ? 'var(--up)' : 'var(--down)')
  const id = 'sg' + Math.round(first[1]) + vals.length + Math.round(hi)
  return { line, area, color, id }
})
</script>

<template>
  <svg v-if="!geom" :width="width" :height="height" />
  <svg v-else :width="width" :height="height" style="display: block; overflow: visible;">
    <defs>
      <linearGradient :id="geom.id" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="geom.color" stop-opacity="0.22" />
        <stop offset="1" :stop-color="geom.color" stop-opacity="0" />
      </linearGradient>
    </defs>
    <path v-if="fill" :d="geom.area" :fill="`url(#${geom.id})`" stroke="none" />
    <path :d="geom.line" fill="none" :stroke="geom.color" :stroke-width="weight" stroke-linejoin="round" stroke-linecap="round" />
  </svg>
</template>
