<script setup lang="ts">
const route = useRoute()
const symbol = computed(() => route.params.symbol as string | undefined)
</script>

<template>
  <div class="h-full flex flex-col">
    <template v-if="symbol">
      <div class="p-6">
        <h1 class="text-2xl font-semibold text-white mb-2">{{ symbol }}</h1>
        <p class="text-gray-500">Chart for {{ symbol }} — coming in Phase 05.</p>
      </div>
    </template>

    <template v-else>
      <div class="flex-1 flex flex-col items-center justify-center gap-4 p-6">
        <p class="text-gray-400 text-lg">Search for a symbol to get started.</p>
        <input
          type="text"
          placeholder="e.g. AAPL"
          disabled
          class="w-72 px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none cursor-not-allowed"
        />
      </div>
    </template>
  </div>
</template>
