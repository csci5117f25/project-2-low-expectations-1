import { createRouter, createWebHistory } from 'vue-router'
import SplashPage from '@/views/SplashPage.vue'
import DashboardView from '@/views/DashboardView.vue'
/* import WishList from '@/views/WishList.vue' */
/* import AllMyVisit from '@/components/AllMyVisit.vue' */
import PracticePage from '@/views/PracticePage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'splashpage',
      component: SplashPage,
      meta: { loggedIn: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    /** add this back later after merging with the other 2 branches
    {
      path: '/visits',
      name: 'visits',
      component: AllMyVisit,
      meta: { requiresAuth: true }
    },
    {
      path: '/wishlist',
      name: 'wishlist',
      component: WishList,
      meta: { requiresAuth: true }
    }, */
    {
      path: '/practice',
      name: 'practice',
      component: PracticePage,
      meta: { requiresAuth: true },
    },
  ],
})

export default router
