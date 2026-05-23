<template>
  <div
    class="flex flex-col h-full bg-default border-r border-default transition-all duration-200 shrink-0"
    :class="collapsed ? 'w-12' : 'w-52'"
  >
    <!-- Header -->
    <div class="flex items-center h-10 px-2 border-b border-default" :class="collapsed ? 'justify-center' : 'justify-between'">
      <span v-if="!collapsed" class="text-xs font-semibold text-muted uppercase tracking-wider pl-1">Watchlist</span>
      <UButton
        variant="ghost"
        color="neutral"
        :icon="collapsed ? 'i-lucide-chevrons-right' : 'i-lucide-chevrons-left'"
        size="xs"
        @click="collapsed = !collapsed"
      />
    </div>

    <!-- List -->
    <div class="flex-1 overflow-y-auto py-1">
      <WatchlistItem
        v-for="stock in watchlistStore.watchlist"
        :key="stock.sym"
        :stock="stock"
        :collapsed="collapsed"
        :focused="watchlistStore.focusedSym === stock.sym"
        @click="watchlistStore.setFocused(stock.sym)"
      />
    </div>

    <!-- Add stock button -->
    <div class="p-2 border-t border-default">
      <button
        class="w-full flex items-center justify-center gap-2 rounded-md border border-dashed border-default text-muted hover:text-primary hover:border-primary transition-colors py-2 text-xs"
        @click="searchOpen = true"
      >
        <UIcon name="i-lucide-plus" class="w-4 h-4" />
        <span v-if="!collapsed">Add stock</span>
      </button>
    </div>

    <StockSearchModal v-if="searchOpen" v-model:open="searchOpen" />
  </div>
</template>

<script setup lang="ts">
const collapsed = ref(true)
const searchOpen = ref(false)
const watchlistStore = useWatchlistStore()
</script>
