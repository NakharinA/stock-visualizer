<script setup lang="ts">
const chartStore = useChartStore()

const intervals = ['1m', '5m', '15m', '30m', '1h', '1d', '1wk', '1mo']

const selected = computed({
  get: () => chartStore.interval,
  set: (val: string) => chartStore.setInterval(val),
})
</script>

<template>
  <SelectButton
    v-model="selected"
    :options="intervals"
    :allow-empty="false"
    class="interval-selector"
  />
</template>

<style scoped>
.interval-selector {
  margin-left: 0.5rem;
}
</style>
