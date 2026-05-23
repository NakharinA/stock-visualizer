<template>
  <div class="flex flex-col h-full overflow-hidden">
    <!-- Page Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-[#30363d] shrink-0">
      <div>
        <h1 class="text-base font-semibold text-[#e6edf3] leading-tight">
          {{ watchlistStore.focusedSym || 'Chart' }}
        </h1>
        <p class="text-xs text-[#8b949e]">Live Chart</p>
      </div>
    </div>

    <!-- Content -->
    <div class="flex flex-1 overflow-hidden">
    <!-- Left: Watchlist Panel -->
    <WatchlistPanel />

    <!-- Right: Chart Area -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <ChartToolbar @open-indicators="indicatorOpen = true" />
      <IndicatorModal v-model:open="indicatorOpen" />

      <!-- Main chart + resize + indicator pane -->
      <div class="flex-1 flex flex-col overflow-hidden relative">
        <div class="flex-1 overflow-hidden" :style="{ minHeight: 0 }">
          <MainChart />
        </div>

        <template v-if="indicatorStore.paneIndicators.length > 0">
          <ResizeHandle v-model:height="paneHeight" />
          <div :style="{ height: `${paneHeight}px`, minHeight: '60px', maxHeight: '260px' }" class="overflow-hidden">
            <IndicatorPane />
          </div>
        </template>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const watchlistStore = useWatchlistStore()
const indicatorStore = useIndicatorStore()
const paneHeight = ref(160)
const indicatorOpen = ref(false)
</script>
