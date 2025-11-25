import { createRouter, createWebHistory } from 'vue-router'
import SplashPage from '@/views/SplashPage.vue'
import DashboardView from '@/views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'splashpage',
      component: SplashPage,
      // meta: {loggedIn: true}
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
    },
  ],
})

export default router
