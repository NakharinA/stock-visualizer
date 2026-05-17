<script setup lang="ts">
const iStore = useIndicatorStore()
const op = ref()
const count = computed(() => iStore.indicators.length)

function toggle(event: MouseEvent) {
  op.value?.toggle(event)
}
</script>

<template>
  <div>
    <Button
      :label="`Indicators (${count})`"
      icon="pi pi-chart-bar"
      severity="secondary"
      size="small"
      @click="toggle"
    />
    <OverlayPanel ref="op" class="indicator-panel">
      <!-- Active indicators -->
      <div v-if="iStore.indicators.length" class="active-section">
        <p class="section-title">Active</p>
        <div
          v-for="ind in iStore.indicators"
          :key="ind.id"
          class="active-row"
        >
          <span class="ind-dot" :style="{ background: ind.color }" />
          <span class="ind-name">{{ ind.type }}</span>
          <Button
            icon="pi pi-times"
            size="small"
            severity="danger"
            text
            rounded
            @click="iStore.removeIndicator(ind.id)"
          />
        </div>
        <Divider />
      </div>

      <p class="section-title">Add Indicator</p>
      <PresetPicker />
      <Divider />
      <p class="section-title">Custom Formula</p>
      <FormulaEditor />
    </OverlayPanel>
  </div>
</template>

<style scoped>
.indicator-panel {
  min-width: 260px;
  background: var(--color-surface);
}
.section-title {
  font-size: 0.75rem;
  font-weight: bold;
  color: var(--color-muted);
  text-transform: uppercase;
  margin: 0.25rem 0.75rem 0.25rem;
}
.active-section {
  margin-bottom: 0.25rem;
}
.active-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.2rem 0.5rem;
}
.ind-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.ind-name {
  flex: 1;
  font-size: 0.9rem;
}
</style>
