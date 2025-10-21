<template>
  <div class="home-view">
    <!-- Navigation Header -->
    <nav class="nav-header">
      <div class="nav-brand">
        <h1>Circle</h1>
      </div>
      <div class="nav-menu">
        <button class="nav-item active">Discovery</button>
        <button class="nav-item" @click="navigateToHistory">Event History</button>
        <button class="nav-item" @click="navigateToProfile">Profile</button>
      </div>
      <div class="nav-user">
        <span class="user-greeting">Hello, {{ currentUsername }}!</span>
        <button class="btn-logout" @click="logout">Logout</button>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Welcome Section -->
      <section class="welcome-section">
        <h2>Discover Events That Match Your Interests</h2>
        <p>Find local events and connect with friends who share your passions.</p>
      </section>

      <!-- Recent Event Reminder (Small) -->
      <section v-if="recentEvent" class="recent-event-reminder">
        <div class="reminder-card">
          <div class="reminder-content">
            <span class="reminder-icon">📅</span>
            <div class="reminder-text">
              <span class="reminder-label">Recently attended:</span>
              <span class="reminder-event">{{ recentEvent.name }}</span>
            </div>
          </div>
          <button class="btn-reminder" @click="navigateToHistory">View All History</button>
        </div>
      </section>

      <!-- Recommended Events Section -->
      <section class="events-section">
        <div class="section-header">
          <h3>Recommended for You</h3>
          <div class="section-actions">
            <button 
              @click="refreshEvents" 
              class="btn btn-refresh"
              :disabled="loading"
            >
              {{ loading ? 'Loading...' : 'Refresh' }}
            </button>
          </div>
        </div>
        
        <div v-if="loading" class="loading">
          <div class="loading-spinner"></div>
          <p>Loading recommended events...</p>
        </div>
        
        <div v-else-if="recommendedEvents.length === 0" class="no-events">
          <p>No events available at the moment.</p>
          <p class="subtitle">Check back later for new events!</p>
        </div>
        
        <div v-else class="events-grid">
          <EventCard
            v-for="event in recommendedEvents"
            :key="event._id"
            :event="event"
            :current-user="currentUser"
            :friends-attending="getFriendsAttending(event._id)"
            @interest-changed="handleInterestChange"
            @bookmark-changed="handleBookmarkChange"
          />
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import EventCard from '../components/EventCard.vue'
import { eventAPI, friendingAPI, authAPI, reviewingAPI } from '../api/services.js'

export default {
  name: 'HomeView',
  components: {
    EventCard
  },
  data() {
    return {
      currentUser: 'user123', // This would come from authentication
      currentUsername: 'Demo User',
      recommendedEvents: [],
      friends: [],
      recentEvent: null,
      loading: true
    }
  },
  async mounted() {
    await this.initializeUser()
    await this.loadRecommendedEvents()
    await this.loadFriends()
    await this.loadRecentEvent()
  },
  methods: {
    async initializeUser() {
      try {
        // In a real app, this would come from authentication state
        // For demo purposes, we'll use mock data
        this.currentUser = 'user123'
        this.currentUsername = 'Demo User'
      } catch (error) {
        console.error('Error initializing user:', error)
      }
    },
    
    async loadRecommendedEvents() {
      this.loading = true
      try {
        // Get upcoming events
        const response = await eventAPI.getEventsByStatus('upcoming')
        this.recommendedEvents = response.data || []
        
        // If no events from API, use mock data
        if (this.recommendedEvents.length === 0) {
          this.recommendedEvents = this.getMockEvents()
        }
      } catch (error) {
        console.error('Error loading events:', error)
        // Use mock data on error
        this.recommendedEvents = this.getMockEvents()
      } finally {
        this.loading = false
      }
    },
    
    async loadFriends() {
      try {
        const response = await friendingAPI.getFriends(this.currentUser)
        this.friends = response.data || []
      } catch (error) {
        console.error('Error loading friends:', error)
        // Use mock friends data
        this.friends = this.getMockFriends()
      }
    },
    
    async loadRecentEvent() {
      try {
        // Get user's most recent review
        const reviewsResponse = await reviewingAPI.getReviewsByUser(this.currentUser)
        const reviews = reviewsResponse.data || []
        
        if (reviews.length > 0) {
          // Get the most recent review
          const mostRecentReview = reviews[0].review
          const eventResponse = await eventAPI.getEventById(mostRecentReview.target)
          const event = eventResponse.data[0]
          if (event) {
            this.recentEvent = {
              ...event,
              review: mostRecentReview
            }
          }
        }
      } catch (error) {
        console.error('Error loading recent event:', error)
        // Use mock recent event data
        this.recentEvent = this.getMockRecentEvent()
      }
    },
    
    getMockEvents() {
      return [
        {
          _id: 'event1',
          name: 'Vue.js Workshop',
          date: '2024-02-15T18:00:00Z',
          duration: 120,
          location: 'MIT Building 32',
          description: 'Learn Vue.js fundamentals with hands-on coding exercises. Perfect for beginners and intermediate developers.',
          organizer: 'Tech Club',
          status: 'upcoming'
        },
        {
          _id: 'event2',
          name: 'Coffee & Code',
          date: '2024-02-20T10:00:00Z',
          duration: 90,
          location: 'Stata Center',
          description: 'Casual coding session with coffee and pastries. Bring your laptop and work on personal projects.',
          organizer: 'Coding Community',
          status: 'upcoming'
        },
        {
          _id: 'event3',
          name: 'AI & Machine Learning Meetup',
          date: '2024-02-25T19:00:00Z',
          duration: 150,
          location: 'MIT CSAIL',
          description: 'Discussion on latest AI trends and hands-on ML workshop. All skill levels welcome.',
          organizer: 'AI Society',
          status: 'upcoming'
        },
        {
          _id: 'event4',
          name: 'Startup Pitch Night',
          date: '2024-03-01T17:00:00Z',
          duration: 180,
          location: 'MIT Media Lab',
          description: 'Watch student startups pitch their ideas to a panel of investors and entrepreneurs.',
          organizer: 'Entrepreneurship Club',
          status: 'upcoming'
        }
      ]
    },
    
    getMockFriends() {
      return [
        { friend: 'friend1' },
        { friend: 'friend2' },
        { friend: 'friend3' }
      ]
    },
    
    getMockRecentEvent() {
      return {
        _id: 'recent1',
        name: 'Vue.js Workshop',
        date: '2024-01-15T18:00:00Z',
        location: 'MIT Building 32',
        review: {
          rating: 8,
          entry: 'Great workshop!'
        }
      }
    },
    
    getFriendsAttending(eventId) {
      // Mock logic to determine which friends are attending
      // In a real app, this would be based on actual attendance data
      const attendingFriends = []
      if (Math.random() > 0.5) {
        attendingFriends.push(this.friends[0])
      }
      if (Math.random() > 0.7) {
        attendingFriends.push(this.friends[1])
      }
      return attendingFriends
    },
    
    async refreshEvents() {
      await this.loadRecommendedEvents()
    },
    
    handleInterestChange(eventId, isInterested) {
      console.log(`Event ${eventId} interest changed:`, isInterested)
      // Update local state or trigger API call
    },
    
    handleBookmarkChange(eventId, isBookmarked) {
      console.log(`Event ${eventId} bookmark changed:`, isBookmarked)
      // Update local state or trigger API call
    },
    
    navigateToHistory() {
      this.$router.push('/history')
    },
    
    navigateToProfile() {
      this.$router.push('/profile')
    },
    
    logout() {
      console.log('Logout user')
      // Implement logout logic
      localStorage.removeItem('authToken')
      // Redirect to login page
    }
  }
}
</script>

<style scoped>
.home-view {
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

.welcome-section {
  text-align: center;
  margin-bottom: 3rem;
}

.welcome-section h2 {
  color: #2c3e50;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.welcome-section p {
  color: #6b7280;
  font-size: 1.125rem;
  max-width: 600px;
  margin: 0 auto;
}

.events-section {
  margin-bottom: 3rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h3 {
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.btn-refresh {
  background: #42b883;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-refresh:hover:not(:disabled) {
  background: #369870;
}

.btn-refresh:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #42b883;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-events {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.subtitle {
  color: #9ca3af;
  margin-top: 0.5rem;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

/* Recent Event Reminder Styles */
.recent-event-reminder {
  margin-bottom: 2rem;
}

.reminder-card {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
  border-radius: 8px;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.reminder-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.reminder-icon {
  font-size: 1.25rem;
}

.reminder-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.reminder-label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.reminder-event {
  font-size: 1rem;
  color: #1e293b;
  font-weight: 600;
}

.btn-reminder {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-reminder:hover {
  background: #2563eb;
}

@media (max-width: 768px) {
  .nav-header {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-menu {
    gap: 1rem;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .welcome-section h2 {
    font-size: 1.5rem;
  }
  
  .events-grid {
    grid-template-columns: 1fr;
  }
  
  .reminder-card {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .reminder-content {
    justify-content: center;
  }
}
</style>
