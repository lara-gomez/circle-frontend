<template>
  <div class="app-layout">
    <!-- Navigation Header -->
    <nav class="nav-header">
      <div class="nav-container">
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
    async logout() {
      await this.authLogout()
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  width: 100vw;
  background-color: #f8f9fa;
}

.nav-header {
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  padding: 1.5rem 0;
  display: flex;
  justify-content: center;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid #e5e7eb;
  overflow: hidden;
}

.nav-container {
  width: 100%;
  max-width: 1600px; /* Wider max-width for desktop */
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4rem; /* Increased padding for more margin */
}

.nav-brand .brand-link {
  text-decoration: none;
  color: inherit;
}

.nav-brand h1 {
  color: #2f3e46;
  font-size: 2rem; /* Larger for desktop */
  font-weight: 600; /* Bolder for desktop */
  margin: 0;
  letter-spacing: -0.025em;
}

.nav-menu {
  display: flex;
  gap: 2.5rem; /* More spacing for desktop */
  align-items: center;
  flex-wrap: nowrap;
}

.nav-item {
  color: #52796f;
  font-size: 1.1rem; /* Larger font for desktop */
  font-weight: 500;
  text-decoration: none;
  padding: 1rem 1.5rem; /* More generous padding */
  border-radius: 12px; /* More rounded for modern look */
  transition: all 0.3s ease;
  position: relative;
  border: none;
  white-space: nowrap;
}

.nav-item:hover {
  color: #2f3e46;
  background-color: #e8f0ea;
  transform: translateY(-1px); /* Subtle lift effect */
  box-shadow: 0 2px 8px rgba(132, 169, 140, 0.15);
}

.nav-item.active {
  color: #2f3e46;
  background-color: #e8f0ea;
  font-weight: 600;
  box-shadow: 0 1px 4px rgba(132, 169, 140, 0.2);
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 1.5rem; /* More spacing for desktop */
  flex-shrink: 0;
  max-width: 300px; /* Increased max width */
}


.btn-logout {
  background: #84a98c;
  color: white;
  border: none;
  padding: 1rem 2rem; /* Larger padding for desktop */
  border-radius: 12px; /* More rounded */
  font-size: 1rem; /* Larger font */
  font-weight: 600; /* Bolder */
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(132, 169, 140, 0.2);
  white-space: nowrap;
}

.btn-logout:hover {
  background: #74a077;
  transform: translateY(-1px); /* More pronounced lift */
  box-shadow: 0 4px 12px rgba(132, 169, 140, 0.3);
}

.main-content {
  width: 100%;
  max-width: 1600px; /* Match navbar width */
  margin: 0 auto; /* Center the content */
  padding: 3rem 5rem; /* Increased horizontal padding for more margin */
  background-color: #f8f9fa;
  box-sizing: border-box;
  min-height: calc(100vh - 120px); /* Account for larger navbar */
}

/* Desktop-first responsive design */
@media (max-width: 1600px) {
  .nav-container {
    padding: 0 3.5rem;
  }
  .main-content {
    padding: 3rem 4rem;
  }
}

@media (max-width: 1400px) {
  .nav-container {
    padding: 0 3rem;
  }
  .main-content {
    padding: 2.5rem 3.5rem;
  }
  .nav-menu {
    gap: 2rem;
  }
}

@media (max-width: 1200px) {
  .nav-container {
    padding: 0 2.5rem;
  }
  .main-content {
    padding: 2rem 3rem;
  }
  .nav-menu {
    gap: 1.5rem;
  }
  .nav-item {
    padding: 0.875rem 1.25rem;
    font-size: 1rem;
  }
  .nav-brand h1 {
    font-size: 1.75rem;
  }
}

@media (max-width: 1024px) {
  .nav-container {
    padding: 0 2rem;
  }
  .main-content {
    padding: 2rem 2.5rem;
  }
  .nav-menu {
    gap: 1.25rem;
  }
  .nav-item {
    padding: 0.75rem 1rem;
    font-size: 0.95rem;
  }
  .nav-brand h1 {
    font-size: 1.5rem;
  }
  .btn-logout {
    padding: 0.875rem 1.5rem;
    font-size: 0.95rem;
  }
}

@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 1.5rem;
    padding: 0 1.5rem;
  }
  
  .nav-menu {
    gap: 1.5rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .main-content {
    padding: 2rem 1.5rem;
  }
  
  .nav-brand h1 {
    font-size: 1.5rem;
  }
  
  .nav-item {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
  
  .btn-logout {
    padding: 0.75rem 1.25rem;
    font-size: 0.9rem;
  }
}
</style>

