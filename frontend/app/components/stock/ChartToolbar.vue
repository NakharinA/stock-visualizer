<template>
  <div class="flex items-center gap-3 h-10 px-4 bg-elevated border-b border-default shrink-0">
    <!-- Ticker badge -->
    <div class="flex items-center gap-2">
      <span class="text-xs font-bold text-white bg-[#58a6ff] px-2 py-0.5 rounded">
        {{ focusedStock?.sym ?? '—' }}
      </span>
      <span class="text-sm font-semibold text-highlighted">
        ${{ focusedStock?.price.toFixed(2) ?? '—' }}
      </span>
      <span
        v-if="focusedStock"
        class="text-xs"
        :class="focusedStock.change >= 0 ? 'text-[#3fb950]' : 'text-[#f85149]'"
      >
        {{ focusedStock.change >= 0 ? '+' : '' }}{{ focusedStock.change.toFixed(2) }}
        ({{ focusedStock.changePct >= 0 ? '+' : '' }}{{ focusedStock.changePct.toFixed(2) }}%)
      </span>
    </div>

    <div class="flex-1" />

    <!-- Timeframe selector -->
    <div class="flex items-center gap-1">
      <button
        v-for="tf in timeframes"
        :key="tf"
        class="px-2 py-0.5 rounded text-xs transition-colors"
        :class="chartStore.timeframe === tf
          ? 'bg-primary text-white'
          : 'text-muted hover:text-highlighted hover:bg-muted'"
        @click="chartStore.setTimeframe(tf)"
      >
        {{ tf }}
      </button>
    </div>

    <!-- Indicators button -->
    <UButton
      variant="outline"
      color="neutral"
      size="xs"
      icon="i-lucide-sliders-horizontal"
      @click="$emit('openIndicators')"
    >
      Indicators
    </UButton>
  </div>
</template>

<script setup lang="ts">
import type { Timeframe } from '~/stores/useChartStore'

defineEmits<{ openIndicators: [] }>()

const watchlistStore = useWatchlistStore()
const chartStore = useChartStore()
const focusedStock = computed(() => watchlistStore.focusedStock)

const timeframes: Timeframe[] = ['1D', '1W', '1M', '3M', '1Y']
</script>
