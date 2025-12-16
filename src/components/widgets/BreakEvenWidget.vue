<template>
  <div class="breakeven-widget">
    <h3 class="widget-title">
      <i class="pi pi-chart-bar title-icon"></i>
      Break-Even Probability
    </h3>
    <div class="breakeven-content">
      <Message v-if="currentLoss > 0" severity="error" :closable="false">
        <p>
          To recover your current loss of <strong>${{ currentLoss.toFixed(2) }}</strong
          >, you'd need:
        </p>
        <p class="breakeven-sessions">
          {{ sessionsNeeded }} more sessions averaging ${{ averageNeeded.toFixed(2) }}
        </p>
      </Message>
      <Message v-else-if="currentLoss === 0" severity="info" :closable="false">
        <p>You're currently at break-even! Keep track of your sessions to maintain balance.</p>
      </Message>
      <Message v-else severity="success" :closable="false">
        <p>
          You're currently up <strong>${{ Math.abs(currentLoss).toFixed(2) }}</strong
          >! Great job!
        </p>
      </Message>
      <div v-if="averageWin > 0 && winningSessionCount > 0" class="breakeven-details">
        <p>
          Based on your average win of <strong>${{ averageWin.toFixed(2) }}</strong> from
          {{ winningSessionCount }} winning sessions
        </p>
      </div>
      <div v-else-if="visits.length > 0" class="breakeven-details">
        <p>No winning sessions yet. Keep playing responsibly!</p>
      </div>
      <div v-else class="breakeven-details">
        <p>No visit data available. Start logging your casino visits!</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import Message from 'primevue/message'

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

// Watch for changes in visits
watch(() => props.visits, calculateBreakEven, { immediate: true, deep: true })
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
  font-size: 1.125rem;
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
