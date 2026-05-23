<template>
  <div class="flex flex-col h-full bg-default">
    <!-- Tabs bar -->
    <div class="flex items-center gap-1 px-2 h-8 bg-elevated border-b border-default shrink-0">
      <button
        v-for="id in indicatorStore.paneIndicators"
        :key="id"
        class="flex items-center gap-1.5 px-3 py-1 rounded-t text-xs transition-colors"
        :class="indicatorStore.activeTab === id
          ? 'bg-default text-highlighted border-t border-x border-default'
          : 'text-muted hover:text-highlighted'"
        @click="indicatorStore.setActiveTab(id)"
      >
        {{ labelFor(id) }}
        <span
          class="ml-0.5 text-muted hover:text-error"
          @click.stop="indicatorStore.removePane(id)"
        >✕</span>
      </button>
    </div>

    <!-- Chart panes -->
    <div class="flex-1 relative">
      <div
        v-for="id in indicatorStore.paneIndicators"
        :key="id"
        class="absolute inset-0"
        :class="indicatorStore.activeTab === id ? 'block' : 'hidden'"
      >
        <PaneChart :indicator-id="id" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PANE_INDICATORS, type PaneIndicatorId } from '~/stores/useIndicatorStore'

const indicatorStore = useIndicatorStore()

function labelFor(id: PaneIndicatorId) {
  return PANE_INDICATORS.find(p => p.id === id)?.label ?? id
}
</script>
