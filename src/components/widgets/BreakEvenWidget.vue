<template>
  <div class="breakeven-widget">
    <div class="widget-header">
      <h3 class="widget-title">Break-Even Probability</h3>
    </div>
    <div class="breakeven-content">
      <div class="status-display" :class="statusClass">
        <div class="status-text">
          <p class="status-main">{{ statusMain }}</p>
          <p class="status-sub">{{ statusSub }}</p>
        </div>
      </div>
      <div v-if="currentLoss > 0 && sessionsNeeded > 0" class="recovery-info">
        <div class="recovery-item">
          <div>
            <p class="recovery-label">Sessions Needed</p>
            <p class="recovery-value">{{ abbreviateNumber(sessionsNeeded) }}</p>
          </div>
        </div>
        <div class="recovery-item">
          <div>
            <p class="recovery-label">Avg. Win Required</p>
            <p class="recovery-value">${{ abbreviateNumber(averageNeeded) }}</p>
          </div>
        </div>
      </div>
      <div v-if="averageWin > 0" class="stats-info">
        <div class="stat-item">
          <p class="stat-label">Avg. Win</p>
          <p class="stat-value">${{ abbreviateNumber(averageWin) }}</p>
        </div>
        <div class="stat-item">
          <p class="stat-label">Winning Sessions</p>
          <p class="stat-value">{{ abbreviateNumber(winningSessionCount) }}</p>
        </div>
      </div>
      <div v-if="visits.length === 0" class="no-data">
        <p>No visit data available. Start logging your casino visits!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

// Props
const props = defineProps({
  visits: {
    type: Array,
    default: () => [],
  },
})

const currentLoss = ref(0)
const averageWin = ref(0)
const winningSessionCount = ref(0)
const sessionsNeeded = ref(0)
const averageNeeded = ref(0)

const statusClass = computed(() => {
  if (currentLoss.value > 0) return 'loss'
  if (currentLoss.value === 0) return 'breakeven'
  return 'profit'
})

const statusIcon = computed(() => {
  if (currentLoss.value > 0) return 'pi pi-exclamation-triangle'
  if (currentLoss.value === 0) return 'pi pi-balance-scale'
  return 'pi pi-check-circle'
})

const statusMain = computed(() => {
  if (currentLoss.value > 0) return `Down $${abbreviateNumber(Math.abs(currentLoss.value))}`
  if (currentLoss.value === 0) return 'At Break-Even'
  return `Up $${abbreviateNumber(Math.abs(currentLoss.value))}`
})

const statusSub = computed(() => {
  if (currentLoss.value > 0) return 'Need to recover losses'
  if (currentLoss.value === 0) return 'Balanced position'
  return 'Great performance!'
})

// Abbreviate numbers
const abbreviateNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  } else {
    return num.toFixed(2)
  }
}

// Calculate break-even stats from visits
const calculateBreakEven = () => {
  if (!props.visits || props.visits.length === 0) {
    currentLoss.value = 0
    averageWin.value = 0
    winningSessionCount.value = 0
    sessionsNeeded.value = 0
    averageNeeded.value = 0
    return
  }

  let totalProfit = 0
  let totalWins = 0
  let winCount = 0

  props.visits.forEach((visit) => {
    const profit = visit.profit || 0
    totalProfit += profit

    if (profit > 0) {
      totalWins += profit
      winCount++
    }
  })

  currentLoss.value = -totalProfit // Negative total profit means we're in the red
  winningSessionCount.value = winCount
  averageWin.value = winCount > 0 ? totalWins / winCount : 0

  // Calculate sessions needed to break even
  if (currentLoss.value > 0 && averageWin.value > 0) {
    sessionsNeeded.value = Math.ceil(currentLoss.value / averageWin.value)
    averageNeeded.value = currentLoss.value / sessionsNeeded.value
  } else {
    sessionsNeeded.value = 0
    averageNeeded.value = 0
  }
}

watch(() => props.visits, calculateBreakEven, { immediate: true, deep: true })
</script>

<style scoped>
.breakeven-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.widget-header {
  display: flex;
  margin-bottom: 0.5rem;
}

.widget-title {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-color);
  margin: 0;
}

.breakeven-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.status-display {
  text-align: center;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.status-display.loss {
  color: #dc3545;
}

.status-display.breakeven {
  color: #ffc107;
}

.status-display.profit {
  color: #28a745;
}

.status-text {
  margin: 0;
}

.status-main {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-sub {
  font-size: 1rem;
  margin: 0;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recovery-info {
  display: flex;
  gap: 1rem;
}

.recovery-item {
  flex: 1;
  text-align: center;
  padding: 0.75rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
}

.recovery-label {
  font-size: 0.75rem;
  margin: 0 0 0.25rem 0;
  color: var(--text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recovery-value {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stats-info {
  display: flex;
  gap: 1rem;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 0.75rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
}

.stat-label {
  font-size: 0.75rem;
  margin: 0 0 0 0;
  color: var(--text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.no-data {
  text-align: center;
  padding: 1rem;
}

.no-data p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

@media (max-width: 768px) {
  .breakeven-widget {
    padding: 0.75rem;
  }

  .widget-title {
    font-size: 1rem;
  }

  .status-main {
    font-size: 1.25rem;
  }

  .status-sub {
    font-size: 0.9rem;
  }

  .recovery-info,
  .stats-info {
    gap: 0.5rem;
  }

  .recovery-item,
  .stat-item {
    padding: 0.5rem;
  }

  .recovery-value,
  .stat-value {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .breakeven-widget {
    padding: 0.5rem;
  }

  .widget-title {
    font-size: 0.9rem;
  }

  .status-display {
    padding: 0.75rem;
  }

  .status-main {
    font-size: 1.1rem;
  }

  .status-sub {
    font-size: 0.8rem;
  }

  .recovery-info,
  .stats-info {
    gap: 0.4rem;
  }

  .recovery-item,
  .stat-item {
    padding: 0.4rem;
  }

  .recovery-label,
  .stat-label {
    font-size: 0.7rem;
  }

  .recovery-value,
  .stat-value {
    font-size: 0.9rem;
  }

  .no-data p {
    font-size: 0.8rem;
  }
}
</style>
