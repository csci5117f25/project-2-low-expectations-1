import { createRouter, createWebHistory } from 'vue-router'
import SplashPage from '@/views/SplashPage.vue'
import DashboardView from '@/views/DashboardView.vue'
import RateView from '@/views/RateView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'splashpage',
      component: SplashPage,
      meta: {loggedIn: true}
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/rating',
      name: 'rating',
      component: RateView,
      meta: { requiresAuth: true }
    }
  ],
})

export default router
