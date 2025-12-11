<script setup>
import { ref } from 'vue'
import { db } from '@/firebase_conf.js'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import DatePicker from 'primevue/calendar'
import Rating from 'primevue/rating'
import Textarea from 'primevue/textarea'

const visible = ref(false)
const casinoName = ref('')
const visitDate = ref(new Date()) //auto set to today
const initialAmount = ref(null)
const cashOutAmount = ref(null)
const mood = ref(0)
const notes = ref('')
const logVisit = async () => {
  const initial = Number(initialAmount.value) || 0
  const cashout = Number(cashOutAmount.value) || 0
  const profit = cashout - initial
  try {
    await addDoc(collection(db, 'casinoVisits'), {
      casinoName: casinoName.value,
      visitDate: visitDate.value,
      initialAmount: initial,
      cashOutAmount: cashout,
      profit: profit,
      mood: mood.value,
      notes: notes.value,
      createdAt: serverTimestamp(),
    })
    // resetting the fields
    casinoName.value = ''
    visitDate.value = null
    initialAmount.value = 0
    cashOutAmount.value = 0
    mood.value = 0
    notes.value = ''
    visible.value = false
  } catch (e) {
    console.error('Error logging the form:', e)
  }
}
</script>

<template>
  <Dialog header="Log your Casino Visit" v-model:visible="visible" :modal="true" :closable="true">
    <div class="logvisit-form-container">
      <div class="form-field">
        <label for="casino-name">Casino Name: </label>
        <InputText id="casino-name" v-model="casinoName" placeholder="Name, location..." />
      </div>
      <div class="form-field">
        <label for="visit-date">Visit Date: </label>
        <DatePicker
          id="visit-date"
          v-model="visitDate"
          showIcon
          fluid
          iconDisplay="input"
          dateFormat="yy-mm-dd"
        />
      </div>
      <div class="form-field">
        <label for="buyIn">Initial Amount: </label>
        <InputGroupAddon>$</InputGroupAddon>
        <InputText id="initlal_amt" v-model="initialAmount" type="number" placeholder="Enter only number." />
      </div>
      <div class="form-field">
        <label for="cashOut">Cash Out Amount: </label>
        <InputGroupAddon>$</InputGroupAddon>
        <InputText id="cashout_amt" v-model="cashOutAmount" type="number" placeholder="Enter only number." />
      </div>
      <div class="form-field">
        <label for="mood">Mood: </label>
        <Rating rounded id="mood" v-model="mood" :stars="5" cancel />
      </div>
      <div class="form-field">
        <label for="notes">Notes: </label>
        <Textarea id="notes" v-model="notes" rows="4" placeholder="Add notes about vist here..." />
      </div>
      <div class="form-actions">
        <Button label="Cancel" class="p-button-text" @click="visible = false" />
        <Button label="Log Visit" @click="logVisit" />
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
.logvisit-form-container {
  display: flex;
  flex-direction: column;
  gap: var(--gap-large);
  background: var(--surface-card);
  padding: 1.5rem 18rem;
  border-radius: var(--radius-large);
  border: 1px solid var(--form-border);
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--gap-small);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--gap-medium);
  margin-top: 0.75rem;
}

.p-InputGroupAddon {
  margin-right: 0.25rem;
}

.p-inputtext,
.p-calendar,
.p-inputtextarea {
  background: #2b2b2b;
  width: 100%;
  border-radius: var(--radius-medium);
  border: 1px solid var(--form-border);
  color: var(--text-primary);
  font-size: 1rem;
  padding: 0.75rem 1rem;
}

.p-rating {
  display: flex;
  gap: 0.5rem;
  background: transparent;
  padding: 0;
}

.p-inputtext:focus,
.p-calendar:focus-within,
.p-inputtextarea:focus,
.p-rating:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px var(--primary-color-light);
}

.p-dialog .p-dialog-header {
  background: var(--surface-card);
  text-transform: uppercase;
  letter-spacing: 2px;
}
.p-diaglog .p-dialog-content {
  background: var(--surface-card);
}

.p-button {
  font-size: 1rem;
  padding: 0.65rem 1.25rem;
  border-radius: var(--radius-medium);
}

.p-diaglog .p-footer {
  background: var(--surface-card);
  padding-top: 1.25rem;
}

.p-button.p-button-text {
  color: var(--text-secondary);
}
</style>
