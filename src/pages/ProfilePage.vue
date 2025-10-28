<template>
  <!-- Page Header -->
  <section class="page-header">
    <h2>Your Profile</h2>
    <p>Manage your account settings and preferences.</p>
  </section>

    <!-- Profile Content -->
    <div class="profile-content">
      <div class="profile-grid">
        <!-- User Info Card -->
        <div class="profile-card">
          <div class="card-header">
            <h3>Account Information</h3>
          </div>
          <div class="card-body">
            <div class="user-avatar">
              <span class="avatar-text">{{ userInitials }}</span>
            </div>
            <div class="user-info">
              <h4>{{ currentUsername }}</h4>
              <p class="member-since">Member since {{ memberSince }}</p>
            </div>
          </div>
        </div>

        <!-- Friends Card -->
        <div class="profile-card">
          <div class="card-header">
            <h3>Friends</h3>
            <button class="btn btn-sm btn-primary" @click="showAddFriendModal = true">
              Add Friend
            </button>
          </div>
          <div class="card-body">
            <!-- Friend List -->
            <div class="friends-section">
              <h4>Your Friends ({{ acceptedFriends.length }})</h4>
              <div v-if="acceptedFriends.length === 0" class="no-friends">
                <p>No friends yet.</p>
                <p class="subtitle">Send friend requests to connect with others!</p>
              </div>
              <div v-else class="friends-list">
                <div 
                  v-for="friend in acceptedFriends" 
                  :key="friend.id"
                  class="friend-item"
                >
                  <div class="friend-avatar">
                    <span class="avatar-text">{{ getInitials(friend.username) }}</span>
                  </div>
                  <div class="friend-info">
                    <span class="friend-name">{{ friend.username }}</span>
                  </div>
                  <div class="friend-actions">
                    <button 
                      class="btn btn-sm btn-danger" 
                      @click="removeFriend(friend.id)"
                      :disabled="processingRequest === friend.id"
                      title="Remove friend"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pending Requests -->
            <div v-if="pendingRequests.length > 0" class="friends-section">
              <h4>Pending Requests ({{ pendingRequests.length }})</h4>
              <div class="pending-list">
                <div 
                  v-for="request in pendingRequests" 
                  :key="request.id"
                  class="friend-item"
                >
                  <div class="friend-avatar">
                    <span class="avatar-text">{{ getInitials(request.username) }}</span>
                  </div>
                  <div class="friend-info">
                    <span class="friend-name">{{ request.username }}</span>
                    <span class="request-status">Wants to be friends</span>
                  </div>
                  <div class="friend-actions">
                    <button 
                      class="btn btn-sm btn-primary" 
                      @click="acceptFriendRequest(request.id)"
                      :disabled="processingRequest === request.id"
                    >
                      Accept
                    </button>
                    <button 
                      class="btn btn-sm btn-secondary" 
                      @click="rejectFriendRequest(request.id)"
                      :disabled="processingRequest === request.id"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Outgoing Requests -->
            <div v-if="outgoingRequests.length > 0" class="friends-section">
              <h4>Sent Requests ({{ outgoingRequests.length }})</h4>
              <div class="pending-list">
                <div 
                  v-for="request in outgoingRequests" 
                  :key="request.id"
                  class="friend-item"
                >
                  <div class="friend-avatar">
                    <span class="avatar-text">{{ getInitials(request.username) }}</span>
                  </div>
                  <div class="friend-info">
                    <span class="friend-name">{{ request.username }}</span>
                    <span class="request-status">Awaiting response</span>
                  </div>
                  <div class="friend-actions">
                    <button 
                      class="btn btn-sm btn-secondary" 
                      @click="cancelFriendRequest(request.id)"
                      :disabled="processingRequest === request.id"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Interests Card -->
        <div class="profile-card">
          <div class="card-header">
            <h3>Your Interests</h3>
            <button class="btn btn-sm btn-primary" @click="showInterestModal = true">
              Add Interest
            </button>
          </div>
          <div class="card-body">
            <div v-if="interests.length === 0" class="no-interests">
              <p>No interests added yet.</p>
              <p class="subtitle">Add interests to get better event recommendations!</p>
            </div>
            <div v-else class="interests-list">
              <span 
                v-for="interest in interests" 
                :key="interest"
                class="interest-tag"
              >
                {{ interest }}
                <button 
                  @click="removeInterest(interest)" 
                  class="remove-interest"
                >
                  ×
                </button>
              </span>
            </div>
          </div>
        </div>

        <!-- Stats Card -->
        <div class="profile-card">
          <div class="card-header">
            <h3>Your Activity</h3>
            <div class="card-header-actions">
              <button class="btn btn-sm btn-secondary" @click="loadStats" :disabled="loadingStats">
                {{ loadingStats ? 'Refreshing...' : 'Refresh' }}
              </button>
            </div>
          </div>
          <div class="card-body">
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-number">{{ stats.eventsAttended }}</div>
                <div class="stat-label">Events Attended</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ stats.reviewsWritten }}</div>
                <div class="stat-label">Reviews Written</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ stats.friendsCount }}</div>
                <div class="stat-label">Friends</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">{{ stats.eventsCreated }}</div>
                <div class="stat-label">Events Created</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Reviews Card -->
        <div class="profile-card">
          <div class="card-header">
            <h3>Recent Reviews</h3>
            <router-link to="/history" class="btn btn-sm btn-primary">
              View All
            </router-link>
          </div>
          <div class="card-body">
            <div v-if="recentReviews.length === 0" class="no-reviews">
              <p>No reviews yet.</p>
              <p class="subtitle">Attend events and share your experience!</p>
            </div>
            <div v-else class="reviews-list">
              <div 
                v-for="review in recentReviews.slice(0, 3)" 
                :key="review.id" 
                class="review-item"
              >
                <div class="review-event">{{ review.eventName }}</div>
                <div class="review-rating">
                  <span 
                    v-for="star in 5" 
                    :key="star"
                    class="star"
                    :class="{ 'filled': star <= review.rating }"
                  >
                    ★
                  </span>
                </div>
                <div class="review-text">{{ review.entry }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Event Preferences Card -->
        <div class="profile-card">
          <div class="card-header">
            <h3>Event Preferences</h3>
            <button class="btn btn-sm btn-primary" @click="showPreferencesModal = true">
              Edit
            </button>
          </div>
          <div class="card-body">
            <div class="preferences-list">
              <div class="preference-item">
                <span class="preference-label">Location Radius</span>
                <span class="preference-value">{{ preferences.locationRadius || '10' }} miles</span>
              </div>
              <div class="preference-item">
                <span class="preference-label">Event Types</span>
                <span class="preference-value">{{ preferences.eventTypes || 'All types' }}</span>
              </div>
              <div class="preference-item">
                <span class="preference-label">Time Preference</span>
                <span class="preference-value">{{ preferences.timePreference || 'Any time' }}</span>
              </div>
              <div class="preference-item">
                <span class="preference-label">Group Size</span>
                <span class="preference-value">{{ preferences.groupSize || 'Any size' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Interest Modal -->
    <div v-if="showInterestModal" class="modal-overlay" @click="closeInterestModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Add Interest</h3>
          <button class="modal-close" @click="closeInterestModal">×</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Interest Tag</label>
            <input 
              v-model="newInterest" 
              type="text" 
              class="form-input"
              placeholder="e.g., Technology, Music, Sports"
              @keyup.enter="addInterest"
            />
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeInterestModal">
            Cancel
          </button>
          <button 
            class="btn btn-primary" 
            @click="addInterest"
            :disabled="!newInterest.trim()"
          >
            Add Interest
          </button>
        </div>
      </div>
    </div>

    <!-- Add Friend Modal -->
    <div v-if="showAddFriendModal" class="modal-overlay" @click="closeAddFriendModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Add Friend</h3>
          <button class="modal-close" @click="closeAddFriendModal">×</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Username</label>
            <input 
              v-model="newFriendUsername" 
              type="text" 
              class="form-input"
              placeholder="Enter username to send friend request"
              @keyup.enter="sendFriendRequest"
            />
          </div>
          <div v-if="friendRequestError" class="error-message">
            {{ friendRequestError }}
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeAddFriendModal">
            Cancel
          </button>
          <button 
            class="btn btn-primary" 
            @click="sendFriendRequest"
            :disabled="!newFriendUsername.trim() || sendingFriendRequest"
          >
            {{ sendingFriendRequest ? 'Sending...' : 'Send Request' }}
          </button>
        </div>
      </div>
    </div>
</template>

<script>
import { interestAPI, friendingAPI, authAPI, reviewingAPI, eventAPI } from '../api/services.js'
import { useAuth } from '../composables/useAuth.js'

export default {
  name: 'ProfilePage',
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
      interests: [],
      stats: {
        eventsAttended: 0,
        reviewsWritten: 0,
        friendsCount: 0,
        eventsCreated: 0
      },
      showInterestModal: false,
      newInterest: '',
      // Friends data
      acceptedFriends: [],
      pendingRequests: [],
      outgoingRequests: [],
      friendsPollInterval: null,
      showAddFriendModal: false,
      newFriendUsername: '',
      friendRequestError: '',
      sendingFriendRequest: false,
      processingRequest: null,
      fetchedUsername: null,
      loadingStats: false,
      // Recent reviews data
      recentReviews: [],
      // Event preferences data
      preferences: {
        locationRadius: '10',
        eventTypes: 'All types',
        timePreference: 'Any time',
        groupSize: 'Any size'
      },
      showPreferencesModal: false
    }
  },
  computed: {
    currentUsername() {
      // If user is just an ID string, we need to fetch the username from API
      if (typeof this.user === 'string') {
        return this.fetchedUsername || 'Loading...'
      }
      
      // Try different possible username fields
      const username = this.user?.username || 
                      this.user?.name || 
                      this.user?.id || 
                      this.user?._id
      
      // If no username found, try to get from localStorage
      if (!username) {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser)
            return parsedUser.username || parsedUser.name || parsedUser.id || 'Demo User'
          } catch (e) {
            console.error('Error parsing stored user:', e)
          }
        }
      }
      
      return username || 'Demo User'
    },
    userInitials() {
      return this.currentUsername
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
    },
    memberSince() {
      // Get registration date from localStorage
      const registrationDate = localStorage.getItem('registrationDate')
      
      if (registrationDate) {
        const date = new Date(registrationDate)
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December']
        const month = monthNames[date.getMonth()]
        const year = date.getFullYear()
        return `${month} ${year}`
      }
      
      // Fallback to current date if no registration date found
      const now = new Date()
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December']
      const month = monthNames[now.getMonth()]
      const year = now.getFullYear()
      return `${month} ${year}`
    }
  },
  async mounted() {
    console.log('Profile page - User object:', this.user)
    console.log('Profile page - Current username:', this.currentUsername)
    console.log('Profile page - Stored user:', localStorage.getItem('user'))
    
    // If user is just an ID string, fetch the username
    if (typeof this.user === 'string') {
      await this.fetchUsername()
    }
    
    await this.loadFriendsData()
    await this.loadInterests()
    await this.loadStats()
    await this.loadRecentReviews()
    
    // Start polling for friend data changes
    this.startFriendsPolling()
  },
  
  beforeUnmount() {
    // Clean up polling when leaving the page
    this.stopFriendsPolling()
  },
  methods: {
    // Polling methods for real-time updates
    startFriendsPolling() {
      // Poll every 5 seconds to check for friend data changes
      this.friendsPollInterval = setInterval(() => {
        this.loadFriendsData()
      }, 5000)
      console.log('Started friends polling')
    },
    
    stopFriendsPolling() {
      if (this.friendsPollInterval) {
        clearInterval(this.friendsPollInterval)
        this.friendsPollInterval = null
        console.log('Stopped friends polling')
      }
    },
    
    // Username methods
    async fetchUsername() {
      try {
        const response = await authAPI.getUsername(this.user)
        this.fetchedUsername = response.data[0]?.username || this.user
        console.log('Fetched username:', this.fetchedUsername)
      } catch (error) {
        console.error('Error fetching username:', error)
        this.fetchedUsername = this.user // fallback to user ID
      }
    },
    
    // Stats methods
    async loadStats() {
      this.loadingStats = true
      try {
        const userId = this.user?.id || this.user?._id || this.user || 'user123'
        console.log('ProfilePage - Loading stats for user ID:', userId)
        console.log('ProfilePage - User object:', this.user)
        
        // Load stats in parallel
        console.log('Making API calls for stats...')
        const [friendsResponse, interestsResponse, reviewsResponse, eventsResponse] = await Promise.all([
          friendingAPI.getFriends(userId).catch((err) => { console.error('Friends API error:', err); return { data: [] } }),
          interestAPI.getItemInterests(userId).catch((err) => { console.error('Interests API error:', err); return { data: [] } }),
          reviewingAPI.getReviewsByUser(userId).catch((err) => { console.error('Reviews API error:', err); return { data: [] } }),
          eventAPI.getEventsByOrganizer(userId).catch((err) => { console.error('Events API error:', err); return { data: [] } })
        ])
        
        console.log('All API responses received')
        
        // Count friends (accepted friends only)
        const friends = friendsResponse.data || []
        this.stats.friendsCount = friends.filter(friend => friend.status === 'accepted').length
        
        // Count events attended (interested events that have passed their end time)
        const interestedItems = interestsResponse.data || []
        const interestedEventIds = interestedItems.map(item => item.item)
        
        if (interestedEventIds.length > 0) {
          const eventPromises = interestedEventIds.map(eventId => 
            eventAPI.getEventById(eventId).catch(() => null)
          )
          const eventResponses = await Promise.all(eventPromises)
          
          const now = new Date()
          const events = eventResponses
            .filter(response => response !== null && response.data)
            .map(response => response.data[0])
            .filter(event => {
              if (!event || !event.date || !event.duration) return false
              
              const eventStartTime = new Date(event.date)
              const eventEndTime = new Date(eventStartTime.getTime() + (event.duration * 60 * 1000))
              
              // Count events that have ended
              return eventEndTime <= now
            })
          
          this.stats.eventsAttended = events.length
        } else {
          this.stats.eventsAttended = 0
        }
        
        // Count reviews written
        const reviews = reviewsResponse.data || []
        this.stats.reviewsWritten = reviews.length
        
        // Count events created
        const createdEvents = eventsResponse.data || []
        this.stats.eventsCreated = createdEvents.length
        
        console.log('Events created response:', eventsResponse)
        console.log('Created events array:', createdEvents)
        console.log('Events created count:', this.stats.eventsCreated)
        console.log('Loaded stats:', this.stats)
      } catch (error) {
        console.error('Error loading stats:', error)
        // Keep default values on error
      } finally {
        this.loadingStats = false
      }
    },

    // Recent reviews methods
    async loadRecentReviews() {
      try {
        const userId = this.user?.id || this.user?._id || this.user || 'user123'
        const response = await reviewingAPI.getReviewsByUser(userId)
        
        // Extract the actual review objects from the nested structure
        const reviews = (response.data || []).map(item => item.review).filter(review => review)
        console.log('Profile page - Loaded reviews:', reviews)
        
        // Get event names for each review
        const reviewsWithEventNames = await Promise.all(
          reviews.map(async (review) => {
            try {
              const eventResponse = await eventAPI.getEventById(review.target)
              const event = eventResponse.data?.[0]
              return {
                ...review,
                eventName: event?.name || 'Unknown Event'
              }
            } catch (error) {
              console.error('Error fetching event for review:', error)
              return {
                ...review,
                eventName: 'Unknown Event'
              }
            }
          })
        )
        
        // Sort by date (most recent first) and take the latest 5
        this.recentReviews = reviewsWithEventNames
          .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
          .slice(0, 5)
      } catch (error) {
        console.error('Error loading recent reviews:', error)
        this.recentReviews = []
      }
    },
    
    // Interests methods
    async loadInterests() {
      try {
        const userId = this.user?.id || this.user?._id || this.user || 'user123'
        console.log('Loading interests - User object:', this.user)
        console.log('Loading interests - User ID:', userId)
        const response = await interestAPI.getPersonalInterests(userId)
        const interestsData = response.data || []
        
        // Extract interest names if they're objects, otherwise use as strings
        this.interests = interestsData.map(interest => {
          if (typeof interest === 'string') {
            return interest
          } else if (interest && typeof interest === 'object') {
            // If it's an object, try to get the name/tag field
            return interest.name || interest.tag || interest.interest || interest
          }
          return interest
        })
      } catch (error) {
        console.error('Error loading interests:', error)
        // On error, set to empty array (no fallback interests)
        this.interests = []
      }
    },

    // Friends methods
    async loadFriendsData() {
      try {
        const userId = this.user?.id || this.user?._id || this.user || 'user123'
        console.log('Loading friends data - User ID:', userId)
        
        // Load accepted friends
        const friendsResponse = await friendingAPI.getFriends(userId)
        console.log('Friends response:', friendsResponse)
        console.log('Friends data:', friendsResponse.data)
        
        const rawFriends = friendsResponse.data || []
        
        // Fetch usernames for each friend
        this.acceptedFriends = await Promise.all(
          rawFriends.map(async (friendItem) => {
            try {
              // friendItem.friend is the user ID
              const friendId = friendItem.friend
              const usernameResponse = await authAPI.getUsername(friendId)
              
              let username = friendId
              if (usernameResponse.data) {
                if (Array.isArray(usernameResponse.data)) {
                  username = usernameResponse.data[0]?.username || usernameResponse.data[0] || friendId
                } else if (typeof usernameResponse.data === 'object' && usernameResponse.data.username) {
                  username = usernameResponse.data.username
                } else {
                  username = usernameResponse.data
                }
              }
              
              return {
                id: friendId,
                username: username
              }
            } catch (error) {
              console.error('Error fetching username for friend:', error)
              return {
                id: friendItem.friend,
                username: friendItem.friend // Fallback to ID
              }
            }
          })
        )
        
        console.log('Processed friends:', this.acceptedFriends)

        // Load incoming requests
        const requestsResponse = await friendingAPI.getIncomingRequests(userId)
        console.log('Incoming requests response:', requestsResponse)
        console.log('Incoming requests data:', requestsResponse.data)
        
        const rawPendingRequests = requestsResponse.data || []
        
        // Fetch usernames for each requester
        this.pendingRequests = await Promise.all(
          rawPendingRequests.map(async (request) => {
            try {
              // request.requester is the user ID who sent the request
              const requesterId = request.requester
              const usernameResponse = await authAPI.getUsername(requesterId)
              
              let username = requesterId
              if (usernameResponse.data) {
                if (Array.isArray(usernameResponse.data)) {
                  username = usernameResponse.data[0]?.username || usernameResponse.data[0] || requesterId
                } else if (typeof usernameResponse.data === 'object' && usernameResponse.data.username) {
                  username = usernameResponse.data.username
                } else {
                  username = usernameResponse.data
                }
              }
              
              return {
                id: requesterId, // Use requester ID as the ID for accept/reject
                username: username
              }
            } catch (error) {
              console.error('Error fetching username for requester:', error)
              return {
                id: request.requester,
                username: request.requester // Fallback to ID
              }
            }
          })
        )

        // Load outgoing requests
        const outgoingResponse = await friendingAPI.getOutgoingRequests(userId)
        console.log('Outgoing requests response:', outgoingResponse)
        console.log('Outgoing requests data:', outgoingResponse.data)
        
        const rawOutgoingRequests = outgoingResponse.data || []
        
        // Fetch usernames for each target user
        this.outgoingRequests = await Promise.all(
          rawOutgoingRequests.map(async (request) => {
            try {
              // request.target is the user ID who received the request
              const targetId = request.target
              const usernameResponse = await authAPI.getUsername(targetId)
              
              let username = targetId
              if (usernameResponse.data) {
                if (Array.isArray(usernameResponse.data)) {
                  username = usernameResponse.data[0]?.username || usernameResponse.data[0] || targetId
                } else if (typeof usernameResponse.data === 'object' && usernameResponse.data.username) {
                  username = usernameResponse.data.username
                } else {
                  username = usernameResponse.data
                }
              }
              
              return {
                id: targetId, // Use target ID as the ID for cancel
                username: username
              }
            } catch (error) {
              console.error('Error fetching username for target:', error)
              return {
                id: request.target,
                username: request.target // Fallback to ID
              }
            }
          })
        )

        // Update friends count in stats
        this.stats.friendsCount = this.acceptedFriends.length
      } catch (error) {
        console.error('Error loading friends data:', error)
        // Keep empty arrays on error
        this.acceptedFriends = []
        this.pendingRequests = []
        this.outgoingRequests = []
      }
    },

    async cancelFriendRequest(targetId) {
      this.processingRequest = targetId
      try {
        const userId = this.user?.id || this.user?._id || this.user || 'user123'
        await friendingAPI.removeFriendRequest(userId, targetId)
        
        // Reload friends data
        await this.loadFriendsData()
        
        // Force Vue to update the DOM
        await this.$nextTick()
        this.$forceUpdate()
      } catch (error) {
        console.error('Error cancelling friend request:', error)
        alert('Failed to cancel friend request. Please try again.')
      } finally {
        this.processingRequest = null
      }
    },

    async sendFriendRequest() {
      if (!this.newFriendUsername.trim()) return

      this.sendingFriendRequest = true
      this.friendRequestError = ''

      try {
        const userId = this.user?.id || this.user?._id || this.user || 'user123'
        const targetUsername = this.newFriendUsername.trim()
        
        console.log('Sending friend request - From user:', userId)
        console.log('Sending friend request - To username:', targetUsername)
        
        // First, get the user ID from the username
        const targetUserResponse = await authAPI.getUserByUsername(targetUsername)
        console.log('Target user response:', targetUserResponse)
        
        if (!targetUserResponse.data || targetUserResponse.data.length === 0) {
          throw new Error('User not found')
        }
        
        const targetUserId = targetUserResponse.data[0].user || targetUserResponse.data[0].id || targetUserResponse.data[0]._id
        console.log('Target user ID:', targetUserId)
        
        // Check if they've already sent you a request
        const hasIncomingRequest = this.pendingRequests.some(req => req.id === targetUserId)
        if (hasIncomingRequest) {
          this.friendRequestError = 'This user has already sent you a friend request. Please accept or reject it first.'
          console.log('User has already sent a request')
          return
        }
        
        // Check if you've already sent them a request
        const hasOutgoingRequest = this.outgoingRequests.some(req => req.id === targetUserId)
        if (hasOutgoingRequest) {
          this.friendRequestError = 'You have already sent this user a friend request.'
          console.log('Already sent request to this user')
          return
        }
        
        // Check if you're already friends
        const alreadyFriends = this.acceptedFriends.some(friend => friend.id === targetUserId)
        if (alreadyFriends) {
          this.friendRequestError = 'You are already friends with this user.'
          console.log('Already friends with this user')
          return
        }
        
        // Now send the friend request with user IDs
        await friendingAPI.sendFriendRequest(
          userId,
          targetUserId
        )
        
        console.log('Friend request sent successfully')
        this.closeAddFriendModal()
        // Reload friends data to show the new outgoing request
        await this.loadFriendsData()
        
        // Force Vue to update the DOM
        await this.$nextTick()
        this.$forceUpdate()
      } catch (error) {
        console.error('Error sending friend request:', error)
        
        // Display appropriate error message from backend
        let errorMessage = 'Failed to send friend request'
        if (error.response?.data?.error) {
          errorMessage = error.response.data.error
        } else if (error.message) {
          errorMessage = error.message
        }
        
        this.friendRequestError = errorMessage
      } finally {
        this.sendingFriendRequest = false
      }
    },

    async acceptFriendRequest(requestId) {
      this.processingRequest = requestId
      try {
        const userId = this.user?.id || this.user?._id || this.user || 'user123'
        console.log('Accepting friend request - Requester ID:', requestId)
        console.log('Accepting friend request - Target ID (current user):', userId)
        
        await friendingAPI.acceptFriendRequest(
          requestId,
          userId
        )
        
        console.log('Friend request accepted successfully')
        
        // Reload friends data and stats
        await this.loadFriendsData()
        await this.loadStats()
        
        // Force Vue to update the DOM
        await this.$nextTick()
        this.$forceUpdate()
      } catch (error) {
        console.error('Error accepting friend request:', error)
        alert('Failed to accept friend request. Please try again.')
      } finally {
        this.processingRequest = null
      }
    },

    async rejectFriendRequest(requestId) {
      this.processingRequest = requestId
      try {
        const userId = this.user?.id || this.user?._id || this.user || 'user123'
        console.log('Rejecting friend request - Requester ID:', requestId)
        console.log('Rejecting friend request - Target ID (current user):', userId)
        
        await friendingAPI.removeFriendRequest(
          requestId,
          userId
        )
        
        console.log('Friend request rejected successfully')
        
        // Reload friends data and stats
        await this.loadFriendsData()
        await this.loadStats()
        
        // Force Vue to update the DOM
        await this.$nextTick()
        this.$forceUpdate()
      } catch (error) {
        console.error('Error rejecting friend request:', error)
        alert('Failed to reject friend request. Please try again.')
      } finally {
        this.processingRequest = null
      }
    },

    async removeFriend(friendId) {
      if (!confirm('Are you sure you want to remove this friend?')) {
        return
      }

      this.processingRequest = friendId
      try {
        const userId = this.user?.id || this.user?._id || this.user || 'user123'
        await friendingAPI.removeFriend(
          userId,
          friendId
        )
        
        // Reload friends data and stats
        await this.loadFriendsData()
        await this.loadStats()
        
        // Force Vue to update the DOM
        await this.$nextTick()
        this.$forceUpdate()
      } catch (error) {
        console.error('Error removing friend:', error)
        alert('Failed to remove friend. Please try again.')
      } finally {
        this.processingRequest = null
      }
    },

    getInitials(username) {
      if (!username) return '?'
      return username
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    },

    closeAddFriendModal() {
      this.showAddFriendModal = false
      this.newFriendUsername = ''
      this.friendRequestError = ''
    },

    async addInterest() {
      if (this.newInterest.trim() && !this.interests.includes(this.newInterest.trim())) {
        try {
          const userId = this.user?.id || this.user?._id || this.user || 'user123'
          console.log('Adding interest - User object:', this.user)
          console.log('Adding interest - User ID:', userId)
          await interestAPI.addPersonalInterest(
            userId,
            this.newInterest.trim()
          )
          
          this.interests.push(this.newInterest.trim())
          this.newInterest = ''
          this.closeInterestModal()
          // Refresh stats after adding interest
          await this.loadStats()
        } catch (error) {
          console.error('Error adding interest:', error)
          alert('Failed to add interest. Please try again.')
        }
      }
    },
    
    async removeInterest(interest) {
      const index = this.interests.indexOf(interest)
      if (index > -1) {
        try {
          const userId = this.user?.id || this.user?._id || this.user || 'user123'
          await interestAPI.removePersonalInterest(
            userId,
            interest
          )
          
          this.interests.splice(index, 1)
          // Refresh stats after removing interest
          await this.loadStats()
        } catch (error) {
          console.error('Error removing interest:', error)
          alert('Failed to remove interest. Please try again.')
        }
      }
    },
    
    closeInterestModal() {
      this.showInterestModal = false
      this.newInterest = ''
    },
  }
}
</script>

<style scoped>
.page-header {
  text-align: center;
  margin-bottom: 4rem; /* More generous spacing */
  padding: 2rem 0; /* More padding */
}

.page-header h2 {
  color: #2f3e46;
  font-size: 3rem; /* Much larger for desktop */
  font-weight: 600; /* Bolder */
  margin-bottom: 1.5rem; /* More spacing */
  letter-spacing: -0.025em;
}

.page-header p {
  color: #52796f;
  font-size: 1.25rem; /* Larger font */
  max-width: 700px; /* Wider max-width */
  margin: 0 auto;
  line-height: 1.7; /* Better line height */
}

.profile-content {
  max-width: none;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 columns for 2x3 grid */
  gap: 2rem; /* Balanced spacing */
  max-width: none;
}

.profile-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.profile-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.card-header {
  background: #f8fafc;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-header h3 {
  color: #2c3e50;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.card-body {
  padding: 1.5rem;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #42b883, #369870);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.avatar-text {
  color: white;
  font-size: 2rem;
  font-weight: 700;
}

.user-info {
  text-align: center;
}

.user-info h4 {
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.member-since {
  color: #9ca3af;
  font-size: 0.875rem;
  margin: 0;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info h4 {
  color: #2c3e50;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.setting-info p {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

.toggle {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #d1d5db;
  transition: 0.2s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.2s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #42b883;
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

.no-interests {
  text-align: center;
  color: #6b7280;
}

.subtitle {
  color: #9ca3af;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.interests-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.interest-tag {
  background: #e8f0ea;
  color: #52796f;
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.remove-interest {
  background: none;
  border: none;
  color: #52796f;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.remove-interest:hover {
  background: rgba(82, 121, 111, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  color: #84a98c;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-block;
}

.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.8rem;
}

.btn-primary {
  background: #84a98c;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #74a077;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-danger {
  background: #dc2626;
  color: white;
  border: 1px solid #dc2626;
}

.btn-danger:hover:not(:disabled) {
  background: #b91c1c;
  border-color: #b91c1c;
}

.btn-danger:disabled {
  background: #9ca3af;
  border-color: #9ca3af;
  cursor: not-allowed;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  color: #2c3e50;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
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
  border-radius: 6px;
  font-size: 1rem;
}

.form-input:focus {
  outline: none;
  border-color: #42b883;
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
}

/* Friends Styles */
.friends-section {
  margin-bottom: 2rem;
}

.friends-section:last-child {
  margin-bottom: 0;
}

.friends-section h4 {
  color: #2c3e50;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.no-friends {
  text-align: center;
  color: #6b7280;
  padding: 1rem;
}

.friends-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.friend-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.friend-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #42b883, #369870);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.friend-avatar .avatar-text {
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
}

.friend-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.friend-name {
  color: #2c3e50;
  font-weight: 500;
  font-size: 0.875rem;
}

.request-status {
  color: #6b7280;
  font-size: 0.75rem;
}

.friend-actions {
  display: flex;
  gap: 0.5rem;
}

.pending-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.error-message {
  background: #fee2e2;
  color: #dc2626;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  margin-top: 1rem;
  border: 1px solid #fecaca;
}

/* Recent Reviews Styles */
.no-reviews {
  text-align: center;
  padding: 1rem;
  color: #6b7280;
}

.no-reviews .subtitle {
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.review-item {
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.review-event {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.review-rating {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.review-rating .star {
  color: #d1d5db;
  font-size: 0.875rem;
}

.review-rating .star.filled {
  color: #fbbf24;
}

.review-text {
  color: #4b5563;
  font-size: 0.875rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Event Preferences Styles */
.preferences-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.preference-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.preference-item:last-child {
  border-bottom: none;
}

.preference-label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.preference-value {
  color: #6b7280;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .page-header h2 {
    font-size: 1.5rem;
  }
  
  .profile-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
}
</style>
