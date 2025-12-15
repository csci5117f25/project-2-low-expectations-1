<template>
  <div class="alternative-spending-widget">
    <h3 class="widget-title">
      <img src="https://api.iconify.design/mdi/lightbulb-on.svg?color=%23fff" class="title-icon" alt="Idea">
      What You Could've Had Instead
    </h3>
    <p class="couldve-intro">Your net loss of <strong class="negative">$105.00</strong> could've been...</p>
    <div class="grid-2col">
      <div class="couldve-items">
        <Skeleton v-for="i in 2" :key="i" height="32px" />
      </div>
      <div class="couldve-quotes">
        <Skeleton v-for="i in 2" :key="i" height="32px" />
      </div>
    </div>
  </div>
</template>

<script setup>
import Skeleton from 'primevue/skeleton';
</script>

<style scoped>
.alternative-spending-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.widget-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--text-color-secondary, #ffffff);
  margin: 0 0 1rem 0;
}

.title-icon {
  width: 1.125rem;
  height: 1.125rem;
}

.couldve-intro {
  margin: 0 0 0.75rem 0;
  color: var(--text-color);
  font-family: 'Oswald', sans-serif;
  font-size: 0.9rem;
}

.negative {
  color: var(--red-500);
}

.grid-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  flex: 1;
  overflow: hidden;
}

.couldve-items, .couldve-quotes {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow: hidden;
  min-height: 0;
}

@media (max-width: 768px) {
  .grid-2col {
    grid-template-columns: 1fr;
  }
}
</style>
