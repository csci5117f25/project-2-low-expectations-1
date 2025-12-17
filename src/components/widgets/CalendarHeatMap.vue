<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import Button from 'primevue/button'

const props = defineProps({
  visits: {
    type: Array,
    default: () => [],
  },
})

const dates = ref([])
const isDarkMode = ref(false)
const darkModeKey = ref(0)
const profitMode = ref(false)

const processVisits = () => {
  if (!props.visits || props.visits.length === 0) {
    dates.value = []
    return
  }
  const newDates = []
  for (let i = 0; i < props.visits.length; i++) {
    const visit = props.visits[i]
    if (!visit.visitDate) continue
    const dateObj = visit.visitDate.toDate ? visit.visitDate.toDate() : new Date(visit.visitDate)
    dateObj.setDate(dateObj.getDate() + 1)
    const month = dateObj.getMonth() + 1
    const day = dateObj.getDate()
    const dateStr =
      dateObj.getFullYear() +
      '-' +
      (month < 10 ? '0' + month : month) +
      '-' +
      (day < 10 ? '0' + day : day)
    let found = false
    for (let j = 0; j < newDates.length; j++) {
      if (newDates[j].date === dateStr) {
        newDates[j].count++
        found = true
        break
      }
    }
    if (!found) {
      newDates.push({ date: dateStr, count: 1 })
    }
  }
  dates.value = newDates
}

const profitVisits = () => {
  if (!props.visits || props.visits.length === 0) {
    dates.value = []
    return
  }
  const newDates = []
  props.visits.forEach((visit) => {
    if (!visit.visitDate) return
    const dateObj = visit.visitDate.toDate ? visit.visitDate.toDate() : new Date(visit.visitDate)
    dateObj.setDate(dateObj.getDate() + 1)
    const month = dateObj.getMonth() + 1
    const day = dateObj.getDate()
    const dateStr =
      dateObj.getFullYear() +
      '-' +
      (month < 10 ? '0' + month : month) +
      '-' +
      (day < 10 ? '0' + day : day)
    let found = false
    for (let i = 0; i < newDates.length; i++) {
      if (newDates[i].date === dateStr) {
        newDates[i].count += visit.profit ?? 0
        found = true
        break
      }
    }
    if (!found) {
      newDates.push({ date: dateStr, count: visit.profit ?? 0 })
    }
  })
  dates.value = newDates
}

watch(
  () => props.visits,
  () => {
    if (profitMode.value) {
      profitVisits()
    } else {
      processVisits()
    }
  },
  { immediate: true, deep: true }
)

watch(profitMode, () => {
  if (profitMode.value) {
    profitVisits()
  } else {
    processVisits()
  }
})

const endDate = computed(() => {
  return new Date().toISOString().split('T')[0]
})

function updateDarkMode() {
  isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
}

onMounted(() => {
  updateDarkMode()
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    isDarkMode.value = e.matches
  })
  
  if (props.visits && props.visits.length > 0) {
    processVisits()
  }
})

watch(isDarkMode, () => {
  darkModeKey.value++
})
</script>

<template>
  <div class="calendar-heatmap-widget">
    <div class="title-row">
      <h3 class="widget-title" :class="{ 'dark-title': isDarkMode, 'light-title': !isDarkMode }">
        Calendar Heatmap
      </h3>
      <Button
        :label="profitMode ? 'Show Default Colors' : 'Show Profit/Loss'"
        @click="profitMode = !profitMode"
        size="small"
        outlined
      />
    </div>
    <div class="heatmap-wrapper" :class="{ 'dark-mode': isDarkMode, 'profit-mode': profitMode }">
      <template v-if="dates.length">
        <CalendarHeatmap
          :values="dates"
          :endDate="endDate"
          :darkMode="isDarkMode"
          :round="2"
          :key="profitMode"
          :tooltip-unit="profitMode ? 'net result' : 'casino visits'"
          :tooltip-formatter="
            profitMode
              ? (val) =>
                  `<strong>$${val.count}</strong> on ${new Date(val.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`
              : undefined
          "
          :range-color="
            profitMode
              ? isDarkMode
                ? ['#222', '#F44336', '#2e8b57', '#2e8b57', '#2e8b57', '#2e8b57']
                : ['#eee', '#F44336', '#2e8b57', '#2e8b57', '#2e8b57', '#2e8b57']
              : isDarkMode
                ? ['#222', '#2a4b6d', '#3f6baa', '#5088c8', '#609ae0', '#0b3c91']
                : ['#eee', '#d0ebff', '#a1d4ff', '#72baff', '#3490ff', '#0b3c91']
          "
        />
      </template>
      <template v-else>
        <div class="empty-message">
          {{ profitMode ? 'No profit data' : 'No visits data' }}
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.calendar-heatmap-widget {
  width: 100%;
  max-width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
  min-height: 0;
}

.widget-title {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--text-color-secondary, #ffffff);
  margin: 0;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-shrink: 0;
}

.heatmap-wrapper {
  position: relative;
  width: 100%;
  overflow-x: scroll;
  overflow-y: visible;
  -webkit-overflow-scrolling: touch;
  box-sizing: border-box;
  flex: 1;
  touch-action: pan-x;
  min-height: 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
  display: flex;
  justify-content: center;
}

.heatmap-wrapper::-webkit-scrollbar {
  height: 8px;
}

.heatmap-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.heatmap-wrapper::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.heatmap-wrapper::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.5);
}

.empty-message {
  text-align: center;
  padding: 2rem;
  color: var(--text-color-secondary);
  font-style: italic;
}

.heatmap-wrapper :deep(svg.vch__wrapper) {
  width: 800px;
  min-width: 700px;
  display: block;
  margin: 0 auto;
}

.heatmap-wrapper :deep(.vch__days__labels__wrapper text.vch__day__label) {
  transform: translateX(20px);
  text-anchor: end;
  font-size: 10px;
}

:deep(.vch__month__label),
:deep(.vch__day__label) {
  fill: #555;
  transform: translateY(3px);
}

.dark-mode :deep(.vch__month__label),
.dark-mode :deep(.vch__day__label) {
  fill: #fff;
}

:deep(.vch__legend) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  margin-bottom: 10px;
  gap: 8px;
}

:deep(.vch__legend .vch__legend__wrapper) {
  display: flex;
  flex-direction: row;
  gap: 4px;
  align-items: center;
}

:deep(.vch__legend div) {
  display: flex;
  align-items: center;
  gap: 4px;
}

:deep(.vch__legend__wrapper rect:nth-child(1)) {
  display: none;
}

.profit-mode :deep(.vch__legend__wrapper rect:nth-child(3)),
.profit-mode :deep(.vch__legend__wrapper rect:nth-child(4)),
.profit-mode :deep(.vch__legend__wrapper rect:nth-child(5)) {
  display: none;
}

.dark-title {
  color: #fff;
}

.light-title {
  color: #333;
}

@media (max-width: 768px) {
  .widget-title {
    font-size: 1rem;
    letter-spacing: 1px;
  }

  .title-row {
    margin-bottom: 0.75rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .heatmap-wrapper {
    padding-top: 25px;
    padding-bottom: 50px;
  }

  .heatmap-wrapper :deep(svg.vch__wrapper) {
    width: 500px;
    min-width: 500px;
  }

  .heatmap-wrapper :deep(.vch__days__labels__wrapper text.vch__day__label) {
    font-size: 9px;
    transform: translateX(15px);
  }

  :deep(.vch__month__label) {
    font-size: 11px;
  }

  :deep(.vch__legend) {
    flex-wrap: nowrap;
    font-size: 0.8rem;
    justify-content: space-between;
    padding: 0 10px;
  }

  .heatmap-wrapper::before {
    content: '⟵ Swipe to scroll ⟶';
    position: absolute;
    top: 5px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.7rem;
    color: var(--text-color-secondary);
    opacity: 0.7;
    pointer-events: none;
    white-space: nowrap;
    z-index: 1;
  }
}

@media (max-width: 480px) {
  .widget-title {
    font-size: 0.9rem;
  }

  .title-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .heatmap-wrapper {
    padding-top: 30px;
    padding-bottom: 55px;
  }

  .heatmap-wrapper :deep(svg.vch__wrapper) {
    width: 450px;
    min-width: 450px;
  }

  .heatmap-wrapper :deep(.vch__days__labels__wrapper text.vch__day__label) {
    font-size: 8px;
    transform: translateX(12px);
  }

  :deep(.vch__month__label) {
    font-size: 10px;
  }

  :deep(.vch__legend) {
    flex-wrap: nowrap;
    font-size: 0.75rem;
    padding: 0 5px;
    justify-content: space-between;
  }

  .heatmap-wrapper::before {
    top: 5px;
    font-size: 0.65rem;
  }
}
</style>