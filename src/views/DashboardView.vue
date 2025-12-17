<template>
  <div class="dashboard-container">
    <Header />
    <div class="dashboard-content">
      <NavTabs />
      <main class="main-content">
        <!-- Edit Dashboard Button -->

        <NetResultQuotes></NetResultQuotes>
        <div class="dashboard-controls">
          <div class="filter-controls">
            <div class="filter-item">
              <IftaLabel>
              <DatePicker
              id="date-range"
              v-model="dateRange"
              selectionMode="range"
              :manualInput="false"
              showIcon
              showButtonBar
              placeholder="Select date range"
              dateFormat="mm/dd/yy"
              class="date-picker"
              ></DatePicker>
              <label for="date-range">Date Range:</label>
              </IftaLabel>
            </div>
            <div class="filter-item">
              <IftaLabel>
              <Select
              id="casino-filter"
              v-model="selectedCasino"
              :options="casinoOptions"
              optionLabel="name"
              optionValue="id"
              placeholder="All Casinos"
              showClear
              checkmark
              class="casino-dropdown"
              ></Select>
              <label for="casino-filter">Casino:</label>
              </IftaLabel>
            </div>
               <Button
              label="Clear Filters"
              severity="secondary"
              text
              size="small"
              @click="clearFilters"
              icon="pi pi-filter-slash"
              :disabled="!hasActiveFilters"
            />
          </div>
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
          :visits="filteredVisits"
          @update:widgets="activeWidgets = $event"
        />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue'
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
import Header from './Header.vue'
import NavTabs from './NavTabs.vue'
import { doc, getDoc, setDoc, collection} from 'firebase/firestore'
import NetResultQuotes from '@/components/netResultQuotes.vue'
import { db } from '@/firebase_conf'
import { useCollection, useCurrentUser } from 'vuefire'
import DatePicker  from 'primevue/datepicker'
import  Select  from 'primevue/select'
import IftaLabel  from 'primevue/iftalabel'

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

//Filter state
const dateRange  = ref(null)
const selectedCasino = ref(null)

const casinoOptions = useCollection(collection(db, 'users', user.value.uid, 'casinos'))


const allVisits = useCollection(collection(db, 'users', user.value.uid, 'casinoVisits'))

const filteredVisits = computed(() => {
  if (!allVisits.value) return []

  let visits = [...allVisits.value]

  //filter by casino
  if(selectedCasino.value) {
    visits = visits.filter((v) => v.casinoId === selectedCasino.value)
  }

  // Filter by start date
  if (dateRange.value && dateRange.value[0]) {
    const startDate = new Date(dateRange.value[0])
    startDate.setHours(0, 0, 0, 0)

    visits = visits.filter((v) => {
      const visitDate = v.visitDate?.toDate ? v.visitDate.toDate() : new Date(v.visitDate)
      return visitDate >= startDate
    })
  }

  // Filter by end date
  if (dateRange.value && dateRange.value[1]) {
    const endDate = new Date(dateRange.value[1])
    endDate.setHours(23, 59, 59, 999)

    visits = visits.filter((v) => {
      const visitDate = v.visitDate?.toDate ? v.visitDate.toDate() : new Date(v.visitDate)
      return visitDate <= endDate
    })
  }

  return visits
})

const hasActiveFilters = computed(() => {
  return dateRange.value !== null || selectedCasino.value !== null
})

function clearFilters() {
  dateRange.value = null
  selectedCasino.value = null
}

// Default widgets configuration
const defaultWidgets = [
  { id: 'timeseries', name: 'Time Series Chart', component: 'TimeSeriesWidget', size: 'full' },
  { id: 'trophy', name: 'Trophy Case', component: 'TrophyWidget', size: 'half' },
  { id: 'breakeven', name: 'Break-Even Probability', component: 'BreakEvenWidget', size: 'half' },
  {
    id: 'alternative',
    name: 'Alternative Spending',
    component: 'AlternativeSpendingWidget',
    size: 'half',
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
  width: 100%;
  padding-top: 120px;
}

.dashboard-controls {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  margin-top: 2rem;
}

.filter-controls {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}


.main-content {
  padding: 2rem;
  width: 100%;
  box-sizing: border-box;
}

.dashboard-controls {
  margin-bottom: 1.5rem;
}

.edit-dashboard-btn {
  width: 100%;
  max-width: 200px;
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
  .main-content {
    padding: 1rem;
  }

  .dashboard-controls {
    margin-bottom: 1rem;
  }

  .edit-dashboard-btn {
    max-width: 100%;
  }

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

  .result-value {
    font-size: 1.5rem;
  }

  .result-details {
    gap: 0.5rem;
  }

  .detail-value {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 0.75rem;
  }

  .result-value {
    font-size: 1.25rem;
  }

  .chart {
    height: 150px;
  }
}
</style>
