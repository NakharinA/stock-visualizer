<template>
  <nav
    :class="[
      'flex flex-col h-screen bg-[#161b22] border-r border-[#30363d] transition-all duration-200 shrink-0',
      collapsed ? 'w-12' : 'w-48',
    ]"
  >
    <!-- Header / toggle -->
    <div class="flex items-center h-12 px-2 border-b border-[#30363d]" :class="collapsed ? 'justify-center' : 'justify-between'">
      <span v-if="!collapsed" class="text-[#e6edf3] font-semibold text-sm truncate pl-1">StockViz</span>
      <UButton
        variant="ghost"
        color="neutral"
        :icon="collapsed ? 'i-lucide-panel-left-open' : 'i-lucide-panel-left-close'"
        size="sm"
        @click="collapsed = !collapsed"
      />
    </div>

    <!-- Nav items -->
    <div class="flex-1 py-2 space-y-1 px-1">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="flex items-center gap-3 px-2 py-2 rounded-md text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] transition-colors"
        :class="{ '!text-[#58a6ff] bg-[#21262d]': $route.path.startsWith(item.to) }"
        :title="collapsed ? item.label : undefined"
      >
        <UIcon :name="item.icon" class="w-4 h-4 shrink-0" />
        <span v-if="!collapsed" class="text-sm truncate">{{ item.label }}</span>
      </NuxtLink>
    </div>

    <!-- Bottom: theme toggle + user -->
    <div class="border-t border-[#30363d] pb-2 pt-2 px-1 space-y-1">
      <ThemeToggle :collapsed="collapsed" />
      <NavbarUser :collapsed="collapsed" />
    </div>
  </nav>
</template>

<script setup lang="ts">
const collapsed = ref(true)

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'i-lucide-layout-dashboard' },
  { to: '/stock', label: 'Stock', icon: 'i-lucide-candlestick-chart' },
]
</script>
