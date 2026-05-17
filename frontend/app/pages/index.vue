<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Welcome to StockViz</h1>
      <p class="page-subtitle">Your personal stock analysis dashboard.</p>
    </div>

    <div class="dashboard-grid">
      <Card>
        <template #title>
          <span class="card-icon"><i class="pi pi-list" /></span>
          Stock Watchlist
        </template>
        <template #content>
          <p>Track your favourite stocks in one place.</p>
          <NuxtLink to="/stocks">
            <Button label="View Watchlist" icon="pi pi-arrow-right" iconPos="right" />
          </NuxtLink>
        </template>
      </Card>

      <Card>
        <template #title>
          <span class="card-icon"><i class="pi pi-chart-line" /></span>
          Charts &amp; Indicators
        </template>
        <template #content>
          <p>Analyse price action with RSI, MACD, EMA and more.</p>
          <NuxtLink to="/stocks">
            <Button label="Open a Stock" icon="pi pi-arrow-right" iconPos="right" severity="secondary" />
          </NuxtLink>
        </template>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
  margin-top: 1rem;
}

.card-icon {
  margin-right: 0.5rem;
  color: var(--p-primary-color);
}
</style>
