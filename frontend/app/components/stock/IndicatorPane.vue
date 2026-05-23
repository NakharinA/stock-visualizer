<template>
  <div class="flex flex-col h-full bg-[#0d1117]">
    <!-- Tabs bar -->
    <div class="flex items-center gap-1 px-2 h-8 bg-[#161b22] border-b border-[#30363d] shrink-0">
      <button
        v-for="id in indicatorStore.paneIndicators"
        :key="id"
        class="flex items-center gap-1.5 px-3 py-1 rounded-t text-xs transition-colors"
        :class="indicatorStore.activeTab === id
          ? 'bg-[#0d1117] text-[#e6edf3] border-t border-x border-[#30363d]'
          : 'text-[#8b949e] hover:text-[#e6edf3]'"
        @click="indicatorStore.setActiveTab(id)"
      >
        {{ labelFor(id) }}
        <span
          class="ml-0.5 text-[#8b949e] hover:text-[#f85149]"
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
