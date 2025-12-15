<template>
  <div class="breakeven-widget">
    <h3 class="widget-title">
      <img src="https://api.iconify.design/mdi/chart-bar.svg?color=%23fff" class="title-icon" alt="Chart">
      Break-Even Probability
    </h3>
    <div class="breakeven-content">
      <Message severity="error" :closable="false">
        <p>To recover your current loss of <strong>$75.00</strong>, you'd need:</p>
        <p class="breakeven-sessions">2 more sessions averaging $37.50</p>
      </Message>
      <div class="breakeven-details">
        <p>Recent Loss of <strong>$160.00</strong> would take 4 winning sessions to recover</p>
        <p>Based on your average win of <strong>$37.50</strong> from 3 winning sessions</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import Message from 'primevue/message';
</script>

<style scoped>
.breakeven-widget {
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

.breakeven-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
  overflow: hidden;
}

.breakeven-sessions {
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0.5rem 0 0 0;
}

.breakeven-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.breakeven-details p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-color);
}
</style>
