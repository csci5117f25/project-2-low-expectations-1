<script setup>
import { ref, watch, computed } from 'vue'
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase_conf'
import { useCurrentUser } from 'vuefire'
import Message from 'primevue/message'

const user = useCurrentUser()
const visits = ref([])
const netResult = ref(0)
const sessionQuote = ref('')

const quotes = {
  up: [
    "You played, took the swings, and still cashed out ahead",
    "The session went green and you had the discipline to lock it in",
    "You beat the game and walked away on time",
    "Profit means you respected the bankroll and the exit",
    "The house blinked first and you took the money",
    "You won because you knew when to stop",
    "Green numbers mean the plan worked today",
    "You survived the variance and left with profit",
    "You turned risk into a clean cash out",
    "Up today and smart enough to keep it that way",
  ],
  down: [
    "You lost money to a system designed to take it from you",
    "The house did exactly what it is built to do",
    "Every extra minute here only makes this number worse",
    "Nothing you do next will fix the money you lossed",
    "Chasing turns small losses into real problems",
    "The game does not know you are due",
    "Staying longer only helps the casino",
    "This is how bankrolls slowly disappear",
    "You already loss enough for today",
    "Walk away now or regret it later",
  ],
  even: [
    "No money was loss or gained, so spend more!",
  ],
}

const pickRandom = (arr) =>
  arr[Math.floor(Math.random() * arr.length)]

const getNetQuote = () => {
  let net = 0
  visits.value.forEach(v => {
    const profit = v.profit || 0
    net += profit
  })
  netResult.value = net
  if (net > 0) sessionQuote.value = pickRandom(quotes.up)
  else if (net < 0) sessionQuote.value = pickRandom(quotes.down)
  else sessionQuote.value = quotes.even[0]
}


watch(user, (currentUser) => {
  if (!currentUser) return
  const userID = currentUser.uid
  const visitRef = collection(db, 'users', userID, 'casinoVisits')
  const q = query(visitRef, orderBy('visitDate', 'asc'))
  onSnapshot(q, (snapshot) => {
    visits.value = [] 
    snapshot.forEach((doc) => {
      const data = doc.data()
      visits.value.push({
        id: doc.id,
        profit: data.profit,
        visitDate: data.visitDate,
        casinoName: data.casinoName,
      })
    })
    getNetQuote()
  })
}, { immediate: true })

const netClass = computed(() => {
  if (netResult.value > 0) return 'quote-up'
  if (netResult.value < 0) return 'quote-down'
  return 'quote-even'
})


</script>

<template>
  <div :class="['quote-banner', netClass]">
    <p class="quote-text">“{{ sessionQuote }}”</p>
  </div>
</template>


<style scoped>
.quote-banner {
  margin: 1rem auto;
  max-width: 700px;
  padding: 1.5rem 2rem;
  border-radius: 16px;
  text-align: center;
  font-family: 'Cinzel', serif;
  font-size: 1.35rem;
  font-style: italic;
  backdrop-filter: blur(8px);
  background: rgba(30, 30, 30, 0.6);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.4);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.quote-banner::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: radial-gradient(circle at top left, transparent, rgba(255,255,255,0.05));
}

.quote-up {
  background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
  color: #aeefff;
  text-shadow: 0 0 6px rgba(174, 239, 255, 0.4);
}

.quote-down {
  background: linear-gradient(135deg, #2c2c2c, #1a1a1a);
  color: #ff9e9e;
  text-shadow: 0 0 6px rgba(255, 158, 158, 0.3);
}

.quote-even {
  background: linear-gradient(135deg, #3a3a3a, #4a4a4a);
  color: #cccccc;
  text-shadow: 0 0 6px rgba(255, 255, 255, 0.2);
}

.quote-text {
  margin: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-height: 1.6;
}

</style>
