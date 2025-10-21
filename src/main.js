import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css'
import { useAuth } from './composables/useAuth.js'

// Initialize authentication before mounting the app
const { initAuth } = useAuth()
initAuth()  // <-- synchronous setup

createApp(App).use(router).mount('#app')
