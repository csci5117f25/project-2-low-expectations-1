import { createRouter, createWebHistory } from 'vue-router'
import SplashPage from '@/views/SplashPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'splashpage',
      component: SplashPage,
      // meta: {loggedIn: true}
    },
  ],
})

export default router
