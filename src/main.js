import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { VueFire, VueFireAuth } from 'vuefire'
import { firebaseApp } from './firebase_conf'
import { getCurrentUser } from 'vuefire'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import ToastService from 'primevue/toastservice';
import 'primeicons/primeicons.css'
import './assets/main.css'


const app = createApp(App)

app.use(VueFire, {
  // imported above but could also just be created here
  firebaseApp,
  modules: [
    // we will see other modules later on
    VueFireAuth(),
  ],
})

app.use(PrimeVue, {
    theme: {
        preset: Aura,
    }
});

app.use(ToastService);

router.beforeEach(async (to) => {
  // routes with `meta: { requiresAuth: true }` will check for
  // the users, others won't
  if (to.meta.requiresAuth) {
    const currentUser = await getCurrentUser()
    // if the user is not logged in, redirect to the login page
    if (!currentUser) {
      return {
        path: '/',
        query: {
          // we keep the current path in the query so we can
          // redirect to it after login with
          // `router.push(route.query.redirect || '/')`
          redirect: to.fullPath,
        },
      }
    }
  }
  if(to.meta.loggedIn) {
    const currentUser = await getCurrentUser()
    if (currentUser) {
      return {
        path: '/dashboard',//change this path to home view!!!
        query: {
          // we keep the current path in the query so we can
          // redirect to it after login with
          // `router.push(route.query.redirect || '/')`
          redirect: to.fullPath,
        },
      }
    }
  }
})

app.use(router)

app.mount('#app')
