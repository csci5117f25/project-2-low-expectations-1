<template>
  <div class="dashboard-container">
    <div class="dashboard-content">
      <NavBar />
      <main class="main-content">
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
          v-if="!loading"
          :editMode="editMode"
          :widgets="activeWidgets"
          @update:widgets="activeWidgets = $event"
        />
        
        <!-- Loading state -->
        <div v-else class="loading-state">
          <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
          <p>Loading dashboard...</p>
        </div>

        <!-- Error state -->
        <Message v-if="error" severity="error" :closable="true" @close="error = null">
          <p>{{ error }}</p>
        </Message>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DraggableWidgetGrid from '@/components/DraggableWidgetGrid.vue';
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useRouter } from 'vue-router'
import NavBar from './NavBar.vue'
import { auth } from '@/firebase'
import { onAuthStateChanged } from 'firebase/auth'

const router = useRouter()

const editMode = ref(false);
const loading = ref(true);
const error = ref(null);

// Active widgets on dashboard - initial state
const activeWidgets = ref([
  { id: 'timeseries', name: 'Time Series Chart', component: 'TimeSeriesWidget', size: 'full' },
  { id: 'trophy', name: 'Trophy Case', component: 'TrophyWidget', size: 'half' },
  { id: 'breakeven', name: 'Break-Even Probability', component: 'BreakEvenWidget', size: 'half' },
  { id: 'alternative', name: 'Alternative Spending', component: 'AlternativeSpendingWidget', size: 'full' },
  { id: 'calendarheatmap', name: 'Calendar Heatmap', component: 'CalendarHeatMap', size: 'full' },
  { id: 'moodmoney', name: 'Mood vs Money', component: 'MoodMoney', size: 'half' },
]);

const toggleEditMode = () => {
  editMode.value = !editMode.value;
};

// Wait for authentication before loading data
onMounted(() => {
  // Listen for auth state changes
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, safe to load dashboard
      loading.value = false;
      error.value = null;
    } else {
      // User is not signed in, redirect to login or show error
      error.value = "Please sign in to view your dashboard";
      loading.value = false;
      // Optionally redirect to login
      // router.push('/login');
    }
  }, (err) => {
    // Handle auth error
    console.error('Auth error:', err);
    error.value = "Authentication error. Please try refreshing the page.";
    loading.value = false;
  });

  // Cleanup subscription on unmount
  return () => unsubscribe();
});
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: var(--surface-ground);
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

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
  color: var(--text-color-secondary);
}

.dashboard-controls {
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }
}
</style>