<template>
  <div class="breakeven-widget">
    <div class="widget-header">
      <h3 class="widget-title">Break-Even Probability</h3>
    </div>
    <div class="breakeven-content">
      <div class="status-display" :class="statusClass">
        <div class="status-text">
          <p class="status-main">{{ statusMain }}</p>
        </div>
      </div>
      <div v-if="currentLoss > 0 && sessionsNeeded > 0" class="recovery-info">
        <div class="recovery-item">
          <p class="recovery-label">Sessions Needed</p>
          <p class="recovery-value">{{ abbreviateNumber(sessionsNeeded) }}</p>
        </div>
        <div class="recovery-item">
          <p class="recovery-label">Avg. Win Required</p>
          <p class="recovery-value">${{ abbreviateNumber(averageNeeded) }}</p>
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

const statusMain = computed(() => {
  if (currentLoss.value > 0) return `Down $${abbreviateNumber(Math.abs(currentLoss.value))}`
  if (currentLoss.value === 0) return 'At Break-Even'
  return `Up $${abbreviateNumber(Math.abs(currentLoss.value))}`
})

const abbreviateNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  } else {
    return num.toFixed(2)
  }
}

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

  currentLoss.value = -totalProfit
  winningSessionCount.value = winCount
  averageWin.value = winCount > 0 ? totalWins / winCount : 0

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
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
  box-sizing: border-box;
}

.widget-header {
  margin-bottom: 0.75rem;
  flex-shrink: 0;
}

.widget-title {
  font-family: 'Cinzel', serif;
  font-size: 1.1rem;
  text-align: left;
  margin: 0;
  color: var(--text-color-secondary);
  font-weight: 700;
  letter-spacing: 1px;
}

.breakeven-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 0;
}

.status-display {
  text-align: center;
  border-radius: 12px;
  transition: all 0.3s ease;
  flex-shrink: 0;
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
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.status-sub {
  font-size: 0.95rem;
  margin: 0.25rem 0 0 0;
  opacity: 0.8;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.recovery-info,
.stats-info {
  display: flex;
  gap: 0.75rem;
  flex-shrink: 0;
}

.recovery-item,
.stat-item {
  flex: 1;
  text-align: center;
  padding: 0.75rem 0.5rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  min-width: 0;
}

.recovery-label,
.stat-label {
  font-size: 0.7rem;
  margin: 0 0 0.25rem 0;
  color: var(--text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.recovery-value,
.stat-value {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-color);
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.no-data {
  text-align: center;
  padding: 1rem;
  flex-shrink: 0;
}

.no-data p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-color-secondary);
  line-height: 1.4;
}

@media (max-width: 768px) {
  .breakeven-widget {
    padding: 0.65rem;
  }

  .widget-header {
    margin-bottom: 0.6rem;
  }

  .widget-title {
    font-size: 1rem;
    letter-spacing: 0.5px;
  }

  .breakeven-content {
    gap: 0.6rem;
  }

  .status-main {
    font-size: 1.2rem;
  }

  .status-sub {
    font-size: 0.85rem;
  }

  .recovery-info,
  .stats-info {
    gap: 0.6rem;
  }

  .recovery-item,
  .stat-item {
    padding: 0.6rem 0.4rem;
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

  .widget-header {
    margin-bottom: 0.5rem;
  }

  .widget-title {
    font-size: 0.9rem;
  }

  .breakeven-content {
    gap: 0.5rem;
  }

  .status-main {
    font-size: 1.1rem;
  }

  .status-sub {
    font-size: 0.8rem;
  }

  .recovery-info,
  .stats-info {
    gap: 0.5rem;
  }

  .recovery-item,
  .stat-item {
    padding: 0.5rem 0.3rem;
  }

  .recovery-label,
  .stat-label {
    font-size: 0.65rem;
  }

  .recovery-value,
  .stat-value {
    font-size: 0.95rem;
  }

  .no-data p {
    font-size: 0.8rem;
  }
}
</style>