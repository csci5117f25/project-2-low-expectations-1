<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import Card from 'primevue/card'

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

// Process visits data into calendar format
const processVisits = () => {
  if (!props.visits || props.visits.length === 0) {
    dates.value = []
    return
  }

  const dateMap = {}

  props.visits.forEach((visit) => {
    if (!visit.visitDate) return

    const dateObj = visit.visitDate.toDate ? visit.visitDate.toDate() : new Date(visit.visitDate)
    const dateStr = dateObj.toISOString().split('T')[0]

    if (dateMap[dateStr]) {
      dateMap[dateStr]++
    } else {
      dateMap[dateStr] = 1
    }
  })

  dates.value = Object.entries(dateMap).map(([date, count]) => ({
    date,
    count,
  }))
}

// Watch for changes in visits
watch(() => props.visits, processVisits, { immediate: true, deep: true })

//get the latest date from the logged visits
// possible end date wrong
const endDate = computed(() => {
  if (dates.value.length === 0) return new Date()
  let latest = new Date(dates.value[0].date)
  for (let i = 1; i < dates.value.length; i++) {
    const currDate = new Date(dates.value[i].date)
    if (currDate > latest) latest = currDate
  }
  return latest
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
    <h3 class="widget-title">Calendar Heatmap</h3>
    <div class="heatmap-wrapper" :class="{ 'dark-mode': isDarkMode }">
      <CalendarHeatmap
        v-if="dates.length"
        :values="dates"
        :endDate="endDate"
        :darkMode="isDarkMode"
        :round="2"
        :key="darkModeKey"
        tooltip-unit="casino visits"
      />
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
}

.widget-title {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--text-color-secondary, #ffffff);
  margin: 0 0 1rem 0;
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