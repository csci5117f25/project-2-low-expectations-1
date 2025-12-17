<script setup>
import { ref, watch } from 'vue'

// Props
const props = defineProps({
  visits: {
    type: Array,
    default: () => [],
  },
})

const maxValue = ref(0)
const minValue = ref(0)

// Format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Calculate max and min values from visits
const calculateValues = () => {
  if (!props.visits || props.visits.length === 0) {
    maxValue.value = 0
    minValue.value = 0
    return
  }

  const profits = props.visits.map((v) => Number(v.profit) || 0)

  if (profits.length > 0) {
    maxValue.value = Math.max(...profits)
    minValue.value = Math.min(...profits)
  } else {
    maxValue.value = 0
    minValue.value = 0
  }
}

// Watch for changes in visits
watch(() => props.visits, calculateValues, { immediate: true, deep: true })
</script>

<template>
  <div class="trophy-widget-container">
    <h3 class="widget-title">Highlights</h3>
    <div class="stats-container">
      <div class="stat-item win">
        <div class="icon-wrapper">
          <i class="pi pi-trophy"></i>
        </div>
        <div class="stat-details">
          <span class="label">Best Win</span>
          <span class="value">{{ formatCurrency(maxValue) }}</span>
        </div>
      </div>

      <div class="stat-item loss">
        <div class="icon-wrapper">
          <i class="pi pi-arrow-down-right"></i>
        </div>
        <div class="stat-details">
          <span class="label">Worst Loss</span>
          <span class="value">{{ formatCurrency(Math.abs(minValue)) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.trophy-widget-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
  box-sizing: border-box;
}

.widget-title {
  font-family: 'Cinzel', serif;
  font-size: 1.2rem;
  text-align: left;
  margin: 0 0 1rem 0;
  color: var(--text-color-secondary);
  font-weight: 700;
  letter-spacing: 1px;
}

.stats-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;
  justify-content: center;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: var(--radius-med);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: transform 0.2s ease;
}

.icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.stat-item.win .icon-wrapper {
  background: rgba(76, 175, 80, 0.15);
  color: #4caf50;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.1);
}

.stat-item.loss .icon-wrapper {
  background: rgba(244, 67, 54, 0.15);
  color: #f44336;
  box-shadow: 0 0 10px rgba(244, 67, 54, 0.1);
}

.stat-details {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.label {
  font-size: 0.75rem;
  color: var(--text-gray);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.25rem;
}

.value {
  font-size: 1.5rem;
  font-weight: bold;
  font-family: 'Oswald', sans-serif;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-item.win .value {
  color: #4caf50;
}

.stat-item.loss .value {
  color: #f44336;
}
</style>
