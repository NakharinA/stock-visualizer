<script setup lang="ts">
import type { OverviewItem } from '~/types/api'
import { fmtPrice, fmtSigned, fmtCompact } from '~/utils/format'

const props = defineProps<{
  data: OverviewItem[]
  loading: boolean
}>()

const emit = defineEmits<{
  remove: [symbol: string]
  'row-click': [symbol: string]
}>()

type SortKey = 'symbol' | 'price' | 'diff_value' | 'diff_pct' | 'volume'
const sort = ref<{ key: SortKey, dir: 1 | -1 }>({ key: 'symbol', dir: 1 })

function toggleSort(key: SortKey) {
  if (sort.value.key === key) sort.value = { key, dir: (sort.value.dir * -1) as 1 | -1 }
  else sort.value = { key, dir: 1 }
}

const rows = computed(() => {
  const { key, dir } = sort.value
  return [...props.data].sort((a, b) => {
    const av = a[key], bv = b[key]
    if (typeof av === 'string' && typeof bv === 'string') return av.localeCompare(bv) * dir
    return ((av as number) - (bv as number)) * dir
  })
})

const headers: { key: SortKey, label: string, align: 'l' | 'r' }[] = [
  { key: 'symbol', label: 'Symbol', align: 'l' },
  { key: 'price', label: 'Last', align: 'r' },
  { key: 'diff_value', label: 'Chg', align: 'r' },
  { key: 'diff_pct', label: 'Chg %', align: 'r' },
  { key: 'volume', label: 'Volume', align: 'r' },
]
</script>

<template>
  <!-- Loading skeleton (matches polish-phase loading test) -->
  <div v-if="loading && data.length === 0" class="flex flex-col gap-2">
    <USkeleton v-for="i in 8" :key="i" class="h-10 w-full rounded-lg" />
  </div>

  <div v-else class="tbl-wrap">
    <table class="tbl">
      <thead>
        <tr>
          <th
            class="th l"
            :class="{ sorted: sort.key === 'symbol' }"
            @click="toggleSort('symbol')"
          >
            Symbol<span class="caret" :data-dir="sort.key === 'symbol' ? sort.dir : 0" />
          </th>
          <th class="th l hide-sm">Name</th>
          <th
            v-for="h in headers.slice(1, 4)"
            :key="h.key"
            class="th r"
            :class="{ sorted: sort.key === h.key }"
            @click="toggleSort(h.key)"
          >
            {{ h.label }}<span class="caret" :data-dir="sort.key === h.key ? sort.dir : 0" />
          </th>
          <th class="th r hide-sm">30D</th>
          <th
            class="th r hide-sm"
            :class="{ sorted: sort.key === 'volume' }"
            @click="toggleSort('volume')"
          >
            Volume<span class="caret" :data-dir="sort.key === 'volume' ? sort.dir : 0" />
          </th>
          <th class="th" />
        </tr>
      </thead>
      <tbody>
        <tr v-if="rows.length === 0">
          <td colspan="8" class="empty">Watchlist empty — add a symbol above.</td>
        </tr>
        <tr
          v-for="r in rows"
          v-else
          :key="r.symbol"
          role="button"
          class="trow"
          @click="emit('row-click', r.symbol)"
        >
          <td class="l"><span class="td-sym">{{ r.symbol }}</span></td>
          <td class="l hide-sm td-name">{{ r.name }}</td>
          <td class="r mono">{{ fmtPrice(r.price) }}</td>
          <td class="r mono" :class="r.diff_value >= 0 ? 'up' : 'down'">{{ fmtSigned(r.diff_value) }}</td>
          <td class="r"><UiDelta :pct="r.diff_pct" pill /></td>
          <td class="r hide-sm"><UiSparkline :values="r.spark" :width="80" :height="24" :fill="false" /></td>
          <td class="r mono dim hide-sm">{{ fmtCompact(r.volume) }}</td>
          <td class="r">
            <button
              class="rm-btn"
              aria-label="Remove"
              title="Remove"
              @click.stop="emit('remove', r.symbol)"
            >
              <UiAppIcon name="x" :size="15" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
