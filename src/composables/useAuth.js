import { ref, computed } from 'vue'
import { authAPI } from '../api/services.js'

// Global auth state
const isAuthenticated = ref(false)
const user = ref(null)
const session = ref(null)
const loading = ref(false)

export function useAuth() {
  // Initialize auth state from localStorage
  const initAuth = () => {
    try {
      const storedAuth = localStorage.getItem('isAuthenticated')
      const storedUser = localStorage.getItem('user')
      const storedSession = localStorage.getItem('session')
      
      console.log('initAuth - storedAuth:', storedAuth)
      console.log('initAuth - storedUser:', storedUser)
      
      // Check if we have valid data before parsing
      if (
        storedAuth === 'true' &&
        storedUser &&
        storedSession &&
        storedUser !== 'undefined' &&
        storedUser.trim() !== '' &&
        storedSession.trim() !== ''
      ) {
        console.log('initAuth - Setting authenticated state')
        isAuthenticated.value = true
        user.value = JSON.parse(storedUser)
        session.value = storedSession
        console.log('initAuth - User set:', user.value)
        console.log('initAuth - Session set:', session.value)
      } else {
        console.log('initAuth - Not authenticated (missing or invalid data)')
        
        // Clear corrupted data if it exists
        if (storedUser === 'undefined') {
          console.log('initAuth - Clearing corrupted localStorage data')
          localStorage.removeItem('isAuthenticated')
          localStorage.removeItem('user')
          localStorage.removeItem('registrationDate')
          localStorage.removeItem('session')
        }
      }
    } catch (error) {
      console.error('Error initializing auth from localStorage:', error)
      // Clear potentially corrupted data
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('user')
      localStorage.removeItem('session')
      isAuthenticated.value = false
      user.value = null
      session.value = null
    }
  }

  // Login function
  const login = async (username, password) => {
    loading.value = true
    try {
      const response = await authAPI.login(username, password)
      console.log('Login - Response:', response)
      console.log('Login - Response data:', response.data)

      const sessionId = response.data?.session
      if (!sessionId || typeof sessionId !== 'string') {
        console.error('Login - Invalid session in response:', response.data)
        throw new Error('Invalid session received from server')
      }

      const sessionUserResponse = await authAPI.getSessionUser(sessionId)
      console.log('Login - Session user response:', sessionUserResponse)

      const sessionUser = sessionUserResponse.data?.[0]?.user || sessionUserResponse.data?.user
      if (!sessionUser || typeof sessionUser !== 'string') {
        console.error('Login - Could not resolve user from session:', sessionUserResponse.data)
        throw new Error('Failed to resolve user from session')
      }

      // Update state
      isAuthenticated.value = true
      user.value = sessionUser
      session.value = sessionId

      // Store in localStorage
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('user', JSON.stringify(sessionUser))
      localStorage.setItem('session', sessionId)
      console.log('Login - Session stored in localStorage')

      // Preserve registration date if it exists, otherwise set it to now
      if (!localStorage.getItem('registrationDate')) {
        localStorage.setItem('registrationDate', new Date().toISOString())
      }

      return sessionUser
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

      const registeredUser = response.data?.user
      if (!registeredUser) {
        console.error('Register - No user data in response')
        throw new Error('No user data received from server')
      }

      // Automatically sign in after successful registration
      await login(username, password)

      // Store registration date
      localStorage.setItem('registrationDate', new Date().toISOString())

      return registeredUser
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  // Logout function
  const logout = async () => {
    try {
      if (session.value) {
        await authAPI.logout(session.value)
      }
    } catch (error) {
      console.error('Error during logout:', error)
    } finally {
      isAuthenticated.value = false
      user.value = null
      session.value = null
      
      // Clear all auth-related localStorage data
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('user')
      localStorage.removeItem('registrationDate')
      localStorage.removeItem('session')
    }
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
  const currentSession = computed(() => session.value)
  const isLoggedIn = computed(() => isAuthenticated.value)
  const isLoading = computed(() => loading.value)

  return {
    // State
    isAuthenticated: isLoggedIn,
    user: currentUser,
    loading: isLoading,
    session: currentSession,
    
    // Methods
    initAuth,
    login,
    register,
    logout,
    getUserInfo
  }
}
