<template>
  <div class="layout-wrapper">
    <header class="layout-topbar">
      <NuxtLink to="/" class="layout-logo">StockViz</NuxtLink>
      <nav class="layout-nav">
        <NuxtLink to="/">Dashboard</NuxtLink>
        <NuxtLink to="/stocks">Stock List</NuxtLink>
      </nav>
    </header>
    <main class="layout-main">
      <slot />
    </main>
  </div>
</template>
