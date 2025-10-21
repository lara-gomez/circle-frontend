<template>
  <div class="profile-view">
    <!-- Navigation Header -->
    <nav class="nav-header">
      <div class="nav-brand">
        <h1>Circle</h1>
      </div>
      <div class="nav-menu">
        <button class="nav-item" @click="navigateToDiscovery">Discovery</button>
        <button class="nav-item" @click="navigateToHistory">Event History</button>
        <button class="nav-item active">Profile</button>
      </div>
      <div class="nav-user">
        <span class="user-greeting">Hello, {{ currentUsername }}!</span>
        <button class="btn-logout" @click="logout">Logout</button>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
      <div class="profile-content">
        <h2>Profile Page</h2>
        <p>This is a placeholder for the Profile page.</p>
        <p>In a real application, this would include:</p>
        <ul>
          <li>User settings and preferences</li>
          <li>Account information</li>
          <li>Privacy settings</li>
          <li>Notification preferences</li>
        </ul>
      </div>
    </main>
  </div>
</template>

<script>
export default {
  name: 'ProfileView',
  data() {
    return {
      currentUsername: 'Demo User'
    }
  },
  methods: {
    navigateToDiscovery() {
      this.$router.push('/discovery')
    },
    navigateToHistory() {
      this.$router.push('/history')
    },
    logout() {
      console.log('Logout user')
      localStorage.removeItem('authToken')
      // Redirect to login page
    }
  }
}
</script>

<style scoped>
.profile-view {
  min-height: 100vh;
  background-color: #f8fafc;
}

.nav-header {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-brand h1 {
  color: #42b883;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.nav-menu {
  display: flex;
  gap: 2rem;
}

.nav-item {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem 0;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
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

.user-greeting {
  color: #374151;
  font-weight: 500;
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.profile-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  text-align: center;
}

.profile-content h2 {
  color: #2c3e50;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.profile-content p {
  color: #6b7280;
  font-size: 1.125rem;
  margin-bottom: 1rem;
}

.profile-content ul {
  text-align: left;
  max-width: 400px;
  margin: 0 auto;
  color: #4b5563;
}

.profile-content li {
  margin-bottom: 0.5rem;
}
</style>
