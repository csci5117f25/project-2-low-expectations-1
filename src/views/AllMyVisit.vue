<template>
  <div class="dashboard-container">
    <Header />
    <div class="dashboard-content">
      <NavTabs />
      <main class="main-content">
        <h2 class="section-title">My Visits</h2>
        <div
          v-for="(visit, index) in visits"
          :key="visit.id"
          class="visit-card"
          :style="{ backgroundImage: `url(/${getCardImage(index)})` }"
        >
          <div class="card-overlay"></div>
          <div class="card-content">
            <div class="visit-header">
              <div class="casino-name">
                {{ visit.casinoName?.toUpperCase()}}
              </div>
              <div class="profit" :class="visit.profit >= 0 ? 'positive' : 'negative'">
                {{ visit.profit >= 0 ? '+' : '' }} ${{ visit.profit }}
                <div class="date">
                  {{ formatDate(visit.visitDate) }}
                </div>
              </div>
            </div>
            <p class="notes">Notes: {{ visit.notes || 'No notes recorded.'}}</p>
            <div class="visit-actions">
              <Button
                icon="pi pi-pencil"
                severity="info"
                rounded
                @click="openEditDialog(visit)"
              />
              <Button
                icon="pi pi-trash"
                severity="danger"
                rounded
                @click="deleteVisit(visit.id)"
              />
            </div>
          </div>
        </div>
        <Dialog
        v-model:visible="editDialogVisible"
        header="Edit Visit"
        modal
        :style="{ width: '90vw', maxWidth: '500px' }"
        class="edit-dialog"
        >
        <div class="form-content">
            <div class="field">
              <label>Casino</label>
              <Select
              v-model="editForm.casinoName"
              :options="casinos"
              optionLabel="name"
              optionValue="name"
              placeholder="Select a Casino"
              fluid
              />
            </div>
            <div class="field">
              <label>Date</label>
              <DatePicker v-model="editForm.visitDate" showIcon fluid />
            </div>

            <div class="field">
              <label>Cash In Amount </label>
              <InputNumber v-model="editForm.initialAmount" mode="currency" currency="USD" fluid />
            </div>

            <div class="field">
              <label>Cash Out Amount </label>
              <InputNumber v-model="editForm.cashOutAmount" mode="currency" currency="USD" fluid />
            </div>

             <div class="field">
              <label>Mood</label>
              <div class="rating-container">
                <Rating v-model="editForm.mood" :cancel="false" />
              </div>
            </div>
          <div class="field">
              <label>Notes</label>
              <Textarea v-model="editForm.notes" rows="4" fluid />
            </div>
          </div>

          <template #footer>
            <Button label="Cancel" icon="pi pi-times" text @click="editDialogVisible = false" />
            <Button label="Save" icon="pi pi-check" @click="saveEdit" :loading="saving" />
          </template>
        </Dialog>
        <ConfirmDialog />


      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { collection, getDocs, orderBy, query, doc, deleteDoc, updateDoc, Timestamp} from 'firebase/firestore'
import { useToast } from 'primevue'
import { db, auth } from '@/firebase_conf'
import Header from './Header.vue'
import NavTabs from './NavTabs.vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import DatePicker from 'primevue/datepicker'
import Textarea from 'primevue/textarea'
import Rating from 'primevue/rating'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import { useCollection } from 'vuefire'
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from "primevue/useconfirm";

const confirm = useConfirm();
const toast = useToast()
const user = auth.currentUser
const editDialogVisible = ref(false)
const editingVisitId = ref(null)
const saving = ref(false)
const editForm = ref({
  casinoName: '',
  visitDate: null,
  initialAmount: 0,
  cashOutAmount: 0,
  mood: 0,
  notes: ''
})

const openEditDialog = (visit) => {
  editingVisitId.value = visit.id
  editForm.value = {
    casinoName: visit.casinoName || '',
    visitDate: visit.visitDate?.toDate
      ? visit.visitDate.toDate()
      : (visit.visitDate || new Date()),
    initialAmount: visit.initialAmount || 0,
    cashOutAmount: visit.cashOutAmount || 0,
    mood: visit.mood || 0,
    notes: visit.notes || ''
  }
  editDialogVisible.value = true
}

const saveEdit = async () => {
  if (!editingVisitId.value) return
  saving.value = true
  try {
    if (!user) return

    const visitRef = doc(db, 'users', user.uid, 'casinoVisits', editingVisitId.value)


    const profit = Math.round((editForm.value.initialAmount - editForm.value.cashOutAmount) * 100) / 100
    await updateDoc(visitRef, {
      casinoName: editForm.value.casinoName,
      visitDate: editForm.value.visitDate ? Timestamp.fromDate(editForm.value.visitDate) : null,
      initialAmount: Number(editForm.value.initialAmount),
      cashOutAmount: Number(editForm.value.cashOutAmount),
      profit: profit,
      mood: Number(editForm.value.mood),
      notes: editForm.value.notes
    })

    editDialogVisible.value = false
    toast.add({ severity: 'success', summary: 'Edit saved!', life: 3000 })
  } catch (e) {
    console.error('Failed to update visit:', e)
    alert('Failed to save changes')
  } finally {
    saving.value = false
  }
}

const casinos = useCollection(collection(db,'users', user.uid, 'casinos'))

const deleteVisit = (visitId) => {
  confirm.require({
    message: 'Are you sure you want to delete this log?',
    header: 'Delete Confirmation',
    icon: 'pi pi-info-circle',
    rejectLabel: 'Cancel',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Delete',
      severity: 'danger'
    },
    accept: async () => {
      try {
        if (!user) return

        await deleteDoc(doc(db, 'users', user.uid, 'casinoVisits', visitId))

        toast.add({ severity: 'error', summary: 'Deleted', detail: 'Log deleted successfully', life: 3000 })
      } catch (e) {
        console.error('Failed to delete visit:', e)
      }
    }
  })
}

const getCardImage = (index) => {
  const cards = ['card.jpeg', 'card2.jpeg', 'card3.jpg']
  return cards[index % 3]
}

// const visits = ref([])
const visits = useCollection(
  query(
  collection(db, 'users', user.uid, 'casinoVisits'),
  orderBy('visitDate', 'desc')
))

const formatDate = (dateVal) => {
  if (!dateVal) return ''
  if (dateVal.toDate) return dateVal.toDate().toLocaleDateString()
  return new Date(dateVal).toLocaleDateString()
}
// onMounted(async () => {
//   if (!user) return
//   const userVisitsRef = collection(db, 'users', user.uid, 'casinoVisits')
//   const q = query(userVisitsRef, orderBy('visitDate', 'desc'))
//   const snapshot = await getDocs(q)
//   visits.value = snapshot.docs.map((doc) => {
//     return {id: doc.id, ...doc.data(), visitDate:doc.data().visitDate?.toDate()}
//   })
// })
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
  color: var(--text-color);
}

.visit-card {
  position: relative;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.visit-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to right,
    rgba(30, 30, 50, 0.9) 0%,
    rgba(40, 50, 80, 0.85) 40%,
    rgba(50, 60, 90, 0.7) 60%,
    rgba(60, 70, 100, 0.4) 80%,
    transparent 100%
  );
  z-index: 1;
}

.card-content {
  position: relative;
  z-index: 2;
  max-width: 60%;
}

.visit-header {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.casino-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 1px;
}

.profit {
  font-size: 1.5rem;
  font-weight: bold;
  text-align: left;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.mood-icon {
  width: 20px;
  height: 20px;
  margin-left: 0.5rem;
  vertical-align: -4px;
}

.profit.positive {
  color: #4caf50;
}

.profit.negative {
  color: #ff5252;
}

.date {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 0.25rem;
  font-weight: normal;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.notes {
  margin: 0.75rem 0 1rem 0;
  color: rgba(255, 255, 255, 0.95);
  font-size: 0.95rem;
  line-height: 1.5;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.75rem;
  border-radius: 6px;
  border-left: 3px solid rgba(255, 255, 255, 0.4);
}

.visit-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  justify-content: flex-start;
}

.visit-actions :deep(.p-button) {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.15) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.visit-actions :deep(.p-button:hover) {
  background: rgba(255, 255, 255, 0.25) !important;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.visit-actions :deep(.p-button.p-button-info) {
  color: #64b5f6 !important;
}

.visit-actions :deep(.p-button.p-button-danger) {
  color: #ff5252 !important;
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-top: 0.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.field label {
  font-weight: 600;
  color: var(--text-color);
}

.rating-container {
  display: flex;
  align-items: center;
  height: 40px;
}

@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }

  .visit-card {
    padding: 1rem;
  }

  .card-content {
    max-width: 100%;
  }

  .visit-header {
    gap: 0.5rem;
  }

  .casino-name {
    font-size: 1.1rem;
  }

  .profit {
    font-size: 1.25rem;
  }

  .date {
    font-size: 0.75rem;
  }

  .notes {
    font-size: 0.85rem;
    padding: 0.6rem;
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

  .casino-name {
    font-size: 1rem;
  }

  .profit {
    font-size: 1.1rem;
  }

  .notes {
    font-size: 0.8rem;
  }

  .visit-actions {
    gap: 0.5rem;
  }
}
</style>
