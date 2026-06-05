<script setup lang="ts">
import type { IndicatorState } from '~/composables/useIndicatorState'

const props = defineProps<{
  modelValue: IndicatorState
}>()

const emit = defineEmits<{
  'update:modelValue': [value: IndicatorState]
}>()

function set(key: keyof IndicatorState, val: unknown) {
  emit('update:modelValue', { ...props.modelValue, [key]: Boolean(val) })
}
</script>

<template>
  <div class="rounded-lg border border-gray-700 bg-[#0f1117] px-5 py-4 flex flex-wrap gap-6">
    <!-- EMA Lines -->
    <div class="flex flex-col gap-2">
      <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">EMA Lines</p>
      <div class="grid grid-cols-2 gap-x-6 gap-y-2">
        <UCheckbox
          label="EMA 20"
          :model-value="modelValue.ema20"
          @update:model-value="set('ema20', $event)"
        />
        <UCheckbox
          label="EMA 50"
          :model-value="modelValue.ema50"
          @update:model-value="set('ema50', $event)"
        />
        <UCheckbox
          label="EMA 100"
          :model-value="modelValue.ema100"
          @update:model-value="set('ema100', $event)"
        />
        <UCheckbox
          label="EMA 200"
          :model-value="modelValue.ema200"
          @update:model-value="set('ema200', $event)"
        />
      </div>
    </div>

    <!-- Chart Overlays -->
    <div class="flex flex-col gap-2">
      <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">Chart Overlays</p>
      <div class="flex flex-col gap-2">
        <UCheckbox
          label="Fibonacci"
          :model-value="modelValue.fibonacci"
          @update:model-value="set('fibonacci', $event)"
        />
        <UCheckbox
          label="Support / Resistance"
          :model-value="modelValue.supportResistance"
          @update:model-value="set('supportResistance', $event)"
        />
        <UCheckbox
          label="Fair Value Gaps"
          :model-value="modelValue.fvg"
          @update:model-value="set('fvg', $event)"
        />
      </div>
    </div>

    <!-- Subpanel Indicators -->
    <div class="flex flex-col gap-2">
      <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">Subpanel Indicators</p>
      <div class="flex gap-6">
        <UCheckbox
          label="MACD"
          :model-value="modelValue.macd"
          @update:model-value="set('macd', $event)"
        />
        <UCheckbox
          label="RSI"
          :model-value="modelValue.rsi"
          @update:model-value="set('rsi', $event)"
        />
        <UCheckbox
          label="Stoch RSI"
          :model-value="modelValue.stochRsi"
          @update:model-value="set('stochRsi', $event)"
        />
      </div>
    </div>
  </div>
</template>
