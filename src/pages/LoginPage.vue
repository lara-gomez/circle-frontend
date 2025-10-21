<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Page Header -->
      <section class="page-header">
        <h1 class="brand-title">Circle</h1>
        <p class="brand-subtitle">Find your community through local events</p>
      </section>

      <!-- Login Form Container -->
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
              :disabled="authLoading"
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
              :disabled="authLoading"
            />
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <button 
            type="submit" 
            class="btn btn-primary btn-large"
            :disabled="authLoading || !isFormValid"
          >
            {{ authLoading ? 'Please wait...' : (isLoginMode ? 'Sign In' : 'Sign Up') }}
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
import { useAuth } from '../composables/useAuth.js'

export default {
  name: 'LoginPage',
  setup() {
    const { login, register, loading: authLoading } = useAuth()
    return { login, register, authLoading }
  },
  data() {
    return {
      isLoginMode: true,
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

      this.error = ''

      try {
        if (this.isLoginMode) {
          // Sign in
          await this.login(this.form.username, this.form.password)
        } else {
          // Sign up
          await this.register(this.form.username, this.form.password)
        }

        // Redirect to discovery page after successful authentication
        this.$router.push('/discovery')
      } catch (error) {
        console.error('Authentication error:', error)
        this.error = error.response?.data?.error || 'An error occurred. Please try again.'
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
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.login-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  width: 100%;
  max-width: 600px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.page-header {
  text-align: center;
  padding: 3rem 2rem 2rem;
  background: linear-gradient(135deg, #42b883 0%, #369870 100%);
  color: white;
}

.page-header .brand-title {
  color: white;
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.page-header .brand-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.125rem;
  margin: 0;
}

.login-form-container {
  padding: 2rem;
}

.form-tabs {
  display: flex;
  margin-bottom: 2rem;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 4px;
}

.tab-button {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 500;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.tab-button.active {
  background: white;
  color: #42b883;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tab-button:hover:not(.active) {
  color: #334155;
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
  font-size: 0.875rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: #42b883;
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
}

.form-input:disabled {
  background-color: #f9fafb;
  cursor: not-allowed;
  color: #9ca3af;
}

.form-input::placeholder {
  color: #9ca3af;
}

.error-message {
  background: #fee2e2;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 8px;
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
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(66, 184, 131, 0.3);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
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
  transition: color 0.2s ease;
}

.link-button:hover {
  color: #369870;
}

@media (max-width: 768px) {
  .login-page {
    padding: 1rem;
  }
  
  .login-container {
    max-width: 100%;
    border-radius: 8px;
  }
  
  .page-header {
    padding: 2rem 1.5rem 1.5rem;
  }
  
  .page-header .brand-title {
    font-size: 2rem;
  }
  
  .page-header .brand-subtitle {
    font-size: 1rem;
  }
  
  .login-form-container {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .login-page {
    padding: 0.5rem;
  }
  
  .page-header {
    padding: 1.5rem 1rem;
  }
  
  .page-header .brand-title {
    font-size: 1.75rem;
  }
  
  .login-form-container {
    padding: 1rem;
  }
}
</style>
