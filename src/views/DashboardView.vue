<template>
  <div class="dashboard-container">
    <div class="dashboard-content">
      <header class="header">
        <div class="header-left">
          <img src="/public/playing-cards.png" class="logo" alt="Playing cards logo">
          <div class="header-title">
            <h1>Casino Tracker</h1>
            <p>Track your gambling habits responsibly</p>
          </div>
        </div>
        <div class="header-right">
          <Button label="+ Log Visit" severity="secondary" />
          <!-- <Button label="Log out" severity="secondary" outlined /> -->
          <LogOutButton></LogOutButton>
        </div>
      </header>

      <nav class="nav-tabs">
        <Button
          v-for="tab in tabs"
          :key="tab.name"
          :label="tab.name"
          :severity="activeTab === tab.name ? 'primary' : 'secondary'"
          :outlined="activeTab !== tab.name"
          @click="handleTabClick(tab)"
          class="tab-button"
        >
          <template #icon>
            <img :src="`https://api.iconify.design/mdi/${tab.icon}.svg?color=%23fff`" class="tab-icon" :alt="tab.name">
          </template>
        </Button>
      </nav>

      <main class="main-content">
        <Message severity="info" :closable="false" style="margin-bottom:24px;">
          <p>Placeholder for AI quotes or comments to be later implemented?</p>
        </Message>

        <div class="grid-2col">

          <!-- Net Result Card -->
          <Card>
            <template #title>$ Net Result</template>
            <template #content>
              <div class="net-result">
                <div class="result-value negative">↘ $ -105.00</div>
                <p class="result-label">Current Loss</p>
              </div>
              <Divider />
              <div class="result-details">
                <div class="detail-item">
                  <span class="detail-label">Total Spent</span>
                  <span class="detail-value">$ 375.00</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Total Cashed Out</span>
                  <span class="detail-value">$ 265.00</span>
                </div>
              </div>
            </template>
          </Card>

          <!-- Net Gain/Loss Chart -->
          <Card>
            <template #title>
              <div class="card-header">
                <span>↗ Net Gain/Loss Over Time</span>
                <div class="chart-filters">
                  <Button
                    v-for="period in ['w', 'm', 'yr', '10 yr']"
                    :key="period"
                    :label="period"
                    size="small"
                    :severity="chartPeriod === period ? 'primary' : 'secondary'"
                    :outlined="chartPeriod !== period"
                    @click="chartPeriod = period"
                  />
                </div>
              </div>
            </template>
            <template #content>
              <div class="chart-container">
                <svg class="chart" viewBox="0 0 400 160" preserveAspectRatio="none">

                  <!-- Y-axis labels -->
                  <text x="10" y="15" class="axis-label">$100</text>
                  <text x="10" y="50" class="axis-label">$50</text>
                  <text x="10" y="85" class="axis-label">$0</text>
                  <text x="10" y="120" class="axis-label">-$50</text>
                  <text x="10" y="155" class="axis-label">-$100</text>

                  <!-- Zero line -->
                  <line x1="40" y1="85" x2="400" y2="85" stroke="#666" stroke-width="1" stroke-dasharray="4,4" />

                  <!-- Chart line -->
                  <polyline
                    points="40,75 120,95 200,70 280,90 360,110 400,115"
                    fill="none"
                    stroke="var(--primary-color)"
                    stroke-width="2"
                  />

                  <!-- Data points -->
                  <circle cx="40" cy="75" r="3" fill="var(--primary-color)" />
                  <circle cx="120" cy="95" r="3" fill="var(--primary-color)" />
                  <circle cx="200" cy="70" r="3" fill="var(--primary-color)" />
                  <circle cx="280" cy="90" r="3" fill="var(--primary-color)" />
                  <circle cx="360" cy="110" r="3" fill="var(--primary-color)" />
                  <circle cx="400" cy="115" r="3" fill="var(--primary-color)" />
                </svg>

                <!-- X-axis labels -->
                <div class="x-axis-labels">
                  <span>10/23</span>
                  <span>10/24</span>
                  <span>10/29</span>
                  <span>10/30</span>
                  <span>10/31</span>
                </div>

                <!-- Tooltip -->
                <div class="chart-tooltip">
                  <p class="tooltip-date">Date: 10/28</p>
                  <p class="tooltip-value">Cum. Net: +$195.00</p>
                </div>
              </div>
            </template>
          </Card>
        </div>

        <div class="grid-2col">

          <!-- Break-Even Probability -->
          <Card>
            <template #title>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <img src="https://api.iconify.design/mdi/chart-bar.svg?color=%23fff" class="title-icon" alt="Chart">
                Break-Even Probability
              </div>
            </template>
            <template #content>
              <div class="breakeven-content">
                <Message severity="error" :closable="false">
                  <p>To recover your current loss of <strong>$75.00</strong>, you'd need:</p>
                  <p class="breakeven-sessions">2 more sessions averaging $37.50</p>
                </Message>
                <div class="breakeven-details">
                  <p>Recent Loss of <strong>$160.00</strong> would take 4 winning sessions to recover</p>
                  <p>Based on your average win of <strong>$37.50</strong> from 3 winning sessions</p>
                </div>
              </div>
            </template>
          </Card>

          <!-- Casino Locations Map -->
          <Card>
            <template #title>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <img src="https://api.iconify.design/mdi/map-marker.svg?color=%23fff" class="title-icon" alt="Location">
                Casino Locations
              </div>
            </template>
            <template #content>
              <div class="map-container">
                <div class="map-placeholder">
                  <span class="map-text">Map</span>
                  <div class="map-pin winning-pin" style="top: 20%; left: 25%;"></div>
                  <div class="map-pin losing-pin" style="bottom: 20%; right: 25%;"></div>
                </div>
              </div>
              <div class="map-legend">
                <div class="legend-item">
                  <span class="legend-dot winning"></span>
                  <span>Winning Location</span>
                </div>
                <div class="legend-item">
                  <span class="legend-dot losing"></span>
                  <span>Losing Location</span>
                </div>
              </div>
            </template>
          </Card>
        </div>

        <!-- What You Could've Had -->
        <Card class="full-width">
          <template #title>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <img src="https://api.iconify.design/mdi/lightbulb-on.svg?color=%23fff" class="title-icon" alt="Idea">
              What You Could've Had Instead
            </div>
          </template>
          <template #content>
            <p class="couldve-intro">Your net loss of <strong class="negative">105.00</strong> could've been...</p>
            <div class="grid-2col">
              <div class="couldve-items">
                <Skeleton v-for="i in 3" :key="i" height="48px" />
              </div>
              <div class="couldve-quotes">
                <Skeleton v-for="i in 3" :key="i" height="48px" />
              </div>
            </div>
          </template>
        </Card>
        <MoodMoney></MoodMoney>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Message from 'primevue/message';
import Divider from 'primevue/divider';
import Skeleton from 'primevue/skeleton';
import LogOutButton from '@/components/LogOutButton.vue';
import MoodMoney from '@/components/MoodMoney.vue';

const router = useRouter();

const tabs = [
  { name: 'Dashboard', icon: 'chart-arc' },
  { name: 'All My Visits', icon: 'clock' },
  { name: 'Fun Spin', icon: 'dice' },
  { name: 'Map', icon: 'map' },
  { name: 'Rating', icon: 'star', routeName: 'rating'}
];

const activeTab = ref('Dashboard');
const chartPeriod = ref('m');

const handleTabClick = (tab) => {
  activeTab.value = tab.name;
  if (tab.routeName) {
    router.push({ name: tab.routeName });
  } else if (tab.route) {
    router.push(tab.route);
  }
};
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
  width: 60px;
  height: 60px;
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

.title-icon {
  width: 1.125rem;
  height: 1.125rem;
}

.main-content {
  padding: 2rem;
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

.couldve-items, .couldve-quotes {
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

  .nav-tabs {
    overflow-x: auto;
  }
}
</style>
