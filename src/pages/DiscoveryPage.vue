<template>
  <!-- Welcome Section -->
  <section class="welcome-section">
    <h2>Welcome to Circle!</h2>
    <p>Discover local events that match your interests and connect with your community.</p>
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

  <!-- Events Section -->
  <section class="events-section">
    <div class="section-header">
      <h3>Recommended for You</h3>
      <button 
        @click="refreshEvents" 
        class="btn btn-refresh"
        :disabled="loading"
      >
        {{ loading ? 'Loading...' : 'Refresh' }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Loading recommended events...</p>
    </div>

    <!-- No Events State -->
    <div v-else-if="recommendedEvents.length === 0" class="no-events">
      <span class="no-events-icon">📅</span>
      <h3>No Events Available</h3>
      <p>No events available at the moment.</p>
      <p class="subtitle">Check back later for new events!</p>
    </div>

    <!-- Events Grid -->
    <div v-else class="events-grid">
      <EventCard
        v-for="event in recommendedEvents"
        :key="event._id"
        :event="event"
        :current-user="currentUser"
        :friends-attending="friendsAttendingMap[event._id] || []"
        :is-interested="isUserInterested(event._id)"
        @interest-changed="handleInterestChange"
        @bookmark-changed="handleBookmarkChange"
      />
    </div>

    <!-- All Events Section -->
    <div v-if="!loading && allEvents.length > 0" class="all-events-section">
      <div class="section-header">
        <h3>All Events</h3>
      </div>
      
      <div class="events-grid">
        <EventCard
          v-for="event in allEvents"
          :key="event._id"
          :event="event"
          :current-user="currentUser"
          :friends-attending="friendsAttendingMap[event._id] || []"
          :is-interested="isUserInterested(event._id)"
          @interest-changed="handleInterestChange"
          @bookmark-changed="handleBookmarkChange"
        />
      </div>
    </div>
  </section>
</template>

<script>
import EventCard from '../components/EventCard.vue'
import { eventAPI, friendingAPI, reviewingAPI, interestAPI } from '../api/services.js'
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
      allEvents: [],
      friends: [],
      recentEvent: null,
      loading: true,
      friendsAttendingMap: {},
      userInterests: []
    }
  },
  computed: {
    currentUser() {
      const userId = this.user
      if (!userId) {
        console.error('User not authenticated')
        this.$router.push('/login')
        return '' // Temporary fallback for computed property
      }
      return userId
    }
  },
  async mounted() {
    await this.initializeUser()
    await this.loadFriends()
    await this.loadRecommendedEvents()
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
        // Get user's personal interests for filtering
        const userInterestsResponse = await interestAPI.getPersonalInterests(this.currentUser)
        const userInterests = (userInterestsResponse.data || []).map(item => item.tag || item.name || item)
        
        console.log('User interests:', userInterests)
        
        // Call recommendation API with user's interests as filters
        // Convert arrays to strings as expected by the API
        const filtersStr = userInterests.join(',')
        const prioritiesStr = 'upcoming'
        
        console.log('Calling recommendation API with:', {
          user: this.currentUser,
          filters: filtersStr,
          priorities: prioritiesStr
        })
        
        const recommendationResponse = await eventAPI.getEventsByRecommendationContext(
          this.currentUser,
          filtersStr,
          prioritiesStr
        )
        
        const recommendedEventsData = recommendationResponse.data || []
        
        // Load all upcoming events
        const allEventsResponse = await eventAPI.getEventsByStatus('upcoming')
        const allEventsData = allEventsResponse.data || []
        
        // Filter out events that have passed their end time
        const now = new Date()
        const filterActiveEvents = (events) => {
          return events.filter(event => {
            if (!event.date || !event.duration) return true
            
            const eventStartTime = new Date(event.date)
            const eventEndTime = new Date(eventStartTime.getTime() + (event.duration * 60 * 1000))
            
            return eventEndTime > now
          })
        }
        
        this.recommendedEvents = filterActiveEvents(recommendedEventsData)
        
        // All events are the ones not in recommended
        const recommendedIds = new Set(this.recommendedEvents.map(e => e._id))
        const allFilteredEvents = filterActiveEvents(allEventsData)
        this.allEvents = allFilteredEvents.filter(event => !recommendedIds.has(event._id))

        // Load friends attending data for each event
        await this.loadFriendsAttendingData()
        
        // Load user's current interests to initialize event cards
        await this.loadUserInterests()
        
        console.log('Recommended events:', this.recommendedEvents.length)
        console.log('All other events:', this.allEvents.length)
      } catch (error) {
        console.error('Error loading events:', error)
        // Keep empty array on error
        this.recommendedEvents = []
        this.allEvents = []
      } finally {
        this.loading = false
      }
    },

    async loadFriends() {
      try {
        console.log('Loading friends for user:', this.currentUser)
        const response = await friendingAPI.getFriends(this.currentUser)
        console.log('Raw friends API response:', response)
        this.friends = response.data || []
        console.log('Processed friends array:', this.friends)
      } catch (error) {
        console.error('Error loading friends:', error)
        this.friends = this.getMockFriends()
        console.log('Using mock friends:', this.friends.length, this.friends)
      }
    },

    async fetchFriendUsername(friendId) {
      try {
        // Fetching username for friend
        const { authAPI } = await import('../api/services.js')
        const response = await authAPI.getUsername(friendId)
        // Username API response received
        
        // Handle different response structures
        let username = friendId // fallback
        if (response.data) {
          if (typeof response.data === 'string') {
            username = response.data
          } else if (Array.isArray(response.data) && response.data.length > 0) {
            // Handle array response: [{username: 'new_test'}]
            const userData = response.data[0]
            if (userData.username) {
              username = userData.username
            } else if (userData.user) {
              username = userData.user
            }
          } else if (response.data.username) {
            username = response.data.username
          } else if (response.data.user) {
            username = response.data.user
          } else if (response.data.id) {
            // Sometimes the response might be the user object itself
            username = response.data.id
          }
        }
        
        // If we still have the user ID, try to extract username from the response structure
        if (username === friendId && response.data) {
          console.log(`⚠️ Username extraction failed, trying alternative approaches...`)
          // Try to find any string field that looks like a username
          const dataStr = JSON.stringify(response.data)
          console.log(`📋 Raw response data as string:`, dataStr)
        }
        
        return username
      } catch (error) {
        console.error(`Error fetching username for ${friendId}:`, error)
        return friendId
      }
    },

    getMockFriends() {
      // Mock friends data for testing
      return [
        { id: 'friend1', username: 'Alice', name: 'Alice' },
        { id: 'friend2', username: 'Bob', name: 'Bob' },
        { id: 'friend3', username: 'Charlie', name: 'Charlie' }
      ]
    },

    async loadFriendsAttendingData() {
      // OPTIMIZED: This function now fetches friends and their interests efficiently
      // Instead of N×M API calls (N events × M friends), it makes only M calls:
      // - Uses already loaded friends from this.friends
      // - M parallel calls to get each friend's interests
      // Then builds an efficient in-memory mapping of eventId → friends attending
      try {
        // Step 1: Use already loaded friends
        const allFriends = this.friends || []
        
        console.log('Found friends:', allFriends.length, allFriends)
        
        if (allFriends.length === 0) {
          // Initialize empty map for all events
          this.friendsAttendingMap = {}
          this.recommendedEvents.concat(this.allEvents).forEach(event => {
            this.friendsAttendingMap[event._id] = []
          })
          return
        }

        // Step 2: Get all friends' interests and usernames in parallel
        const friendInterestsPromises = allFriends.map(async (friend) => {
          try {
            console.log(`Friend object structure:`, friend)
            const friendId = friend.id || friend._id || friend.friend || friend
            console.log(`Extracted friend ID: ${friendId}`)
            
            // Get friend's interests and username in parallel
            const [friendInterestsResponse, usernameResponse] = await Promise.all([
              interestAPI.getItemInterests(friendId),
              this.fetchFriendUsername(friendId)
            ])
            
            const interests = friendInterestsResponse.data || []
            const username = usernameResponse || friendId
            console.log(`📊 Friend ${friendId} interests:`, interests)
            console.log(`👤 Friend ${friendId} username:`, username)
            console.log(`🔧 Creating friend object:`, { id: friendId, username: username })
            
            return {
              friend: {
                id: friendId,
                username: username
              },
              interestedEvents: interests.map(interest => interest.item)
            }
          } catch (error) {
            console.error(`Error getting interests for friend:`, error)
            const friendId = friend.id || friend._id || friend.friend || friend
            return {
              friend: {
                id: friendId,
                username: friendId // fallback to ID if username fetch fails
              },
              interestedEvents: []
            }
          }
        })

        const friendInterestsResults = await Promise.all(friendInterestsPromises)

        // Step 3: Build efficient mapping of eventId → friends attending
        this.friendsAttendingMap = {}
        
        // Initialize all events with empty arrays
        this.recommendedEvents.concat(this.allEvents).forEach(event => {
          this.friendsAttendingMap[event._id] = []
        })

        // Build the mapping efficiently
        friendInterestsResults.forEach(({ friend, interestedEvents }) => {
          console.log(`Processing friend ${friend.username} (${friend.id}) with ${interestedEvents.length} interested events:`, interestedEvents)
          interestedEvents.forEach(eventId => {
            if (this.friendsAttendingMap.hasOwnProperty(eventId)) {
              this.friendsAttendingMap[eventId].push(friend)
              console.log(`Added friend ${friend.username} to event ${eventId}`)
            } else {
              console.log(`Event ${eventId} not found in friendsAttendingMap`)
            }
          })
        })

        console.log('Friends attending map:', this.friendsAttendingMap)

      } catch (error) {
        console.error('Error loading friends attending data:', error)
        // Fallback to mock data
        await this.loadMockFriendsAttendingData()
      }
    },

    async loadMockFriendsAttendingData() {
      // Initialize with mock data for all events
      this.friendsAttendingMap = {}
      
      this.recommendedEvents.concat(this.allEvents).forEach(event => {
        this.friendsAttendingMap[event._id] = this.getMockFriendsAttending(event._id)
      })
    },

    async loadUserInterests() {
      try {
        const response = await interestAPI.getItemInterests(this.currentUser)
        this.userInterests = response.data || []
      } catch (error) {
        console.error('Error loading user interests:', error)
        this.userInterests = []
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
        // Keep null on error
        this.recentEvent = null
      }
    },

    
    async getFriendsAttending(eventId) {
      // This function is now primarily used as a fallback or for single event queries
      // The main optimization is in loadFriendsAttendingData()
      try {
        // Get all friends
        const friendsResponse = await friendingAPI.getFriends(this.currentUser)
        const allFriends = friendsResponse.data || []
        
        if (allFriends.length === 0) {
          return []
        }

        // Get all friends' interests in parallel
        const friendInterestsPromises = allFriends.map(async (friend) => {
          try {
            const friendInterestsResponse = await interestAPI.getItemInterests(friend.id || friend._id)
            const interests = friendInterestsResponse.data || []
            return {
              friend: {
                id: friend.id || friend._id,
                username: friend.username || friend.name
              },
              interestedEvents: interests.map(interest => interest.item)
            }
          } catch (error) {
            console.error(`Error getting interests for friend ${friend.username}:`, error)
            return {
              friend: {
                id: friend.id || friend._id,
                username: friend.username || friend.name
              },
              interestedEvents: []
            }
          }
        })

        const friendInterestsResults = await Promise.all(friendInterestsPromises)

        // Find friends interested in this specific event
        const friendsInterestedInEvent = []
        friendInterestsResults.forEach(({ friend, interestedEvents }) => {
          if (interestedEvents.includes(eventId)) {
            friendsInterestedInEvent.push(friend)
          }
        })

        return friendsInterestedInEvent
      } catch (error) {
        console.error('Error getting friends attending:', error)
        // Fallback to mock data
        return this.getMockFriendsAttending(eventId)
      }
    },

    getMockFriendsAttending(eventId) {
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

    // Debug method to manually refresh friends attending data
    async debugRefreshFriendsAttending() {
      console.log('Debug: Refreshing friends attending data...')
      console.log('Current friends:', this.friends)
      console.log('Current events:', this.recommendedEvents.length + this.allEvents.length)
      await this.loadFriendsAttendingData()
      console.log('Updated friends attending map:', this.friendsAttendingMap)
    },
    
    isUserInterested(eventId) {
      return this.userInterests.some(interest => interest.item === eventId)
    },

    async handleInterestChange(eventId, isInterested) {
      console.log(`Event ${eventId} interest changed:`, isInterested)
      
      try {
        if (isInterested) {
          // Add interest to the event
          await interestAPI.addItemInterest(this.currentUser, eventId)
          console.log(`Added interest for event ${eventId}`)
          
          // Update local state
          this.userInterests.push({ item: eventId })
        } else {
          // Remove interest from the event
          await interestAPI.removeItemInterest(this.currentUser, eventId)
          console.log(`Removed interest for event ${eventId}`)
          
          // Update local state
          this.userInterests = this.userInterests.filter(interest => interest.item !== eventId)
        }
        
        // Refresh friends attending data since user's interest changed
        await this.loadFriendsAttendingData()
        
      } catch (error) {
        console.error('Error updating interest:', error)
        alert('Failed to update interest. Please try again.')
        
        // Reload user interests to get correct state
        await this.loadUserInterests()
      }
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
  margin-bottom: 4rem; /* More generous spacing */
  padding: 2rem 0; /* More padding */
}

.welcome-section h2 {
  color: #2f3e46;
  font-size: 3rem; /* Much larger for desktop */
  font-weight: 600; /* Bolder */
  margin-bottom: 1.5rem; /* More spacing */
  letter-spacing: -0.025em;
}

.welcome-section p {
  color: #52796f;
  font-size: 1.25rem; /* Larger font */
  max-width: 800px; /* Wider max-width */
  margin: 0 auto;
  line-height: 1.7; /* Better line height */
}

.events-section {
  margin-bottom: 6rem; /* More generous spacing */
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem; /* More spacing */
}

.section-header h3 {
  color: #2f3e46;
  font-size: 2rem; /* Larger for desktop */
  font-weight: 600; /* Bolder */
  margin: 0;
  letter-spacing: -0.025em;
}

.btn-refresh {
  background: #84a98c;
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
  background: #74a077;
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
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); /* Larger cards for desktop */
  gap: 3rem; /* More spacing between cards */
  max-width: none;
}

.all-events-section {
  margin-top: 4rem;
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
