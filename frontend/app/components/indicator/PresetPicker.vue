<script setup lang="ts">
import { INDICATOR_DEFS } from '~/utils/indicatorDefs'

const iStore = useIndicatorStore()
const errorMsg = ref('')

async function onSelect(def: typeof INDICATOR_DEFS[number]) {
  errorMsg.value = ''
  try {
    await iStore.addIndicator({
      type: def.type,
      params: { ...def.defaultParams },
      pane: def.pane,
      color: def.color,
    })
  } catch (e: unknown) {
    const err = e as { data?: { detail?: string }; message?: string }
    errorMsg.value = err?.data?.detail || err?.message || 'Failed to compute indicator'
  }
}
</script>

<template>
  <div class="preset-picker">
    <Message v-if="errorMsg" severity="error" :closable="true" class="mb-2" @close="errorMsg = ''">
      {{ errorMsg }}
    </Message>
    <ul class="indicator-list">
      <li
        v-for="def in INDICATOR_DEFS"
        :key="def.type"
        class="indicator-row"
        @click="onSelect(def)"
      >
        <span class="indicator-dot" :style="{ background: def.color }" />
        <span class="indicator-label">{{ def.label }}</span>
        <span class="indicator-pane-badge">{{ def.pane }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.preset-picker {
  padding: 0.25rem 0;
}
.indicator-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.indicator-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.15s;
}
.indicator-row:hover {
  background: var(--color-border);
}
.indicator-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.indicator-label {
  flex: 1;
  color: var(--color-text);
  font-size: 0.9rem;
}
.indicator-pane-badge {
  font-size: 0.7rem;
  padding: 1px 5px;
  border-radius: 3px;
  background: var(--color-border);
  color: var(--color-muted);
  text-transform: uppercase;
}
</style>
