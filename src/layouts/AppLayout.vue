<template>
  <div class="app-layout">
    <!-- Navigation Header -->
    <nav class="nav-header">
      <div class="nav-brand">
        <router-link to="/discovery" class="brand-link">
          <h1>Circle</h1>
        </router-link>
      </div>
      
      <div class="nav-menu">
        <router-link 
          to="/discovery" 
          class="nav-item"
          :class="{ active: $route.name === 'Discovery' }"
        >
          Discovery
        </router-link>
        <router-link 
          to="/history" 
          class="nav-item"
          :class="{ active: $route.name === 'EventHistory' }"
        >
          Event History
        </router-link>
        <router-link 
          to="/manage" 
          class="nav-item"
          :class="{ active: $route.name === 'EventManager' }"
        >
          Manage Events
        </router-link>
        <router-link 
          to="/profile" 
          class="nav-item"
          :class="{ active: $route.name === 'Profile' }"
        >
          Profile
        </router-link>
      </div>
      
      <div class="nav-user" v-if="user">
        <button class="btn-logout" @click="logout">Logout</button>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script>
import { useAuth } from '../composables/useAuth.js'

export default {
  name: 'AppLayout',
  setup() {
    const { user, logout: authLogout, initAuth } = useAuth()
    
    return {
      user,
      authLogout
    }
  },
  computed: {
    currentUsername() {
      return this.user?.username || 'User'
    }
  },
  methods: {
    logout() {
      this.authLogout()
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  background-color: #f8fafc;
}

.nav-header {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2rem 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-brand .brand-link {
  text-decoration: none;
  color: inherit;
}

.nav-brand h1 {
  color: #42b883;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.nav-menu {
  display: flex;
  gap: 3rem;
}

.nav-item {
  color: #6b7280;
  font-size: 1.125rem;
  font-weight: 500;
  text-decoration: none;
  padding: 0.75rem 0;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  position: relative;
}

.nav-item:hover {
  color: #374151;
}

.nav-item.active {
  color: #42b883;
  border-bottom-color: #42b883;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 1rem;
}


.btn-logout {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-logout:hover {
  background: #dc2626;
}

.main-content {
  width: 95%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

@media (max-width: 768px) {
  .nav-header {
    padding: 1.5rem;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .nav-menu {
    gap: 2rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .main-content {
    padding: 2rem 1rem;
  }
}
</style>
