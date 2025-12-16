<template>
  <div class="draggable-dashboard">
    <!-- Edit Mode Controls -->
    <div v-if="editMode" class="edit-controls">
      <Message severity="warn" :closable="false">
        <div class="edit-message">
          <span> Edit Mode: Drag widgets to rearrange, click X to remove</span>
          <Button
            label="Add Widget"
            icon="pi pi-plus"
            size="small"
            @click="showWidgetSelector = true"
          />
        </div>
      </Message>
    </div>

    <!-- Draggable Widgets Grid -->
    <draggable
      v-model="localWidgets"
      class="widgets-grid"
      :disabled="!editMode"
      item-key="id"
      ghost-class="ghost"
      animation="200"
      :delay="200"
      :delay-on-touch-only="true"
      :touch-start-threshold="10"
      :force-fallback="false"
    >
      <template #item="{ element: widget }">
        <div :class="['widget-wrapper', widget.size, { 'edit-mode': editMode }]" :key="widget.id">
          <Card class="widget-card">
            <template #content>
              <div v-if="editMode" class="widget-controls">
                <Button
                  icon="pi pi-times"
                  severity="danger"
                  text
                  rounded
                  size="small"
                  @click.stop="removeWidget(widget.id)"
                  class="remove-btn"
                />
              </div>
              <component 
                :is="getComponent(widget.component)" 
                :visits="widget.component === 'RecentHistory' ? recentVisits : casinoVisits"
              />
            </template>
          </Card>
        </div>
      </template>
    </draggable>

    <!-- Widget Selector Dialog -->
    <Dialog
      v-model:visible="showWidgetSelector"
      modal
      header="Add Widget"
      :style="{ width: '50vw' }"
      :breakpoints="{ '960px': '75vw', '640px': '90vw' }"
    >
      <div class="widget-selector">
        <div
          v-for="widget in unusedWidgets"
          :key="widget.id"
          class="widget-option"
          @click="addWidget(widget)"
        >
          <img
            :src="`https://api.iconify.design/mdi/${widget.icon}.svg?color=%23fff`"
            class="widget-option-icon"
            :alt="widget.name"
          />
          <div class="widget-option-info">
            <h4>{{ widget.name }}</h4>
            <p>{{ widget.size === 'full' ? 'Full Width' : 'Half Width' }}</p>
          </div>
          <i class="pi pi-plus-circle"></i>
        </div>
        <div v-if="unusedWidgets.length === 0" class="no-widgets">
          <p>All available widgets are already on your dashboard! 🎉</p>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase_conf'
import { useCurrentUser } from 'vuefire'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Dialog from 'primevue/dialog'
import Card from 'primevue/card'
import draggable from 'vuedraggable'

// wig
import TimeSeriesWidget from '@/components/widgets/TimeSeriesWidget.vue';
import BreakEvenWidget from '@/components/widgets/BreakEvenWidget.vue';
import AlternativeSpendingWidget from '@/components/widgets/AlternativeSpendingWidget.vue';
import CalendarHeatMap from '@/components/widgets/CalendarHeatMap.vue';
import MoodMoney from '@/components/widgets/MoodMoney.vue';  
import TrophyWidget from '@/components/widgets/TrophyWidget.vue';
import RecentHistory from '@/components/widgets/RecentHistory.vue';

// After importing widget, need to add it in 2 more places

// Props
const props = defineProps({
  editMode: {
    type: Boolean,
    default: false,
  },
  widgets: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:widgets', 'update:editMode'])

// State
const user = useCurrentUser()
const showWidgetSelector = ref(false)
const casinoVisits = ref([])
const loading = ref(true)

// Fetch casino visits
onMounted(() => {
  if (!user.value) {
    loading.value = false
    return
  }

  const visitsRef = collection(db, 'users', user.value.uid, 'casinoVisits')
  const query_ = query(visitsRef, orderBy('visitDate', 'asc'))

  // get updated data
  onSnapshot(
    query_,
    (snapshot) => {
      casinoVisits.value = []
      snapshot.forEach((doc) => {
        casinoVisits.value.push({
          id: doc.id,
          ...doc.data(),
        })
      })
      loading.value = false
    },
    (err) => {
      console.error('couldn;t fetch casino visits', err)
      loading.value = false
    },
  )
})

//obtain the latest five logged visits, order by latest first
const recentVisits = computed(() => {
  const sorted = casinoVisits.value.slice();
  sorted.sort((a, b) => {
    const aTime = a.visitDate?.seconds ?? 0;
    const bTime = b.visitDate?.seconds ?? 0;
    return bTime - aTime; 
  });
  return sorted.slice(0, 5);
});


// local widgets should fetch databse to seet which widgets are being used
const localWidgets = ref([...props.widgets])

// #1 Add New Widgets here. wig
const availableWidgets = [
  {
    id: 'timeseries',
    name: 'Time Series Chart',
    component: 'TimeSeriesWidget',
    size: 'full',
    icon: 'chart-line',
  },
  {
    id: 'breakeven',
    name: 'Break-Even Probability',
    component: 'BreakEvenWidget',
    size: 'half',
    icon: 'chart-bar',
  },
  {
    id: 'alternative',
    name: 'Alternative Spending',
    component: 'AlternativeSpendingWidget',
    size: 'half',
    icon: 'lightbulb-on',
  },
  {
    id: 'calendarheatmap',
    name: 'Calendar Heatmap',
    component: 'CalendarHeatMap',
    size: 'full',
    icon: 'calendar-heat',
  },
  {
    id: 'moodmoney',
    name: 'Mood vs Money',
    component: 'MoodMoney',
    size: 'half',
    icon: 'emoticon-happy',
  },
  { id: 'trophy', name: 'Trophy Widget', component: 'TrophyWidget', size: 'half', icon: 'trophy' },
  { id: 'recenthistory', name: 'Recent History', component: 'RecentHistory', size: 'full', icon: 'history' },
];

// Computed
const unusedWidgets = computed(() => {
  const activeIds = localWidgets.value.map((w) => w.id)
  return availableWidgets.filter((w) => !activeIds.includes(w.id))
})

// Methods
const removeWidget = (widgetId) => {
  localWidgets.value = localWidgets.value.filter((w) => w.id !== widgetId)
}

const addWidget = (widget) => {
  localWidgets.value.push({ ...widget })
  showWidgetSelector.value = false
}

// #2 add new widgets here wig
const getComponent = (componentName) => {
  const components = {
    TimeSeriesWidget,
    BreakEvenWidget,
    AlternativeSpendingWidget,
    CalendarHeatMap,
    MoodMoney,
    TrophyWidget,
    RecentHistory
  };
  return components[componentName];
};

// Watch for changes and emit to parent
watch(
  localWidgets,
  (newValue) => {
    emit('update:widgets', newValue)
  },
  { deep: true },
)

// Watch for prop changes from parent (only update if different)
watch(
  () => props.widgets,
  (newValue) => {
    // Only update if the lengths are different or if widgets are actually different
    if (
      newValue.length !== localWidgets.value.length ||
      JSON.stringify(newValue) !== JSON.stringify(localWidgets.value)
    ) {
      localWidgets.value = [...newValue]
    }
  },
)
</script>

<style scoped>
.draggable-dashboard {
  width: 100%;
}

.edit-controls {
  margin-bottom: 1.5rem;
}

.edit-message {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.widgets-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: 300px;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.widget-wrapper {
  position: relative;
  transition: all 0.3s ease;
}

.widget-wrapper.half {
  grid-column: span 1;
}

.widget-wrapper.full {
  grid-column: span 2;
}

.widget-wrapper.edit-mode {
  cursor: move;
}

.widget-card {
  height: 100%;
  transition: all 0.3s ease;
  position: relative;
}

.widget-wrapper.edit-mode .widget-card {
  border: 2px dashed var(--primary-color);
  box-shadow: 0 0 0 4px rgba(94, 21, 125, 0.1);
}

.widget-wrapper.edit-mode .widget-card:hover {
  box-shadow: 0 0 0 4px rgba(94, 21, 125, 0.2);
  transform: translateY(-2px);
}

.widget-controls {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  z-index: 10;
  background: rgba(0, 0, 0, 0.8);
  padding: 0.5rem;
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.remove-btn {
  background: rgba(244, 67, 54, 0.2) !important;
}

.ghost {
  opacity: 0.5;
  background: var(--primary-color);
}

.widget-selector {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 80vh;
  overflow-y: auto;
}

.widget-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--surface-card);
  border: 2px solid var(--surface-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.widget-option:hover {
  border-color: var(--primary-color);
  background: rgba(94, 21, 125, 0.1);
  transform: translateX(5px);
}

.widget-option-icon {
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
}

.widget-option-info {
  flex: 1;
}

.widget-option-info h4 {
  margin: 0 0 0.25rem 0;
  font-family: 'Cinzel', serif;
  font-size: 1.1rem;
  color: var(--text-color);
}

.widget-option-info p {
  margin: 0;
  font-family: 'Oswald', sans-serif;
  font-size: 0.9rem;
  color: var(--text-color-secondary);
}

.widget-option i {
  font-size: 1.5rem;
  color: var(--primary-color);
}

.no-widgets {
  text-align: center;
  padding: 2rem;
  color: var(--text-color-secondary);
}

.no-widgets p {
  font-family: 'Oswald', sans-serif;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .widgets-grid {
    grid-template-columns: 1fr;
  }

  .widget-wrapper.half,
  .widget-wrapper.full {
    grid-column: span 1;
  }

  .edit-message {
    flex-direction: column;
    align-items: flex-start;
  }

  .widget-controls {
    position: static;
    justify-content: space-between;
    width: 100%;
    margin-bottom: 0.5rem;
  }
}
</style>
