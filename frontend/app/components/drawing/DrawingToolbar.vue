<script setup lang="ts">
import type { DrawingToolType } from '~/types'

const dStore = useDrawingsStore()

const tools: { tool: DrawingToolType; icon: string; title: string }[] = [
  { tool: 'none', icon: 'pi pi-arrow-up-left', title: 'Cursor' },
  { tool: 'trendline', icon: 'pi pi-chart-line', title: 'Trendline' },
  { tool: 'hline', icon: 'pi pi-minus', title: 'Horizontal Line' },
  { tool: 'fvgbox', icon: 'pi pi-stop', title: 'FVG Box' },
  { tool: 'freehand', icon: 'pi pi-pencil', title: 'Freehand' },
]
</script>

<template>
  <div class="drawing-toolbar">
    <button
      v-for="t in tools"
      :key="t.tool"
      :class="['tool-btn', { active: dStore.activeTool === t.tool }]"
      :title="t.title"
      @click="dStore.setTool(t.tool)"
    >
      <i :class="t.icon" />
    </button>
    <hr class="divider" />
    <button class="tool-btn" title="Clear All" @click="dStore.clearAll()">
      <i class="pi pi-trash" />
    </button>
  </div>
</template>

<style scoped>
.drawing-toolbar {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40px;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
  padding: 0.5rem 0;
  gap: 2px;
  flex-shrink: 0;
}
.tool-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--color-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  transition: background 0.15s, color 0.15s;
}
.tool-btn:hover {
  background: var(--color-border);
  color: var(--color-text);
}
.tool-btn.active {
  background: var(--color-accent);
  color: #fff;
}
.divider {
  width: 70%;
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 4px 0;
}
</style>
