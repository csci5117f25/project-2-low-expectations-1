<script setup>
import { ref, onMounted } from 'vue'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db, auth } from '@/firebase_conf'
import { useRouter } from 'vue-router'
import NavBar from './NavBar.vue'
import Button from 'primevue/button'

const router = useRouter()
const gotoEditPage = (id) => {
  router.push('/visits/'+id)
}
const visits = ref([])
onMounted(async () => {
  const user = auth.currentUser
  if (!user) return
  const userVisitsRef = collection(db, 'users', user.uid, 'casinoVisits')
  const q = query(userVisitsRef, orderBy('visitDate', 'desc'))
  const snapshot = await getDocs(q)
  visits.value = snapshot.docs.map((doc) => {
    return {id: doc.id, ...doc.data(), visitDate:doc.data().visitDate?.toDate()}
  })
})
</script>

<template>
  <NavBar />
  <div class="visits-container">
    <h2 class="section-title">All My Visits</h2>
    <div v-for="visit in visits" :key="visit.id" class="visit-card">
      <div class="visit-header">
        <div>
          {{ visit.casinoName?.toUpperCase()}}
          <span v-if="visit.mood>= 5"> 🤩</span>
          <span v-else-if="visit.mood===4"> 😄</span>
          <span v-else-if="visit.mood===3"> 🙂</span>
          <span v-else-if="visit.mood===2"> 🙁</span>
          <span v-else> 😖</span>
        </div>
        <div class="profit" :class="visit.profit >= 0 ? 'positive' : 'negative'">
          {{ visit.profit >= 0 ? '+':'' }} ${{ visit.profit }}
          <div class="date">
            {{ visit.visitDate?.toLocaleDateString() }}
          </div>
        </div>
      </div>
      <p class="notes">Notes: {{ visit.notes }}</p>
    <div class="visit-actions">
      <span class="tag" :class="visit.profit >= 0 ? 'positive' : 'negative'">
        {{ visit.profit >= 0 ? 'W':'L' }} Day
      </span>

      <Button
        icon="pi pi-pencil"
        severity="secondary"
        text
        rounded
        @click="gotoEditPage(visit.id)"
      />
      </div>
    </div>
  </div>
</template>

<style scoped>
.visits-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
.section-title {
  font-family: 'Cinzel', serif;
  margin-bottom: 1.5rem;
}
.visit-card {
  background: var(--surface-card);
  border-radius: var(--radius-large);
  padding: 1.25rem;
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--primary-color);
}
.visit-header {
  display: flex;
  justify-content: space-between;
}
.location {
  color: var(--text-secondary);
  font-size: 0.85rem;
}
.profit.positive {
  color: var(--green-500);
}
.profit.negative {
  color: var(--red-500);
}
.date {
  font-size: 0.8rem;
  color: var(--text-secondary);
}
.notes {
  margin: 0.75rem 0;
  color: var(--text-secondary);
}
.visit-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.tag {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
}
.tag.positive {
  background: rgba(76,175,80,0.15);
  color: var(--green-500);
}
.tag.negative {
  background: rgba(244,67,54,0.15);
  color: var(--red-500);
}

@media (max-width: 768px) {
  .visits-container {
    padding: 1.5rem 1rem;
  }
  .visit-card {
    padding: 1rem;
  }
  .visit-header {
    flex-direction: column;
    gap: 0.5rem;
  }
  .casino-title {
    font-size: 0.95rem;
    font-weight: 600;
  }
  .profit {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9rem;
  }
  .date {
    font-size: 0.75rem;
  }
  .notes {
    font-size: 0.85rem;
  }
}
</style>
