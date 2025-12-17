<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore'
import { db, auth } from '@/firebase_conf'
import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'
import Textarea from 'primevue/textarea'
import Rating from 'primevue/rating'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'

const route = useRoute()
const router = useRouter()
const visitId = route.params.id

const casinoName = ref('')
const visitDate = ref(null)
const profit = ref(0)
const mood = ref(3)
const notes = ref('')
const originalData = ref(null)

const isEditing = ref(false)
const loading = ref(true)
const saving = ref(false)
const error = ref('')

onMounted(async () => {
  try {
    const user = auth.currentUser
    if (!user) {
      error.value = 'You must be logged in.'
      return
    }
    const visitRef = doc(db, 'users', user.uid, 'casinoVisits', visitId)
    const snap = await getDoc(visitRef)
    if (!snap.exists()) {
      error.value = 'Visit not found.'
      return
    }
    const data = snap.data()
    originalData.value = data
    casinoName.value = data.casinoName || ''
    visitDate.value = data.visitDate?.toDate() || null
    profit.value = data.profit || 0
    mood.value = data.mood || 3
    notes.value = data.notes || ''
  } catch (e) {
    console.error(e)
    error.value = 'Failed to load visit.'
  } finally {
    loading.value = false
  }
})

const startEdit = () => {
  isEditing.value = true
}

const cancelEdit = () => {
  if (!originalData.value) return
  casinoName.value = originalData.value.casinoName || ''
  visitDate.value = originalData.value.visitDate?.toDate() || null
  profit.value = originalData.value.profit || 0
  mood.value = originalData.value.mood || 3
  notes.value = originalData.value.notes || ''
  isEditing.value = false
}

const saveEdit = async()=> {
  saving.value = true
  try {
    const user = auth.currentUser
    if (!user) return
    const visitRef = doc(db, 'users', user.uid, 'casinoVisits', visitId)
    await updateDoc(visitRef, {
      casinoName: casinoName.value,
      visitDate: visitDate.value ? Timestamp.fromDate(visitDate.value) : null,
      profit: Number(profit.value),
      mood: Number(mood.value),
      notes: notes.value
    })
    originalData.value = {
      casinoName: casinoName.value,
      visitDate: Timestamp.fromDate(visitDate.value),
      profit: profit.value,
      mood: mood.value,
      notes: notes.value
    }
    isEditing.value = false
  } catch (e) {
    console.error(e)
    error.value = 'Failed to save changes.'
  } finally {
    saving.value = false
  }
}
const isAllFieldFilled = ()=> {
  return (
    casinoName.value.trim() !== '' && visitDate.value !== null &&
    profit.value !== null && mood.value !== null
  )
}

const goBack = () => {
  router.push('/visits')
}
</script>

<template>
  <div class="page">
    <h2>Edit Your Visit</h2>
    <div v-if="loading">Loading...</div>
    <div v-else-if="error">{{ error }}</div>
    <div v-else class="form">
      <label>Casino Name *</label>
      <InputText v-model="casinoName" :disabled="!isEditing" placeholder="Enter casino name..."/>
      <label>Date *</label>
      <DatePicker v-model="visitDate" :disabled="!isEditing" showIcon />
      <label>Profit($) *</label>
      <InputNumber v-model="profit" :disabled="!isEditing" placeholder="Enter number only."/>
      <label>Mood *</label>
      <Rating v-model="mood" :disabled="!isEditing" :cancel="false" />
      <label>Notes</label>
      <Textarea v-model="notes" :disabled="!isEditing" rows="4" />
      <div class="actions">
        <Button label="Back" text @click="goBack" />
        <Button
          v-if="!isEditing"
          label="Edit"
          icon="pi pi-pencil"
          @click="startEdit"
        />
        <Button
          v-if="isEditing"
          label="Cancel"
          severity="secondary"
          outlined
          @click="cancelEdit"
        />
        <Button
          v-if="isEditing"
          label="Save"
          icon="pi pi-check"
          :loading="saving"
          :disabled="!isAllFieldFilled()"
          @click="saveEdit"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}
.form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}
</style>
