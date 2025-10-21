<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1 class="brand-title">Circle</h1>
        <p class="brand-subtitle">Find your community through local events</p>
      </div>

      <div class="login-form-container">
        <div class="form-tabs">
          <button 
            class="tab-button" 
            :class="{ active: isLoginMode }"
            @click="isLoginMode = true"
          >
            Sign In
          </button>
          <button 
            class="tab-button" 
            :class="{ active: !isLoginMode }"
            @click="isLoginMode = false"
          >
            Sign Up
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="login-form">
          <div class="form-group">
            <label class="form-label">Username</label>
            <input 
              v-model="form.username" 
              type="text" 
              class="form-input"
              placeholder="Enter your username"
              required
              :disabled="loading"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input 
              v-model="form.password" 
              type="password" 
              class="form-input"
              placeholder="Enter your password"
              required
              :disabled="loading"
            />
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <button 
            type="submit" 
            class="btn btn-primary btn-large"
            :disabled="loading || !isFormValid"
          >
            {{ loading ? 'Please wait...' : (isLoginMode ? 'Sign In' : 'Sign Up') }}
          </button>
        </form>

        <div class="login-footer">
          <p v-if="isLoginMode">
            Don't have an account? 
            <button @click="isLoginMode = false" class="link-button">
              Sign up here
            </button>
          </p>
          <p v-else>
            Already have an account? 
            <button @click="isLoginMode = true" class="link-button">
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { authAPI } from '../api/services.js'

export default {
  name: 'LoginPage',
  data() {
    return {
      isLoginMode: true,
      loading: false,
      error: '',
      form: {
        username: '',
        password: ''
      }
    }
  },
  computed: {
    isFormValid() {
      return this.form.username.trim() && this.form.password.trim()
    }
  },
  methods: {
    async handleSubmit() {
      if (!this.isFormValid) return

      this.loading = true
      this.error = ''

      try {
        let response
        if (this.isLoginMode) {
          // Sign in
          response = await authAPI.authenticate(this.form.username, this.form.password)
        } else {
          // Sign up
          response = await authAPI.register(this.form.username, this.form.password)
        }

        const user = response.data.user
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('isAuthenticated', 'true')

        // Redirect to discovery page
        this.$router.push('/discovery')
      } catch (error) {
        console.error('Authentication error:', error)
        this.error = error.response?.data?.error || 'An error occurred. Please try again.'
      } finally {
        this.loading = false
      }
    },

    clearForm() {
      this.form = {
        username: '',
        password: ''
      }
      this.error = ''
    }
  },
  watch: {
    isLoginMode() {
      this.clearForm()
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.login-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  overflow: hidden;
}

.login-header {
  background: linear-gradient(135deg, #42b883, #369870);
  color: white;
  padding: 2rem;
  text-align: center;
}

.brand-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}

.brand-subtitle {
  font-size: 1rem;
  opacity: 0.9;
  margin: 0;
}

.login-form-container {
  padding: 2rem;
}

.form-tabs {
  display: flex;
  margin-bottom: 2rem;
  background: #f8fafc;
  border-radius: 8px;
  padding: 4px;
}

.tab-button {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: #6b7280;
  font-weight: 500;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.tab-button.active {
  background: white;
  color: #42b883;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tab-button:hover:not(.active) {
  color: #374151;
}

.login-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #42b883;
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
}

.form-input:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
}

.error-message {
  background: #fee2e2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  border: 1px solid #fecaca;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-block;
  width: 100%;
}

.btn-primary {
  background: #42b883;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #369870;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-large {
  padding: 1rem 1.5rem;
  font-size: 1.1rem;
}

.login-footer {
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
}

.link-button {
  background: none;
  border: none;
  color: #42b883;
  font-weight: 500;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
  font-size: inherit;
}

.link-button:hover {
  color: #369870;
}

@media (max-width: 480px) {
  .login-page {
    padding: 0.5rem;
  }
  
  .login-container {
    border-radius: 12px;
  }
  
  .login-header {
    padding: 1.5rem;
  }
  
  .brand-title {
    font-size: 2rem;
  }
  
  .login-form-container {
    padding: 1.5rem;
  }
}
</style>
