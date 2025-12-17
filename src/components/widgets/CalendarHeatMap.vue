<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import Button from 'primevue/button'

// Props
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

//get the date and counts of the user's casino visits
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

//get the date and netresult of the user's casino visits
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

//watch if the user toggles profit mode
watch([() => props.visits, profitMode], () => {
  if (profitMode.value) {
    profitVisits()
  } else {
    processVisits()
  }
})

//get the latest date from the logged visits
// possible end date wrong
const endDate = computed(() => {
  if (!dates.value.length) return null
  return dates.value[dates.value.length - 1].date
})

//dealing with dark mode and light mode appearences
function updateDarkMode() {
  isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
}

onMounted(() => {
  updateDarkMode()
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    isDarkMode.value = e.matches
  })
})

watch(isDarkMode, () => {
  darkModeKey.value++
})
</script>

<template>
  <div class="calendar-heatmap-widget">
    <div class="title-row">
      <h3 class="widget-title">Calendar Heatmap</h3>
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
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
  box-sizing: border-box;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.widget-title {
  font-family: 'Cinzel', serif;
  font-size: 1.2rem;
  text-align: left;
  margin: 0;
  color: var(--text-color-secondary);
  font-weight: 700;
  letter-spacing: 1px;
}


.heatmap-wrapper {
  position: relative;
  padding-top: 20px;
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  box-sizing: border-box;
}

.heatmap-wrapper :deep(svg.vch__wrapper) {
  overflow: visible;
  max-width: 100%;
}

.heatmap-wrapper :deep(.vch__days__labels__wrapper text.vch__day__label) {
  transform: translateX(20px);
  text-anchor: end;
  font-size: 10px;
}

:deep(.vch__month__label),
:deep(.vch__day__label) {
  fill: #555;
}

.dark-mode :deep(.vch__month__label),
.dark-mode :deep(.vch__day__label) {
  fill: #fff;
}

:deep(.vch__legend) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 5px;
}

:deep(.vch__legend .vch__legend__wrapper) {
  display: flex;
  flex-direction: row;
  gap: 4px;
}

:deep(.vch__legend div:last-child) {
  margin-left: 8px;
}

:deep(.vch__legend__wrapper rect:nth-child(1)) {
  display: none;
}

.profit-mode :deep(.vch__legend__wrapper rect:nth-child(3)),
.profit-mode :deep(.vch__legend__wrapper rect:nth-child(4)),
.profit-mode :deep(.vch__legend__wrapper rect:nth-child(5)) {
  display: none;
}

.widget-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0;
  transition: color 0.3s ease;
}

.dark-title {
  color: #fff;
}

.light-title {
  color: #333;
}

.toggle-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background-color: #7f5669;
  color: #fff;
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

@media (max-width: 768px) {
  .widget-title {
    font-size: 1rem;
    letter-spacing: 1px;
    margin-bottom: 0.75rem;
  }

  .heatmap-wrapper {
    padding-top: 15px;
    padding-right: 10px;
  }

  .heatmap-wrapper :deep(.vch__days__labels__wrapper text.vch__day__label) {
    font-size: 8px;
    transform: translateX(15px);
  }

  :deep(.vch__month__label) {
    font-size: 10px;
  }

  :deep(.vch__legend) {
    flex-wrap: wrap;
    font-size: 0.75rem;
  }
}

@media (max-width: 480px) {
  .widget-title {
    font-size: 0.9rem;
    text-align: center;
  }

  .heatmap-wrapper {
    padding-top: 10px;
  }

  .heatmap-wrapper :deep(.vch__days__labels__wrapper text.vch__day__label) {
    font-size: 7px;
    transform: translateX(12px);
  }

  :deep(.vch__month__label) {
    font-size: 9px;
  }

  .heatmap-wrapper::after {
    content: '← Scroll →';
    position: absolute;
    bottom: 5px;
    right: 10px;
    font-size: 0.7rem;
    color: var(--text-color-secondary);
    opacity: 0.6;
    pointer-events: none;
  }
}
</style>
