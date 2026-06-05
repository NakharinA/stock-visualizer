<script setup lang="ts">
import type { SearchResult } from '~/types/api'

const props = defineProps<{
  symbol: string
  results: SearchResult[]
}>()

const emit = defineEmits<{
  search: [query: string]
  select: [symbol: string]
}>()

const query = ref('')
const focused = ref(false)
let debounceTimer: ReturnType<typeof setTimeout>

const showDropdown = computed(() => focused.value && props.results.length > 0 && query.value.length > 0)

function onInput() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    if (query.value.trim()) emit('search', query.value.trim())
  }, 300)
}

function onFocus() {
  focused.value = true
  if (!query.value) query.value = props.symbol
}

function onBlur() {
  // Delay so click on dropdown item registers first
  setTimeout(() => {
    focused.value = false
    query.value = ''
  }, 150)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    focused.value = false
    query.value = ''
    ;(e.target as HTMLInputElement).blur()
  }
}

function select(result: SearchResult) {
  query.value = ''
  focused.value = false
  emit('select', result.symbol)
}
</script>

<template>
  <div class="relative w-full max-w-sm">
    <UInput
      v-model="query"
      :placeholder="symbol || 'Search symbol...'"
      icon="i-heroicons-magnifying-glass"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
      @keydown="onKeydown"
    />

    <div
      v-if="showDropdown"
      class="absolute top-full left-0 right-0 mt-1 z-50 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden"
    >
      <button
        v-for="result in results"
        :key="result.symbol"
        class="w-full text-left px-4 py-2 hover:bg-gray-800 transition-colors"
        @mousedown.prevent="select(result)"
      >
        <span class="font-semibold text-white">{{ result.symbol }}</span>
        <span class="text-gray-400 ml-2 text-sm">— {{ result.name }}</span>
      </button>
    </div>
  </div>
</template>
