<template>
  <div class="login-page">
    <!-- Left Column: Visual Background -->
    <div class="visual-column">
      <div class="brand-overlay">
        <div class="brand-content">
          <h1 class="brand-title">Circle</h1>
          <p class="brand-tagline">Find your community through local events</p>
        </div>
      </div>
    </div>

    <!-- Right Column: Sign-In Form -->
    <div class="form-column">
      <div class="form-container">
        <!-- Sign In Form -->
        <div v-if="isLoginMode" class="form-wrapper">
          <div class="form-header">
            <h2 class="form-title">Welcome back</h2>
            <p class="form-subtitle">Sign in to continue to Circle</p>
          </div>

          <form @submit.prevent="handleSubmit" class="auth-form">
            <div class="form-group">
              <label for="login-username" class="form-label">Username</label>
              <input 
                id="login-username"
                v-model="form.username" 
                type="text" 
                class="form-input"
                placeholder="Enter your username"
                required
                :disabled="authLoading"
                autocomplete="username"
              />
            </div>

            <div class="form-group">
              <label for="login-password" class="form-label">Password</label>
              <input 
                id="login-password"
                v-model="form.password" 
                type="password" 
                class="form-input"
                placeholder="Enter your password"
                required
                :disabled="authLoading"
                autocomplete="current-password"
              />
            </div>

            <div v-if="error" class="error-message">
              {{ error }}
            </div>

            <button 
              type="submit" 
              class="btn btn-primary"
              :disabled="authLoading || !isFormValid"
            >
              <span v-if="authLoading" class="loading-spinner"></span>
              {{ authLoading ? 'Signing in...' : 'Sign In' }}
            </button>
          </form>

          <div class="account-links">
            <p class="account-text">
              Don't have an account? 
              <button @click="switchToSignUp" class="link-button">
                Create an account
              </button>
            </p>
          </div>
        </div>

        <!-- Sign Up Form -->
        <div v-else class="form-wrapper">
          <div class="form-header">
            <h2 class="form-title">Create an account</h2>
            <p class="form-subtitle">Sign up to get started with Circle</p>
          </div>

          <form @submit.prevent="handleSubmit" class="auth-form">
            <div class="form-group">
              <label for="signup-username" class="form-label">Username</label>
              <input 
                id="signup-username"
                v-model="form.username" 
                type="text" 
                class="form-input"
                placeholder="Choose a username"
                required
                :disabled="authLoading"
                autocomplete="username"
              />
            </div>

            <div class="form-group">
              <label for="signup-password" class="form-label">Password</label>
              <input 
                id="signup-password"
                v-model="form.password" 
                type="password" 
                class="form-input"
                placeholder="Choose a password"
                required
                :disabled="authLoading"
                autocomplete="new-password"
              />
            </div>

            <div v-if="error" class="error-message">
              {{ error }}
            </div>

            <button 
              type="submit" 
              class="btn btn-primary"
              :disabled="authLoading || !isFormValid"
            >
              <span v-if="authLoading" class="loading-spinner"></span>
              {{ authLoading ? 'Creating account...' : 'Create Account' }}
            </button>
          </form>

          <div class="account-links">
            <p class="account-text">
              Already have an account? 
              <button @click="switchToSignIn" class="link-button">
                Sign in instead
              </button>
            </p>
          </div>
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
        if (this.isLoginMode) {
          this.error = error.response?.data?.error || 'Invalid username or password. Please try again.'
        } else {
          this.error = error.response?.data?.error || 'Failed to create account. Please try again.'
        }
      }
    },

    switchToSignUp() {
      this.isLoginMode = false
      this.clearForm()
    },

    switchToSignIn() {
      this.isLoginMode = true
      this.clearForm()
    },

    clearForm() {
      this.form = {
        username: '',
        password: ''
      }
      this.error = ''
    }
  }
}
</script>

<style scoped>
/* Full-screen two-column layout */
.login-page {
  min-height: 100vh;
  width: 100vw;
  display: grid;
  grid-template-columns: 1fr 1fr;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* Left Column: Visual Background */
.visual-column {
  background: #354f52;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.visual-column::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 30% 40%, rgba(132, 169, 140, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(202, 210, 197, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.visual-column::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 200px;
  background: linear-gradient(to right, transparent, rgba(132, 169, 140, 0.08));
  pointer-events: none;
}

.brand-overlay {
  position: relative;
  z-index: 1;
  padding: 2rem;
  max-width: 500px;
  text-align: center;
}

.brand-content {
  animation: fadeInUp 0.6s ease-out;
}

.brand-title {
  font-size: 4rem;
  font-weight: 700;
  color: #cad2c5;
  margin: 0 0 1rem 0;
  letter-spacing: -0.04em;
}

.brand-tagline {
  font-size: 1.25rem;
  color: rgba(202, 210, 197, 0.85);
  margin: 0;
  font-weight: 400;
  line-height: 1.6;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Right Column: Form */
.form-column {
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
}

.form-column::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(to bottom, transparent, #e5e7eb, transparent);
  pointer-events: none;
}

.form-container {
  width: 100%;
  max-width: 420px;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.form-wrapper {
  background: transparent;
}

.form-header {
  text-align: left;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.form-title {
  font-size: 2rem;
  font-weight: 600;
  color: #2f3e46;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.025em;
}

.form-subtitle {
  color: #6b7280;
  font-size: 0.9375rem;
  margin: 0;
  font-weight: 400;
  line-height: 1.5;
}

/* Form styling */
.auth-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #354f52;
  font-size: 0.875rem;
  letter-spacing: 0.025em;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: white;
  color: #0d1321;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #84a98c;
  box-shadow: 0 0 0 3px rgba(132, 169, 140, 0.1);
  background: #fafbfc;
}

.form-input:disabled {
  background-color: #f8fafc;
  cursor: not-allowed;
  color: #9ca3af;
  border-color: #e2e8f0;
}

.form-input::placeholder {
  color: #9ca3af;
  font-weight: 400;
}

/* Error message */
.error-message {
  background: #fef2f2;
  color: #dc2626;
  padding: 0.875rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  border: 1px solid #fecaca;
  font-weight: 500;
}

/* Button styling */
.btn {
  width: 100%;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-family: inherit;
  letter-spacing: 0.025em;
}

.btn-primary {
  background: #84a98c;
  color: white;
  border: none;
  box-shadow: 0 2px 8px rgba(132, 169, 140, 0.2);
}

.btn-primary:hover:not(:disabled) {
  background: #74a077;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(132, 169, 140, 0.3);
}

.btn-primary:active:not(:disabled) {
  background: #6a9570;
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(132, 169, 140, 0.2);
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Loading spinner */
.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Account links */
.account-links {
  text-align: center;
  margin-top: 1.5rem;
}

.account-text {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0;
  font-weight: 400;
}

.link-button {
  background: none;
  border: none;
  color: #84a98c;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  padding: 0;
  font-size: inherit;
  transition: color 0.2s ease;
  font-family: inherit;
}

.link-button:hover {
  color: #52796f;
  text-decoration: underline;
}

/* Responsive design */
@media (max-width: 968px) {
  .login-page {
    grid-template-columns: 1fr;
  }

  .visual-column {
    min-height: 40vh;
  }

  .brand-title {
    font-size: 3rem;
  }

  .brand-tagline {
    font-size: 1.125rem;
  }
}

@media (max-width: 640px) {
  .form-column {
    padding: 1.5rem;
  }

  .form-title {
    font-size: 1.75rem;
  }

  .form-subtitle {
    font-size: 0.9375rem;
  }

  .visual-column {
    min-height: 30vh;
  }

  .brand-title {
    font-size: 2.5rem;
  }

  .brand-tagline {
    font-size: 1rem;
  }

  .brand-overlay {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .form-column {
    padding: 1rem;
  }

  .form-header {
    margin-bottom: 1.5rem;
  }

  .form-title {
    font-size: 1.5rem;
  }

  .visual-column {
    min-height: 25vh;
  }

  .brand-title {
    font-size: 2rem;
  }
}
</style>
