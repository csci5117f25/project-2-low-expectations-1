<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase_conf'
import { useCurrentUser } from 'vuefire'
import Card from 'primevue/card'

const user = useCurrentUser()
const dates = ref([])
const isDarkMode = ref(false)
const darkModeKey = ref(0)


onMounted(async () => {
  if (!user.value) return
  const userID = user.value.uid
  const visitRef = collection(db, 'users', userID, 'casinoVisits')
  onSnapshot(visitRef, (snapshot) => {
    dates.value = []
    snapshot.forEach((docSnap) => {
      const data = docSnap.data()
      if (!data.createdAt) return
      const dateObj = data.createdAt.toDate() 
      const dateStr = dateObj.toISOString().split('T')[0]
      let found = false
      for (let i = 0; i < dates.value.length; i++) {
        if (dates.value[i].date === dateStr) {
          dates.value[i].count++
          found = true
          break
        }
      }
      if (!found) {
        dates.value.push({ date: dateStr, count: 1 })
      }
    })
  })
})

//get the latest date from the logged visits
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
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    isDarkMode.value = e.matches
  })
})

watch(isDarkMode, () => {
  darkModeKey.value++
})


</script>

<template>
  <Card class="full-width">
    <template #title>Calendar Heatmap</template>
    <template #content>
        <div class="heatmap-wrapper" :class="{'dark-mode': isDarkMode}">
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
    </template>
  </Card>
</template>
<style scoped>

.heatmap-wrapper {
  position: relative;
  padding-top: 20px;
}

.heatmap-wrapper :deep(svg.vch__wrapper) {
  overflow: visible;
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
</style>