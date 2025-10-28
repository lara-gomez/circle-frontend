import { ref, computed } from 'vue'
import { authAPI } from '../api/services.js'

// Global auth state
const isAuthenticated = ref(false)
const user = ref(null)
const loading = ref(false)

export function useAuth() {
  // Initialize auth state from localStorage
  const initAuth = () => {
    try {
      const storedAuth = localStorage.getItem('isAuthenticated')
      const storedUser = localStorage.getItem('user')
      
      console.log('initAuth - storedAuth:', storedAuth)
      console.log('initAuth - storedUser:', storedUser)
      
      // Check if we have valid data before parsing
      if (storedAuth === 'true' && storedUser && storedUser !== 'undefined' && storedUser.trim() !== '') {
        console.log('initAuth - Setting authenticated state')
        isAuthenticated.value = true
        user.value = JSON.parse(storedUser)
        console.log('initAuth - User set:', user.value)
      } else {
        console.log('initAuth - Not authenticated (missing or invalid data)')
        
        // Clear corrupted data if it exists
        if (storedUser === 'undefined') {
          console.log('initAuth - Clearing corrupted localStorage data')
          localStorage.removeItem('isAuthenticated')
          localStorage.removeItem('user')
          localStorage.removeItem('registrationDate')
        }
      }
    } catch (error) {
      console.error('Error initializing auth from localStorage:', error)
      // Clear potentially corrupted data
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('user')
      isAuthenticated.value = false
      user.value = null
    }
  }

  // Login function
  const login = async (username, password) => {
    loading.value = true
    try {
      const response = await authAPI.authenticate(username, password)
      console.log('Login - Response:', response)
      console.log('Login - Response data:', response.data)
      
      const userData = response.data.user
      console.log('Login - User data:', userData)
      
      // Validate userData before storing
      if (!userData) {
        console.error('Login - No user data in response')
        throw new Error('No user data received from server')
      }
      
      // Normalize user ID - extract ID from object or use string directly
      let userId = null
      if (typeof userData === 'string') {
        userId = userData
      } else if (typeof userData === 'object' && userData !== null) {
        userId = userData.id || userData._id || userData.user || null
      }
      
      if (!userId) {
        console.error('Login - Could not extract user ID from:', userData)
        throw new Error('Invalid user data format received from server')
      }
      
      console.log('Login - Normalized user ID:', userId)
      
      // Update state - store only the user ID
      isAuthenticated.value = true
      user.value = userId
      
      // Store in localStorage
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('user', JSON.stringify(userId))
      console.log('Login - User stored in localStorage')
      
      // Preserve registration date if it exists, otherwise set it to now
      if (!localStorage.getItem('registrationDate')) {
        localStorage.setItem('registrationDate', new Date().toISOString())
      }
      
      return userId
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
      console.log('Register - Response:', response)
      console.log('Register - Response data:', response.data)
      
      const userData = response.data.user
      console.log('Register - User data:', userData)
      
      // Validate userData before storing
      if (!userData) {
        console.error('Register - No user data in response')
        throw new Error('No user data received from server')
      }
      
      // Normalize user ID - extract ID from object or use string directly
      let userId = null
      if (typeof userData === 'string') {
        userId = userData
      } else if (typeof userData === 'object' && userData !== null) {
        userId = userData.id || userData._id || userData.user || null
      }
      
      if (!userId) {
        console.error('Register - Could not extract user ID from:', userData)
        throw new Error('Invalid user data format received from server')
      }
      
      console.log('Register - Normalized user ID:', userId)
      
      // Update state - store only the user ID
      isAuthenticated.value = true
      user.value = userId
      
      // Store in localStorage
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('user', JSON.stringify(userId))
      console.log('Register - User stored in localStorage')
      
      // Store registration date
      localStorage.setItem('registrationDate', new Date().toISOString())
      
      return userId
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
    
    // Clear all auth-related localStorage data
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('user')
    localStorage.removeItem('registrationDate')
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
