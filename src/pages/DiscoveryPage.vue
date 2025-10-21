<template>
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
      <router-link to="/history" class="btn-reminder">View All History</router-link>
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
</template>

<script>
import EventCard from '../components/EventCard.vue'
import { eventAPI, friendingAPI, reviewingAPI } from '../api/services.js'
import { useAuth } from '../composables/useAuth.js'

export default {
  name: 'DiscoveryPage',
  components: {
    EventCard
  },
  setup() {
    const { user, initAuth } = useAuth()
    
    // Initialize auth state
    initAuth()
    
    return {
      user
    }
  },
  data() {
    return {
      recommendedEvents: [],
      friends: [],
      recentEvent: null,
      loading: true
    }
  },
  computed: {
    currentUser() {
      return this.user?.id || this.user?._id || 'user123'
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
        // User is now available through the composable
        if (!this.user) {
          this.$router.push('/login')
        }
      } catch (error) {
        console.error('Error initializing user:', error)
        this.$router.push('/login')
      }
    },
    
    async loadRecommendedEvents() {
      this.loading = true
      try {
        const response = await eventAPI.getEventsByStatus('upcoming')
        this.recommendedEvents = response.data || []

        if (this.recommendedEvents.length === 0) {
          this.recommendedEvents = this.getMockEvents()
        }
      } catch (error) {
        console.error('Error loading events:', error)
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
        this.friends = this.getMockFriends()
      }
    },

    async loadRecentEvent() {
      try {
        const reviewsResponse = await reviewingAPI.getReviewsByUser(this.currentUser)
        const reviews = reviewsResponse.data || []
        
        if (reviews.length > 0) {
          const mostRecentReview = reviews[0].review
          const eventResponse = await eventAPI.getEventById(mostRecentReview.target)
          const event = eventResponse.data[0]
          if (event) {
            this.recentEvent = { ...event, review: mostRecentReview }
          }
        }
      } catch (error) {
        console.error('Error loading recent event:', error)
        this.recentEvent = this.getMockRecentEvent()
      }
    },

    // Mock Data Helpers
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
        { id: 'friend1', name: 'Alice Johnson', username: 'Alice Johnson' },
        { id: 'friend2', name: 'Bob Smith', username: 'Bob Smith' },
        { id: 'friend3', name: 'Carol Davis', username: 'Carol Davis' },
        { id: 'friend4', name: 'David Wilson', username: 'David Wilson' },
        { id: 'friend5', name: 'Eva Brown', username: 'Eva Brown' }
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
      if (Math.random() > 0.8) {
        attendingFriends.push(this.friends[2])
      }
      
      // Return friends with proper structure for EventCard
      return attendingFriends.map(friend => ({
        id: friend.id || friend._id,
        username: friend.username || friend.name
      }))
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
    }
  }
}
</script>


<style scoped>
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
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.btn-reminder:hover {
  background: #2563eb;
}

@media (max-width: 768px) {
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
