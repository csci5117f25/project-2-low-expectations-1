<script setup>
import { ref, watch } from 'vue'
import { useCurrentUser } from 'vuefire'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase_conf'
import { useRouter } from 'vue-router'

import Rating from 'primevue/rating'
import FloatLabel from "primevue/floatlabel"
import Textarea from "primevue/textarea"
import Button from 'primevue/button'
import Message from 'primevue/message'

const router = useRouter()
const user = useCurrentUser()
const rating = ref(null)
const journal = ref('')
const errors = ref({})

watch(rating, async (newVal) => {
    const currentUser = user.value
    if (!currentUser) return
    const userID = currentUser.uid
    try {
        const ratingDoc = doc(db, 'users', userID)
        await setDoc(ratingDoc, { rating: newVal }, { merge: true })
    } catch (err) {
        console.error('Error saving rating:', err)
    }
})

const goBack = () => {
  router.push({ name: 'dashboard' })
}
</script>

<template>
  <div class="page-container">
    <div class="page-content">
      <header class="page-header">
        <h1>Journal & Mood Tracker</h1>
        <p>Record your rating and notes</p>
      </header>
      <div class="back-btn-container">
        <Button
            label="← Back to Dashboard"
            severity="secondary"
            outlined
            @click="goBack"
        />
        </div>

      <main class="main-cards">
        <!-- Rating Card -->
        <div class="card">
          <div class="card-title">Rate Your Mood</div>
          <div class="card-content">
            <Rating v-model="rating" class="rating">
              <template #onicon>
                <img src="https://primefaces.org/cdn/primevue/images/rating/custom-onicon.png" height="32" width="32" />
              </template>
              <template #officon>
                <img src="https://primefaces.org/cdn/primevue/images/rating/custom-officon.png" height="32" width="32" />
              </template>
            </Rating>
            <Message v-if="errors.rating" severity="error" size="small">{{ errors.rating }}</Message>
          </div>
        </div>

        <!-- Journal Card -->
        <div class="card">
          <div class="card-title">Journal Entry</div>
          <div class="card-content">
            <FloatLabel variant="on" class="floatlabel-full">
              <Textarea
                v-model="journal"
                rows="10"
                class="p-inputtext"
                style="width: 100%; resize: none"
              />
              <label>Write your thoughts...</label>
            </FloatLabel>
            <Message v-if="errors.journal" severity="error" size="small">{{ errors.journal }}</Message>
            <Button label="Submit" class="submit-btn" @click="onFormSubmit" />
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  min-height: 100vh;
  background: var(--surface-ground);
  display: flex;
  justify-content: center;
  padding: 2rem 1rem;
}

.page-content {
  max-width: 800px;
  width: 100%;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: bold;
  color: var(--text-color);
}

.page-header p {
  margin: 0.25rem 0 0;
  color: var(--text-color-secondary);
  font-size: 1rem;
}

/* Cards */
.main-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.card {
  background: var(--surface-card);
  border-radius: 1rem;
  box-shadow: 0 8px 20px rgba(0,0,0,0.05);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card-title {
  font-weight: bold;
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.floatlabel-full {
  width: 100%;
}


.rating img {
  width: 32px;
  height: 32px;
  transition: transform 0.2s;
}
.rating img:hover {
  transform: scale(1.2);
}

.submit-btn {
  align-self: flex-start;
  background-color: var(--primary-color);
  color: white;
  font-weight: bold;
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  transition: background-color 0.2s, transform 0.2s;
}
.submit-btn:hover {
  background-color: var(--primary-color-hover, #2563eb);
  transform: translateY(-1px);
}

.back-btn-container {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: flex-start;
}

@media (max-width: 768px) {
  .main-cards {
    grid-template-columns: 1fr;
  }
}
</style>
