import { createRouter, createWebHistory } from 'vue-router'
import DiscoveryPage from '../pages/DiscoveryPage.vue'
import EventHistoryPage from '../pages/EventHistoryPage.vue'
import ProfilePage from '../pages/ProfilePage.vue'
import EventManagerPage from '../pages/EventManagerPage.vue'
import LoginPage from '../pages/LoginPage.vue'
import AppLayout from '../layouts/AppLayout.vue'
import { useAuth } from '../composables/useAuth.js'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/discovery'
      },
      {
        path: 'discovery',
        name: 'Discovery',
        component: DiscoveryPage,
        meta: { requiresAuth: true }
      },
      {
        path: 'history',
        name: 'EventHistory',
        component: EventHistoryPage,
        meta: { requiresAuth: true }
      },
      {
        path: 'manage',
        name: 'EventManager',
        component: EventManagerPage,
        meta: { requiresAuth: true }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: ProfilePage,
        meta: { requiresAuth: true }
      }
    ]
  },
  {
    path: '/:catchAll(.*)',
    redirect: '/discovery'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Route guards
router.beforeEach((to, from, next) => {
  const { isAuthenticated, initAuth } = useAuth()
  
  // Initialize auth state from localStorage
  initAuth()
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    // Redirect to login if not authenticated
    next('/login')
  } else if (to.name === 'Login' && isAuthenticated.value) {
    // Redirect to discovery if already authenticated and trying to access login
    next('/discovery')
  } else {
    next()
  }
})

export default router
