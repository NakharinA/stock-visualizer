<script setup lang="ts">
const navItems = [
  { label: 'Dashboard', to: '/', exact: true },
  { label: 'Stock', to: '/stock', exact: false },
  { label: 'Overview', to: '/overview', exact: false },
]
</script>

<template>
  <div class="flex min-h-screen bg-gray-950 text-gray-100">
    <aside class="w-56 shrink-0 border-r border-gray-800 flex flex-col">
      <div class="px-4 py-5 border-b border-gray-800">
        <span class="text-white font-semibold text-base tracking-tight">StockViz</span>
      </div>
      <nav class="flex-1 p-3 flex flex-col gap-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800/60 transition-colors"
          :exact-active-class="item.exact ? 'text-white bg-gray-800' : ''"
          :active-class="!item.exact ? 'text-white bg-gray-800' : ''"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>
    </aside>

    <main class="flex-1 overflow-auto min-h-screen">
      <slot />
    </main>
  </div>
</template>
