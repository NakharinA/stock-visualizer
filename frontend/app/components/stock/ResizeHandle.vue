<template>
  <div
    class="h-1 bg-[#30363d] hover:bg-[#58a6ff] cursor-ns-resize transition-colors shrink-0"
    @mousedown="startDrag"
  />
</template>

<script setup lang="ts">
const props = defineProps<{ height: number }>()
const emit = defineEmits<{ 'update:height': [value: number] }>()

function startDrag(e: MouseEvent) {
  e.preventDefault()
  const startY = e.clientY
  const startH = props.height

  function onMove(ev: MouseEvent) {
    const delta = startY - ev.clientY
    const next = Math.min(260, Math.max(60, startH + delta))
    emit('update:height', next)
  }

  function onUp() {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }

  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}
</script>
