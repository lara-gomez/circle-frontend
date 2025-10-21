import { ref, computed } from 'vue'
import { authAPI } from '../api/services.js'

// Global auth state
const isAuthenticated = ref(false)
const user = ref(null)
const loading = ref(false)

export function useAuth() {
  // Initialize auth state from localStorage
  const initAuth = () => {
    const storedAuth = localStorage.getItem('isAuthenticated')
    const storedUser = localStorage.getItem('user')
    
    if (storedAuth === 'true' && storedUser) {
      isAuthenticated.value = true
      user.value = JSON.parse(storedUser)
    }
  }

  // Login function
  const login = async (username, password) => {
    loading.value = true
    try {
      const response = await authAPI.authenticate(username, password)
      const userData = response.data.user
      
      // Update state
      isAuthenticated.value = true
      user.value = userData
      
      // Store in localStorage
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('user', JSON.stringify(userData))
      
      return userData
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  // Register function
  const register = async (username, password) => {
    loading.value = true
    try {
      const response = await authAPI.register(username, password)
      const userData = response.data.user
      
      // Update state
      isAuthenticated.value = true
      user.value = userData
      
      // Store in localStorage
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('user', JSON.stringify(userData))
      
      return userData
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  // Logout function
  const logout = () => {
    isAuthenticated.value = false
    user.value = null
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('user')
  }

  // Get user info
  const getUserInfo = async () => {
    if (!user.value) return null
    
    try {
      const response = await authAPI.getUsername(user.value)
      return response.data[0]?.username || user.value
    } catch (error) {
      console.error('Error getting user info:', error)
      return user.value
    }
  }

  // Computed properties
  const currentUser = computed(() => user.value)
  const isLoggedIn = computed(() => isAuthenticated.value)
  const isLoading = computed(() => loading.value)

  return {
    // State
    isAuthenticated: isLoggedIn,
    user: currentUser,
    loading: isLoading,
    
    // Methods
    initAuth,
    login,
    register,
    logout,
    getUserInfo
  }
}
