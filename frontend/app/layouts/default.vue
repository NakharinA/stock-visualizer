<template>
  <div class="flex h-screen bg-default overflow-hidden">
    <AppNavbar />
    <main class="flex-1 overflow-auto">
      <slot />
    </main>
  </div>
</template>
