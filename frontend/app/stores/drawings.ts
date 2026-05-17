import { defineStore } from 'pinia'
import type { Drawing, DrawingPoint, DrawingToolType } from '~/types'

export const useDrawingsStore = defineStore('drawings', () => {
  const activeTool = ref<DrawingToolType>('none')
  const drawings = ref<Drawing[]>([])
  const draft = ref<Drawing | null>(null)

  function setTool(tool: DrawingToolType) {
    activeTool.value = tool
    draft.value = null
  }

  function startDraft(point: DrawingPoint) {
    draft.value = {
      id: crypto.randomUUID(),
      tool: activeTool.value,
      points: [point],
      color: '#2962ff',
      opacity: 0.3,
      lineWidth: 1,
    }
  }

  function updateDraft(point: DrawingPoint) {
    if (draft.value) {
      draft.value.points = [draft.value.points[0], point]
    }
  }

  function commitDraft() {
    if (draft.value) {
      drawings.value.push({ ...draft.value, points: [...draft.value.points] })
      draft.value = null
    }
  }

  function removeDrawing(id: string) {
    drawings.value = drawings.value.filter(d => d.id !== id)
  }

  function clearAll() {
    drawings.value = []
    draft.value = null
  }

  return { activeTool, drawings, draft, setTool, startDraft, updateDraft, commitDraft, removeDrawing, clearAll }
})
