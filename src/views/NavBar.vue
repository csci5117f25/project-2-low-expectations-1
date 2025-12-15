<template>
  <div>
    <header class="header">
      <div class="header-left">
        <img src="/playing-cards.png" class="logo" alt="Playing cards logo" />
        <div class="header-title">
          <h1>GAMBLR</h1>
          <p>Track your gambling habits responsibly</p>
        </div>
      </div>

      <div class="header-right">
        <Button label="+ Log Visit" severity="secondary" @click="logVisitFormVisible = true" />
        <LogOutButton />
        <LogVisitForm v-model:visible="logVisitFormVisible" />
      </div>
    </header>

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
            :src="`https://api.iconify.design/mdi/${tab.icon}.svg?color=%23fff`"
            class="tab-icon"
            :alt="tab.name"
          />
        </template>
      </Button>
      <Button
        label="Practice Longue"
        severity="danger"
        rounded
        class="tab-button practice-button"
        @click="handleTabClick({ name: 'practice', routeName: 'practice' })"
      >
        <template #icon>
          <img
            :src="`https://api.iconify.design/mdi/slot-machine.svg?color=%23000`"
            class="tab-icon"
            :alt="'Practice Longue'"
          />
        </template>
      </Button>
    </nav>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Button from 'primevue/button'
import LogVisitForm from '@/components/LogVisitForm.vue'
import LogOutButton from '@/components/LogOutButton.vue'

const router = useRouter()
const route = useRoute()
const logVisitFormVisible = ref(false)

const tabs = [
  { name: 'Dashboard', icon: 'chart-arc', routeName: 'dashboard' },
  { name: 'All My Visits', icon: 'clock', routeName: 'visits' },
  { name: 'Wishlist', icon: 'star', routeName: 'wishlist' },
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
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 2px solid var(--surface-border);
  background: var(--surface-card);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  width: 45px;
  height: 45px;
}

.header-title h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--text-color);
}

.header-title p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}

.header-right {
  display: flex;
  gap: 0.75rem;
}

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

.tab-icon {
  width: 1rem;
  height: 1rem;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .nav-tabs {
    overflow-x: auto;
  }
}
</style>
