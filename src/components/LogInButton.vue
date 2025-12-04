<script>
  const provider = new GoogleAuthProvider()
</script>

<script setup>
  import {  useFirebaseAuth } from 'vuefire'
  import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
  import { doc, getDoc, setDoc } from 'firebase/firestore'
  import { db } from '@/firebase_conf'
  import router from '@/router'
  import Button  from 'primevue/button'


  const auth = useFirebaseAuth()
  async function login() {
    try {
      const result = await signInWithPopup(auth,provider)

      const docRef = doc(db, 'users', result.user.uid)
      const docSnap = await getDoc(docRef)

      if(!docSnap.exists()) {
        await setDoc(docRef, {
          name: result.user.displayName,
          email: result.user.email,
          creationTime: result.user.metadata.creationTime

        })
        console.log("Successfully add new user")
      } else {
        console.log("User already exists")
      }
      router.push('/dashboard')
    } catch {
      alert("login failed")
    }
  }

</script>

<template>
  <Button class="log-in-btn" label="Log in with Google" icon="pi pi-google" @click="login"></Button>
</template>

<style scoped> 
.log-in-btn.p-button {
  background: #3d1053;
  color: var(--text-color-secondary);
  border: 1px solid whitesmoke;
  padding: 12px 20px;
  border-radius: 10px;
}

.log-in-btn.p-button:hover {
  background: var(--primary-color);
  border: 1px solid whitesmoke;
  color: var(--text-color-secondary);
}
</style>