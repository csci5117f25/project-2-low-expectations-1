<template>
  <nav class="nav-tabs">
    <Button
      v-for="tab in tabs"
      :key="tab.name"
      :label="tab.name"
      :severity="activeTab === tab.name ? 'primary' : 'secondary'"
      :outlined="activeTab !== tab.name"
      class="tab-button"
      @click="handleTabClick(tab)"
    >
      <template #icon>
        <img
          :src="`https://api.iconify.design/mdi/${tab.icon}.svg?color=${activeTab === tab.name ? '%23000' : '%23fff'}`"
          class="tab-icon"
          :alt="tab.name"
        />
      </template>
    </Button>
    <Button
      label="Practice Lounge"
      severity="danger"
      class="tab-button practice-button"
      @click="handleTabClick({ name: 'practice', routeName: 'practice' })"
    >
      <template #icon>
        <img
          :src="`https://api.iconify.design/mdi/slot-machine.svg?color=%23000`"
          class="tab-icon"
          :alt="'Practice Lounge'"
        />
      </template>
    </Button>
  </nav>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Button from 'primevue/button'

const router = useRouter()
const route = useRoute()

const tabs = [
  { name: 'Dashboard', icon: 'chart-arc', routeName: 'dashboard' },
  { name: 'All My Visits', icon: 'clock', routeName: 'visits' },
]

const activeTab = ref('Dashboard')

const handleTabClick = (tab) => {
  activeTab.value = tab.name
  if (tab.routeName) {
    router.push({ name: tab.routeName })
  }
}

activeTab.value = tabs.find((t) => t.routeName === route.name)?.name ?? 'Dashboard'
</script>

<style scoped>
.nav-tabs {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: var(--surface-50);
  border-bottom: 2px solid var(--surface-border);
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.practice-button {
  margin-left: auto;
  transition: background-image 0.3s ease;
}

.practice-button:hover {
  background-image: url('/777.gif') !important;
  background-size: cover !important;
  background-position: center !important;
  background-color: transparent !important;
  color: transparent !important;
}

.practice-button:hover .tab-icon,
.practice-button:hover .p-button-label {
  opacity: 0 !important;
}

.tab-icon {
  width: 1rem;
  height: 1rem;
}

@media (max-width: 768px) {
  .practice-button {
    margin-left: 0;
    width: 100%;
  }

  .nav-tabs {
    overflow-x: auto;
    flex-direction: column;
  }
}
</style>
