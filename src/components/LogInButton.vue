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
      router.push('/')//Push to homepage later
    } catch {
      alert("login failed")
    }
  }

</script>

<template>
  <Button label="Log in with Google" icon="pi pi-google" @click="login"></Button>
</template>

