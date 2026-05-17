<script setup lang="ts">
const iStore = useIndicatorStore()
const formula = ref('')
const errorMsg = ref('')

async function applyFormula() {
  if (!formula.value.trim()) return
  errorMsg.value = ''
  try {
    await iStore.addIndicator({
      type: 'CUSTOM',
      params: {},
      formula: formula.value.trim(),
      pane: 'sub',
      color: '#ff8a65',
    })
    formula.value = ''
  } catch (e: unknown) {
    const err = e as { data?: { detail?: string }; message?: string }
    errorMsg.value = err?.data?.detail || err?.message || 'Failed to compute formula'
  }
}
</script>

<template>
  <div class="formula-editor">
    <p class="helper-text">
      Available: <code>open, high, low, close, volume, SMA(col,n), EMA(col,n), STD(col,n)</code>
    </p>
    <Textarea
      v-model="formula"
      :rows="3"
      class="formula-input"
      placeholder="e.g. close - SMA(close, 20)"
    />
    <Button
      label="Apply Formula"
      size="small"
      class="mt-2"
      :disabled="!formula.trim()"
      @click="applyFormula"
    />
    <Message
      v-if="errorMsg"
      severity="error"
      :closable="true"
      class="mt-2"
      @close="errorMsg = ''"
    >
      {{ errorMsg }}
    </Message>
  </div>
</template>

<style scoped>
.formula-editor {
  padding: 0.5rem 0.75rem;
}
.helper-text {
  font-size: 0.75rem;
  color: var(--color-muted);
  margin: 0 0 0.5rem;
}
.helper-text code {
  color: var(--color-text);
}
.formula-input {
  width: 100%;
  font-family: monospace;
  font-size: 0.85rem;
  background: var(--color-bg);
  color: var(--color-text);
}
.mt-2 {
  margin-top: 0.5rem;
}
</style>
