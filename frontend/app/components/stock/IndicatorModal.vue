<template>
  <UModal v-model:open="open" title="Indicators" :ui="{ content: 'bg-elevated border border-default max-w-md' }">
    <template #body>
      <div class="space-y-5">
        <UInput v-model="query" placeholder="Search indicators…" icon="i-lucide-search" />

        <!-- Overlay section -->
        <div>
          <p class="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Overlay</p>
          <div class="space-y-1">
            <button
              v-for="ind in filteredOverlay"
              :key="ind.id"
              class="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-left"
              @click="indicatorStore.toggle(ind.id, 'overlay')"
            >
              <div
                class="w-4 h-4 rounded border flex items-center justify-center shrink-0"
                :class="indicatorStore.overlayIndicators.has(ind.id)
                  ? 'bg-primary border-primary'
                  : 'border-default'"
              >
                <UIcon v-if="indicatorStore.overlayIndicators.has(ind.id)" name="i-lucide-check" class="w-3 h-3 text-white" />
              </div>
              <span class="text-sm text-highlighted">{{ ind.label }}</span>
            </button>
          </div>
        </div>

        <!-- Separate Pane section -->
        <div>
          <p class="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Separate Pane</p>
          <div class="space-y-1">
            <button
              v-for="ind in filteredPane"
              :key="ind.id"
              class="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors text-left"
              @click="indicatorStore.toggle(ind.id, 'pane')"
            >
              <div
                class="w-4 h-4 rounded border flex items-center justify-center shrink-0"
                :class="indicatorStore.paneIndicators.includes(ind.id)
                  ? 'bg-primary border-primary'
                  : 'border-default'"
              >
                <UIcon v-if="indicatorStore.paneIndicators.includes(ind.id)" name="i-lucide-check" class="w-3 h-3 text-white" />
              </div>
              <span class="text-sm text-highlighted">{{ ind.label }}</span>
            </button>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { OVERLAY_INDICATORS, PANE_INDICATORS } from '~/stores/useIndicatorStore'

const open = defineModel<boolean>('open', { default: false })
const query = ref('')
const indicatorStore = useIndicatorStore()

const filteredOverlay = computed(() => {
  if (!query.value) return OVERLAY_INDICATORS
  const q = query.value.toLowerCase()
  return OVERLAY_INDICATORS.filter(i => i.label.toLowerCase().includes(q))
})

const filteredPane = computed(() => {
  if (!query.value) return PANE_INDICATORS
  const q = query.value.toLowerCase()
  return PANE_INDICATORS.filter(i => i.label.toLowerCase().includes(q))
})
</script>
