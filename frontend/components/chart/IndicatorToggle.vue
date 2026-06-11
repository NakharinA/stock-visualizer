<script setup lang="ts">
import type { IndicatorState } from '~/composables/useIndicatorState'

const props = defineProps<{ modelValue: IndicatorState }>()
const emit = defineEmits<{ 'update:modelValue': [value: IndicatorState] }>()

type Item = { key: keyof IndicatorState, label: string, color: string }

const overlays: Item[] = [
  { key: 'ema20', label: 'EMA 20', color: '#f5a623' },
  { key: 'ema50', label: 'EMA 50', color: '#4da6ff' },
  { key: 'ema100', label: 'EMA 100', color: '#c678dd' },
  { key: 'ema200', label: 'EMA 200', color: '#d7dae0' },
  { key: 'fibonacci', label: 'Fibonacci', color: '#ff7a18' },
  { key: 'supportResistance', label: 'Support / Resistance', color: '#9aa0ac' },
  { key: 'fvg', label: 'Fair Value Gap', color: '#2ebd85' },
]
const oscillators: Item[] = [
  { key: 'macd', label: 'MACD', color: '#4da6ff' },
  { key: 'rsi', label: 'RSI', color: '#c678dd' },
  { key: 'stochRsi', label: 'Stoch RSI', color: '#ff9e64' },
]

function toggle(key: keyof IndicatorState) {
  emit('update:modelValue', { ...props.modelValue, [key]: !props.modelValue[key] })
}
</script>

<template>
  <div class="ind-rail">
    <div class="rail-grp">
      <div class="rail-h">Overlays</div>
      <button
        v-for="it in overlays"
        :key="it.key"
        class="tog"
        :class="{ on: modelValue[it.key] }"
        :aria-pressed="modelValue[it.key]"
        @click="toggle(it.key)"
      >
        <span class="tog-dot" :style="{ background: modelValue[it.key] ? it.color : 'transparent', borderColor: it.color }" />
        <span class="tog-lbl">{{ it.label }}</span>
        <span class="tog-sw" :data-on="modelValue[it.key]" />
      </button>
    </div>

    <div class="rail-grp">
      <div class="rail-h">Oscillators</div>
      <button
        v-for="it in oscillators"
        :key="it.key"
        class="tog"
        :class="{ on: modelValue[it.key] }"
        :aria-pressed="modelValue[it.key]"
        @click="toggle(it.key)"
      >
        <span class="tog-dot" :style="{ background: modelValue[it.key] ? it.color : 'transparent', borderColor: it.color }" />
        <span class="tog-lbl">{{ it.label }}</span>
        <span class="tog-sw" :data-on="modelValue[it.key]" />
      </button>
    </div>

    <div class="rail-note">Scroll to zoom · pan locked</div>
  </div>
</template>
