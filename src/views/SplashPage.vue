<script setup>
import LogInButton from '@/components/LogInButton.vue';
import FeatureCard from '@/components/FeatureCard.vue';
import Tag from 'primevue/tag';
</script>

<template>
  <div class="landing_page">
    <header class="header">
      <div class="header-left">
        <img src="/playing-cards.png" class="logo" />
        <div class="header-title">
          <h1>Casino Tracker</h1>
          <p>Track your gambling habits responsibly</p>
        </div>
      </div>
    </header>

    <section class="hero">
      <Tag value ="Track Responsibly" severity="secondary" rounded/> 
      <h2 class="hero-title">Take control of Your Gambling Habits</h2>
      <p class="hero-content">
        A simple way to understand your gambling patterns,
        visualize your spending, and make informed decisions.
      </p>
      <LogInButton/>
    </section>
    <section class="card-grid">
      <FeatureCard icon="📈" title="Net Results" description="Track wins/losses and cumulative totals."/>
      <FeatureCard icon="📊" title="Time-Series Charts" description="See your performance over time."/>
      <FeatureCard icon="📍" title="Casino Mapping" description="Pin and view casinos you’ve visited."/>
      <FeatureCard icon="⭐" title="Casino Wishlist" description="Track casinos you want to visit."/>
      <FeatureCard icon="💭" title="Mood Tracking" description="Log your mood during sessions."/>
      <FeatureCard icon="📘" title="Journal Entries" description="Write down any thoughts or notes about your visit." />
    </section>
  </div>
</template>

<style>
.landing_page {
  min-height: 100vh;
  position: relative;
}
.landing_page::before {
  content: "";
  position: absolute;
  inset: 0;
  background: url('/casino-bg.jpg') center/cover no-repeat;
  filter: blur(6px);
  z-index: -1;
  transform: scale(1.1);
}
.header {
  padding: 20px 40px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo {
  height: 60px;
  padding: 2px;
  border: 1px solid white;
  border-radius: 10px;
}
.header-title h1 {
  margin: 0;
  font-size: 30px;
}
.header-title p {
  margin: 0;
  color: var(--text-gray);
}

.hero {
  text-align: center;
  padding: 60px 20px 50px;
  max-width: 800px;
  margin: 0 auto;
}
.hero-content {
  font-family: 'Cinzel', serif;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--text-gray);
  max-width: 600px;
  margin: 0 auto 20px;
}

.subtitle {
  color: var(--p-text-muted-color);
  font-family: 'Oswald', sans-serif;
  font-weight: 400;
  letter-spacing: 2px;
}
.card-grid {
  max-width: 1100px;
  margin: 50px auto;
  display: grid;
  gap: 20px;
  padding: 0 20px 100px;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

@media (max-width: 768px) {
  .header {
    padding: 16px 15px;
  }
  .header-left {
    gap: 8px;
  }
  .header-title h1 {
    font-size: 25px;
  }
  .header-title p {
    font-size: 16px;
  }
  .hero {
    padding: 40px 16px 30px;
  }
  .hero-content {
    font-size: 14px;
    letter-spacing: 1px;
  }
}
</style>