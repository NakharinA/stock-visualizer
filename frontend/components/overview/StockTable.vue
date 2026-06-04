<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { OverviewItem } from '~/types/api'

defineProps<{
  data: OverviewItem[]
  loading: boolean
}>()

const emit = defineEmits<{
  remove: [symbol: string]
  'row-click': [symbol: string]
}>()

const columns: TableColumn<OverviewItem>[] = [
  { accessorKey: 'symbol', header: 'Symbol' },
  { accessorKey: 'price', header: 'Price' },
  { accessorKey: 'diff_value', header: 'Change' },
  { accessorKey: 'diff_pct', header: 'Change %' },
  { id: 'actions', header: '' },
]

function colorClass(value: number): string {
  if (value > 0) return 'text-green-500'
  if (value < 0) return 'text-red-500'
  return ''
}

function formatSigned(value: number, decimals = 2): string {
  return `${value > 0 ? '+' : ''}${value.toFixed(decimals)}`
}
</script>

<template>
  <!-- Skeleton while loading with no data yet -->
  <div v-if="loading && data.length === 0" class="flex flex-col gap-2">
    <USkeleton v-for="i in 8" :key="i" class="h-10 w-full rounded-lg" />
  </div>

  <UTable
    v-else
    :data="data"
    :columns="columns"
    class="cursor-pointer"
    @select="(row) => emit('row-click', row.original.symbol)"
  >
    <template #price-cell="{ row }">
      ${{ row.original.price.toFixed(2) }}
    </template>

    <template #diff_value-cell="{ row }">
      <span :class="colorClass(row.original.diff_value)">
        {{ formatSigned(row.original.diff_value) }}
      </span>
    </template>

    <template #diff_pct-cell="{ row }">
      <span :class="colorClass(row.original.diff_pct)">
        {{ formatSigned(row.original.diff_pct) }}%
      </span>
    </template>

    <template #actions-cell="{ row }">
      <UButton
        icon="i-heroicons-x-mark"
        size="xs"
        color="neutral"
        variant="ghost"
        aria-label="Remove"
        @click.stop="emit('remove', row.original.symbol)"
      />
    </template>
  </UTable>
</template>
