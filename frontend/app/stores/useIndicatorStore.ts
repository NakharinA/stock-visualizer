import { defineStore } from 'pinia'

export type OverlayIndicatorId = 'EMA20' | 'EMA50' | 'BB' | 'VOLUME'
export type PaneIndicatorId = 'RSI' | 'MACD' | 'STOCH' | 'CCI'

export const OVERLAY_INDICATORS: { id: OverlayIndicatorId; label: string }[] = [
  { id: 'EMA20', label: 'EMA 20' },
  { id: 'EMA50', label: 'EMA 50' },
  { id: 'BB', label: 'Bollinger Bands' },
  { id: 'VOLUME', label: 'Volume' },
]

export const PANE_INDICATORS: { id: PaneIndicatorId; label: string }[] = [
  { id: 'RSI', label: 'RSI' },
  { id: 'MACD', label: 'MACD' },
  { id: 'STOCH', label: 'Stochastic' },
  { id: 'CCI', label: 'CCI' },
]

export const useIndicatorStore = defineStore('indicators', () => {
  const overlayIndicators = ref<Set<OverlayIndicatorId>>(new Set())
  const paneIndicators = ref<PaneIndicatorId[]>([])
  const activeTab = ref<PaneIndicatorId | null>(null)

  function toggle(id: OverlayIndicatorId | PaneIndicatorId, type: 'overlay' | 'pane') {
    if (type === 'overlay') {
      const oid = id as OverlayIndicatorId
      if (overlayIndicators.value.has(oid)) {
        overlayIndicators.value.delete(oid)
      } else {
        overlayIndicators.value.add(oid)
      }
    } else {
      const pid = id as PaneIndicatorId
      if (paneIndicators.value.includes(pid)) {
        removePane(pid)
      } else {
        paneIndicators.value.push(pid)
        activeTab.value = pid
      }
    }
  }

  function removePane(id: PaneIndicatorId) {
    paneIndicators.value = paneIndicators.value.filter(p => p !== id)
    if (activeTab.value === id) {
      activeTab.value = paneIndicators.value[paneIndicators.value.length - 1] ?? null
    }
  }

  function setActiveTab(id: PaneIndicatorId) {
    activeTab.value = id
  }

  return { overlayIndicators, paneIndicators, activeTab, toggle, removePane, setActiveTab }
})
