<template>
  <button
    class="w-full flex items-center gap-2 px-2 py-2 border-l-2 transition-colors text-left hover:bg-[#21262d]"
    :class="focused
      ? 'border-[#58a6ff] bg-[#21262d]'
      : 'border-transparent'"
    @click="$emit('click')"
  >
    <!-- Initials badge -->
    <div class="w-7 h-7 rounded shrink-0 flex items-center justify-center text-[10px] font-bold text-white bg-[#58a6ff] bg-opacity-20 border border-[#58a6ff] border-opacity-30">
      {{ stock.sym.slice(0, 2) }}
    </div>

    <template v-if="!collapsed">
      <div class="flex-1 min-w-0">
        <p class="text-xs font-semibold text-[#e6edf3] truncate">{{ stock.sym }}</p>
        <p class="text-[10px] text-[#8b949e] truncate">{{ stock.name }}</p>
      </div>
      <div class="text-right shrink-0">
        <p class="text-xs text-[#e6edf3]">${{ stock.price.toFixed(2) }}</p>
        <p class="text-[10px]" :class="stock.change >= 0 ? 'text-[#3fb950]' : 'text-[#f85149]'">
          {{ stock.change >= 0 ? '+' : '' }}{{ stock.changePct.toFixed(2) }}%
        </p>
      </div>
    </template>
  </button>
</template>

<script setup lang="ts">
import type { WatchlistItem as WatchlistItemType } from '~/stores/useWatchlistStore'

defineProps<{
  stock: WatchlistItemType
  collapsed: boolean
  focused: boolean
}>()
defineEmits<{ click: [] }>()
</script>
