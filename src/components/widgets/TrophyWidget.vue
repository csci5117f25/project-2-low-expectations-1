<script setup>
import { ref, onMounted } from 'vue'
import { collection, onSnapshot } from 'firebase/firestore'
import { useCurrentUser } from 'vuefire'
import { db } from '@/firebase_conf'
import Card from 'primevue/card'

const user = useCurrentUser()
const maxValue = ref(null)
const minValue = ref(null)

onMounted(async () => {
  if (!user.value) return
  const userID = user.value.uid
  const visitRef = collection(db, 'users', userID, 'casinoVisits')
  onSnapshot(visitRef, (snapshot) => {
    let min = 0
    let max = 0
    snapshot.forEach((docSnap) => {
      const data = docSnap.data()
      if (!data.profit) return
      if (data.profit > max) {
        max = data.profit
      }
      if (data.profit < min) {
        min = data.profit
      }
    })
    maxValue.value = max
    minValue.value = min
  })
})
</script>

<template>
  <div class="grid-2col">
    <Card>
      <template #title> Biggest Win and Loss </template>
      <template #content>
        <div class="icons">
          <div class="max">
            <i class="pi pi-sort-up-fill" style="color: green"></i>
            <p>{{ maxValue }}</p>
          </div>
          <div class="min">
            <i class="pi pi-sort-down-fill" style="color: red"></i>
            <p>{{ minValue }}</p>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<style>
.icons {
  display: flex;
  justify-content: center;
  gap: 3rem;
}

.max,
.min {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 1.5rem;
  font-weight: bold;
}

.max i,
.min i {
  font-size: 2.5rem;
}
</style>
