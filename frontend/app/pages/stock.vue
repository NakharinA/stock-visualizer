<template>
  <div class="flex h-full overflow-hidden">
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
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const indicatorStore = useIndicatorStore()
const paneHeight = ref(160)
const indicatorOpen = ref(false)
</script>
