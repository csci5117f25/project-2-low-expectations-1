<template>
  <div class="dashboard-container">
    <div class="dashboard-content">
      <NavBar />
      <main class="main-content">
        <!-- Edit Dashboard Button -->

        <Message severity="info" :closable="false" style="margin-bottom: 24px">
          <p>Placeholder for AI quotes or comments to be later implemented?</p>
        </Message>
        <div class="dashboard-controls">
          <Button
            :label="editMode ? 'Done Editing' : 'Edit Dashboard'"
            :severity="editMode ? 'success' : 'secondary'"
            :outlined="!editMode"
            @click="toggleEditMode"
            icon="pi pi-cog"
            class="edit-dashboard-btn"
          />
        </div>

        <!-- Draggable Widget Grid Component -->
        <DraggableWidgetGrid
          :editMode="editMode"
          :widgets="activeWidgets"
          @update:widgets="activeWidgets = $event"
        />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import DraggableWidgetGrid from '@/components/DraggableWidgetGrid.vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Message from 'primevue/message'
import Divider from 'primevue/divider'
import Skeleton from 'primevue/skeleton'
import LogVisitForm from '@/components/LogVisitForm.vue'
import { useRouter } from 'vue-router'
import LogOutButton from '@/components/LogOutButton.vue'
import RecentHistory from '@/components/widgets/RecentHistory.vue'
import NavBar from './NavBar.vue'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/firebase_conf'
import { useCurrentUser } from 'vuefire'

const router = useRouter()
const user = useCurrentUser()

const tabs = [
  { name: 'Dashboard', icon: 'chart-arc' },
  { name: 'All My Visits', icon: 'clock' },
  { name: 'Fun Spin', icon: 'dice' },
  { name: 'Map', icon: 'map' },
  { name: 'Rating', icon: 'star', routeName: 'rating' },
]

const activeTab = ref('Dashboard')
const editMode = ref(false)
const logVisitFormRef = ref(false)

// Default widgets configuration
const defaultWidgets = [
  { id: 'timeseries', name: 'Time Series Chart', component: 'TimeSeriesWidget', size: 'full' },
  { id: 'trophy', name: 'Trophy Case', component: 'TrophyWidget', size: 'half' },
  { id: 'breakeven', name: 'Break-Even Probability', component: 'BreakEvenWidget', size: 'half' },
  {
    id: 'alternative',
    name: 'Alternative Spending',
    component: 'AlternativeSpendingWidget',
    size: 'full',
  },
  { id: 'calendarheatmap', name: 'Calendar Heatmap', component: 'CalendarHeatMap', size: 'full' },
  { id: 'moodmoney', name: 'Mood vs Money', component: 'MoodMoney', size: 'half' },
  { id: 'recenthistory', name: 'Recent History', component: 'RecentHistory', size: 'full'}
]

// active widgets
const activeWidgets = ref([...defaultWidgets])

//load widget configuration
const loadWidgetConfig = async () => {
  if (!user.value?.uid) return

  try {
    const configRef = doc(db, 'users', user.value.uid, 'settings', 'dashboardConfig')
    const configDoc = await getDoc(configRef)

    if (configDoc.exists() && configDoc.data().widgets) {
      activeWidgets.value = configDoc.data().widgets
    }
  } catch (err) {
    console.error('couldn;t laod dashbaord config: ', err)
  }
}

// Save widget configuration to Firestore
const saveWidgetConfig = async (widgets) => {
  if (!user.value?.uid) return

  try {
    const configRef = doc(db, 'users', user.value.uid, 'settings', 'dashboardConfig')
    await setDoc(configRef, { widgets }, { merge: true })
  } catch (error) {
  }
}

// save widget configuration
watch(activeWidgets, (newWidgets) => {
  saveWidgetConfig(newWidgets)
}, { deep: true })

watch(user, (newUser) => {
  if (newUser) {
    loadWidgetConfig()
  }
}, { immediate: true })

onMounted(() => {
  if (user.value) {
    loadWidgetConfig()
  }
})

const handleTabClick = (tab) => {
  activeTab.value = tab.name
  if (tab.routeName) {
    router.push({ name: tab.routeName })
  } else if (tab.route) {
    router.push(tab.route)
  }
}

const toggleEditMode = () => {
  editMode.value = !editMode.value
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: var(--surface-card);
  padding: 0;
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  background: var(--surface-card);
  min-height: 100vh;
}

.main-content {
  padding: 2rem;
}

.chart-section {
  margin-bottom: 1.5rem;
}

.grid-2col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.full-width {
  grid-column: 1 / -1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.net-result {
  margin-bottom: 1rem;
}

.result-value {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.result-value.negative {
  color: var(--red-500);
}

.result-label {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
  margin: 0;
}

.result-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding-top: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-label {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.detail-value {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--text-color);
}

.chart-filters {
  display: flex;
  gap: 0.5rem;
}

.chart-container {
  position: relative;
}

.chart {
  width: 100%;
  height: 180px;
}

.axis-label {
  font-size: 10px;
  fill: var(--text-color-secondary);
}

.x-axis-labels {
  display: flex;
  justify-content: space-around;
  padding: 0.5rem 0;
  font-size: 0.75rem;
  color: var(--text-color-secondary);
}

.chart-tooltip {
  position: absolute;
  top: 30%;
  right: 10%;
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 4px;
  padding: 0.5rem;
  font-size: 0.75rem;
}

.tooltip-date {
  color: var(--text-color-secondary);
  margin: 0 0 0.25rem 0;
}

.tooltip-value {
  font-weight: bold;
  color: var(--text-color);
  margin: 0;
}

.breakeven-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.breakeven-sessions {
  font-size: 1.25rem;
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

.map-container {
  margin-bottom: 1rem;
}

.map-placeholder {
  position: relative;
  background: var(--surface-100);
  border: 2px solid var(--surface-border);
  border-radius: 6px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-text {
  font-size: 3rem;
  font-weight: bold;
  color: var(--surface-400);
}

.map-pin {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.winning-pin {
  background: var(--blue-500);
}

.losing-pin {
  background: var(--red-500);
}

.map-legend {
  display: flex;
  gap: 1.5rem;
  font-size: 0.875rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-dot.winning {
  background: var(--blue-500);
}

.legend-dot.losing {
  background: var(--red-500);
}

.couldve-intro {
  margin: 0 0 1rem 0;
  color: var(--text-color);
}

.negative {
  color: var(--red-500);
}

.couldve-items,
.couldve-quotes {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

@media (max-width: 768px) {
  .grid-2col {
    grid-template-columns: 1fr;
  }

  .header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .header-title p {
    margin: 0;
    font-size: 0.8rem;
    color: var(--text-color-secondary);
  }

  .header-right {
    width: 100%;
    justify-content: center;
    /*flex-wrap: wrap;*/
  }

  .nav-tabs {
    justify-content: center;
    flex-wrap: wrap;
    overflow-x: visible;
    padding: 0.5rem 1rem;
  }

  .practice-button {
    margin-top: 0.5rem;
    margin-left: 0;
    width: 100%;
  }
}
</style>
