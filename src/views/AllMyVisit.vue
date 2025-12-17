<template>
  <div class="dashboard-container">
    <Header />
    <div class="dashboard-content">
      <NavTabs />
      <main class="main-content">
        <h2 class="section-title">My Visits</h2>
        <div v-for="visit in visits" :key="visit.id" class="visit-card">
          <div class="visit-header">
            <div>
              {{ visit.casinoName?.toUpperCase()}}
              <!-- <span v-if="visit.mood>= 5"> 🤩</span>
              <span v-else-if="visit.mood===4"> 😄</span>
              <span v-else-if="visit.mood===3"> 🙂</span>
              <span v-else-if="visit.mood===2"> 🙁</span>
              <span v-else> 😖</span> -->
            </div>
            <div class="profit" :class="visit.profit >= 0 ? 'positive' : 'negative'">
              {{ visit.profit >= 0 ? '+' : '' }} ${{ visit.profit }}
              <div class="date">
                {{ visit.visitDate?.toLocaleDateString() }}
              </div>
            </div>
          </div>
          <p class="notes">Notes: {{ visit.notes || 'No notes recorded.'}}</p>
          <div class="visit-actions">
            <Button
              icon="pi pi-pencil"
              severity="secondary"
              rounded
              @click="gotoEditPage(visit.id)"
            />
            <Button
              icon="pi pi-trash"
              severity="danger"
              rounded
              @click="deleteVisit(visit.id)"
            />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { collection, getDocs, orderBy, query, doc, deleteDoc } from 'firebase/firestore'
import { db, auth } from '@/firebase_conf'
import { useRouter } from 'vue-router'
import Header from './Header.vue'
import NavTabs from './NavTabs.vue'
import Button from 'primevue/button'

const router = useRouter()
const gotoEditPage = (id) => {
  router.push('/visits/'+id)
}

const deleteVisit = async(visitId) => {
  const ok = window.confirm('Can you confirm that you want to delete this visit?')
  if (!ok) return
  try {
    const user = auth.currentUser
    if (!user) return
    await deleteDoc(
      doc(db, 'users', user.uid, 'casinoVisits', visitId)
    )
    visits.value = visits.value.filter(v=>v.id !== visitId)
  } catch (e) {
    console.error('Failed to delete visit:', e)
  }
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

.main-content {
  padding: 2rem;
  width: 100%;
  box-sizing: border-box;
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

.profit.positive {
  color: var(--green-500);
}

.profit.negative {
  color: var(--red-500);
}

.date {
  font-size: 0.8rem;
  color: var(--text-gray, #b5acac);
  margin-top: 0.25rem;
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

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }

  .visit-card {
    padding: 1rem;
  }

  .visit-header {
    flex-direction: column;
    gap: 0.5rem;
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
}

@media (max-width: 480px) {
  .main-content {
    padding: 0.75rem;
  }

  .dashboard-content {
    padding-top: 160px;
  }
}
</style>
