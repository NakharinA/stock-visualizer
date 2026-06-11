<script setup lang="ts">
import type { SearchResult } from '~/types/api'

// Global topbar symbol search (design handoff app.jsx Search), backed by /api/search.
const { searchSymbols } = useStockApi()

const q = ref('')
const open = ref(false)
const hi = ref(0)
const matches = ref<SearchResult[]>([])
const root = ref<HTMLElement>()
let debounce: ReturnType<typeof setTimeout>

function runSearch() {
  clearTimeout(debounce)
  const t = q.value.trim()
  hi.value = 0
  if (!t) {
    matches.value = []
    return
  }
  debounce = setTimeout(async () => {
    try {
      matches.value = await searchSymbols(t)
    } catch {
      matches.value = []
    }
  }, 250)
}

function go(sym: string) {
  open.value = false
  q.value = ''
  matches.value = []
  navigateTo(`/stock/${sym.toUpperCase()}`)
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    hi.value = Math.min(hi.value + 1, matches.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    hi.value = Math.max(hi.value - 1, 0)
  } else if (e.key === 'Enter') {
    const t = q.value.trim().toUpperCase()
    if (matches.value[hi.value]) go(matches.value[hi.value].symbol)
    else if (/^[A-Z.]{1,6}$/.test(t)) go(t)
  } else if (e.key === 'Escape') {
    open.value = false
  }
}

function onDocClick(e: MouseEvent) {
  if (root.value && !root.value.contains(e.target as Node)) open.value = false
}

onMounted(() => document.addEventListener('mousedown', onDocClick))
onUnmounted(() => document.removeEventListener('mousedown', onDocClick))
</script>

<template>
  <div ref="root" class="search">
    <div class="search-box" :class="{ open }">
      <UiAppIcon name="search" :size="16" />
      <input
        v-model="q"
        class="search-input"
        placeholder="Search symbol or company…"
        @input="open = true; runSearch()"
        @focus="open = true"
        @keydown="onKey"
      >
      <kbd class="kbd">↵</kbd>
    </div>

    <div v-if="open && matches.length" class="search-drop">
      <button
        v-for="(m, i) in matches"
        :key="m.symbol"
        class="sr-item"
        :class="{ hi: i === hi }"
        @mouseenter="hi = i"
        @click="go(m.symbol)"
      >
        <span class="sr-sym">{{ m.symbol }}</span>
        <span class="sr-name">{{ m.name }}</span>
      </button>
    </div>
  </div>
</template>
