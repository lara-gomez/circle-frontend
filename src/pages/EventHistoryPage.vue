<template>
  <!-- Page Header -->
  <section class="page-header">
    <h2>Your Event History</h2>
    <p>Review and manage your past event experiences.</p>
  </section>

  <!-- Search Section -->
  <div v-if="!loading && pastEvents.length > 0" class="search-section">
    <div class="search-container">
      <input 
        v-model="searchQuery"
        type="text" 
        placeholder="Search events by name, location, or description..."
        class="search-input"
      />
      <div class="search-results-info" v-if="searchQuery.trim()">
        Showing {{ filteredPastEvents.length }} of {{ pastEvents.length }} events
      </div>
    </div>
  </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Loading your event history...</p>
    </div>

    <!-- No Events State -->
    <div v-else-if="pastEvents.length === 0" class="no-events">
      <div class="no-events-content">
        <span class="no-events-icon">📅</span>
        <h3>No Past Events</h3>
        <p>You haven't attended any events yet.</p>
        <router-link to="/discovery" class="btn btn-primary">
          Discover Events
        </router-link>
      </div>
    </div>

    <!-- Events List -->
    <div v-else class="events-list">
      <div 
        v-for="event in filteredPastEvents" 
        :key="event._id" 
        class="event-history-card"
      >
        <div class="event-header">
          <div class="event-title-section">
            <h3 class="event-title">{{ event.name }}</h3>
            <div class="event-date">{{ formatDate(event.date) }}</div>
          </div>
          <div class="event-status" :class="getStatusClass(event)">
            {{ getEventStatus(event) }}
          </div>
        </div>

        <div class="event-details">
          <div class="event-info">
            <div class="info-item">
              <span class="icon">📍</span>
              <span>{{ event.location }}</span>
            </div>
            <div class="info-item">
              <span class="icon">👤</span>
              <span>{{ getOrganizerUsername(event.organizer) }}</span>
            </div>
            <div class="info-item">
              <span class="icon">⏰</span>
              <span>{{ formatDuration(event.duration) }}</span>
            </div>
          </div>
          <p class="event-description">{{ event.description }}</p>
        </div>

        <!-- Review Section -->
        <div class="review-section">
          <div class="review-header">
            <h4>Your Review</h4>
            <div class="review-actions">
              <button 
                v-if="!event.review" 
                @click="openReviewModal(event)" 
                class="btn btn-add-review"
              >
                Add Review
              </button>
              <button 
                v-else 
                @click="openReviewModal(event)" 
                class="btn btn-edit-review"
              >
                Edit Review
              </button>
              <button 
                v-if="event.review"
                @click="deleteReview(event)" 
                class="btn btn-delete-review"
                :disabled="deletingReview === event._id"
              >
                {{ deletingReview === event._id ? 'Deleting...' : 'Delete Review' }}
              </button>
              <button 
                @click="removeFromHistory(event)" 
                class="btn btn-remove-history"
              >
                Remove from History
              </button>
            </div>
          </div>

          <div v-if="event.review" class="review-content">
            <div class="review-rating">
              <div class="stars">
                <span 
                  v-for="star in 5" 
                  :key="star"
                  class="star"
                  :class="{ 'filled': star <= (event.review.rating / 2) }"
                >
                  ★
                </span>
              </div>
              <span class="rating-value">{{ event.review.rating }}/10</span>
            </div>
            <p class="review-text" v-if="event.review.entry">
              "{{ event.review.entry }}"
            </p>
          </div>

          <div v-else class="no-review">
            <p>No review yet. Share your experience!</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Review Modal -->
    <div v-if="showReviewModal" class="modal-overlay" @click="closeReviewModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingEvent ? 'Edit Review' : 'Add Review' }}</h3>
          <button class="modal-close" @click="closeReviewModal">×</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Rating (0-10)</label>
            <input 
              v-model="reviewForm.rating" 
              type="number" 
              min="0" 
              max="10" 
              step="0.5"
              class="form-input"
              placeholder="Enter rating"
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Review Text</label>
            <textarea 
              v-model="reviewForm.entry" 
              class="form-textarea"
              placeholder="Share your experience..."
              rows="4"
            ></textarea>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeReviewModal">
            Cancel
          </button>
          <button 
            class="btn btn-primary" 
            @click="saveReview"
            :disabled="saving"
          >
            {{ saving ? 'Saving...' : 'Save Review' }}
          </button>
        </div>
      </div>
    </div>
</template>

<script>
import { eventAPI, reviewingAPI, interestAPI } from '../api/services.js'
import { useAuth } from '../composables/useAuth.js'

export default {
  name: 'EventHistoryPage',
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
      pastEvents: [],
      loading: true,
      showReviewModal: false,
      editingEvent: null,
      saving: false,
      organizerUsernames: {}, // Cache for organizer usernames
      deletingReview: null, // Track which review is being deleted
      searchQuery: '', // Search input
      reviewForm: {
        rating: 0,
        entry: ''
      }
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
    },
    
    filteredPastEvents() {
      if (!this.searchQuery.trim()) {
        return this.pastEvents
      }
      
      const query = this.searchQuery.toLowerCase()
      return this.pastEvents.filter(event => 
        event.name.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        (event.description && event.description.toLowerCase().includes(query))
      )
    }
  },
  async mounted() {
    await this.initializeUser()
    await this.loadPastEvents()
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

    async loadPastEvents() {
      this.loading = true
      try {
        // Get user's interested events (same logic as EventManagerPage)
        console.log('EventHistoryPage - Getting interests for user:', this.currentUser)
        const interestsResponse = await interestAPI.getItemInterests(this.currentUser)
        console.log('EventHistoryPage - Interests response:', interestsResponse)
        const interestedItems = interestsResponse.data || []
        console.log('EventHistoryPage - Interested items:', interestedItems)
        
        if (interestedItems.length === 0) {
          this.pastEvents = []
          this.loading = false
          return
        }

        // Get each interested event by ID in parallel
        const interestedEventIds = interestedItems.map(item => item.item)
        
        const eventPromises = interestedEventIds.map(eventId => 
          eventAPI.getEventById(eventId).catch(error => {
            console.warn(`Failed to fetch event ${eventId}:`, error)
            return null
          })
        )
        
        const eventResponses = await Promise.all(eventPromises)
        
        // Filter out null responses and extract events
        const allInterestedEvents = eventResponses
          .filter(response => response !== null && response.data && response.data[0])
          .map(response => response.data[0])
          .filter(event => event && event._id) // Ensure each event is valid

        // Filter for events that have passed their end time (regardless of status)
        const now = new Date()
        console.log('EventHistoryPage - Current time:', now)
        console.log('EventHistoryPage - All interested events:', allInterestedEvents)
        
        const completedEvents = allInterestedEvents.filter(event => {
          if (!event || !event.date || !event.duration) {
            console.log('EventHistoryPage - Skipping event with missing data:', event)
            return false
          }
          
          const eventStartTime = new Date(event.date)
          const eventEndTime = new Date(eventStartTime.getTime() + (event.duration * 60 * 1000))
          
          console.log(`EventHistoryPage - Event: ${event.name}, Start: ${eventStartTime}, End: ${eventEndTime}, Has ended: ${eventEndTime <= now}`)
          
          // Show events that have ended
          return eventEndTime <= now
        })
        
        console.log('EventHistoryPage - Completed events:', completedEvents)
        
        // Get user's existing reviews to attach to events
        const reviewsResponse = await reviewingAPI.getReviewsByUser(this.currentUser)
        const reviews = reviewsResponse.data || []
        console.log('EventHistoryPage - Reviews response:', reviews)
        
        // Create a map of event ID to review for quick lookup
        const reviewMap = {}
        reviews.forEach(reviewData => {
          console.log('EventHistoryPage - Review data:', reviewData)
          const review = reviewData.review || reviewData
          console.log('EventHistoryPage - Review object:', review)
          reviewMap[review.target] = review
        })
        console.log('EventHistoryPage - Review map:', reviewMap)
        
        // Attach reviews to events where they exist
        this.pastEvents = completedEvents.map(event => ({
          ...event,
          review: reviewMap[event._id] || null
        })).sort((a, b) => new Date(b.date) - new Date(a.date))
        
        // Load organizer usernames for past events
        await this.loadOrganizerUsernames(this.pastEvents)
        
        // No mock data fallback - only show real events
      } catch (error) {
        console.error('Error loading past events:', error)
        // Keep empty array on error
        this.pastEvents = []
      } finally {
        this.loading = false
      }
    },

    async loadOrganizerUsernames(events) {
      const uniqueOrganizers = [...new Set(events.map(event => event.organizer))]
      
      for (const organizerId of uniqueOrganizers) {
        if (!this.organizerUsernames[organizerId]) {
          try {
            const { authAPI } = await import('../api/services.js')
            const response = await authAPI.getUsername(organizerId)
            
            // Handle different response formats
            if (response.data) {
              if (Array.isArray(response.data)) {
                this.organizerUsernames[organizerId] = response.data[0]?.username || response.data[0] || organizerId
              } else if (typeof response.data === 'object' && response.data.username) {
                this.organizerUsernames[organizerId] = response.data.username
              } else {
                this.organizerUsernames[organizerId] = response.data
              }
            }
          } catch (error) {
            console.error('Error fetching organizer username:', error)
            this.organizerUsernames[organizerId] = organizerId // Fallback to ID
          }
        }
      }
    },

    getOrganizerUsername(organizerId) {
      return this.organizerUsernames[organizerId] || organizerId
    },

    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    formatDuration(minutes) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      if (hours > 0) {
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
      }
      return `${mins}m`
    },

    statusClass(status) {
      return {
        'status-upcoming': status === 'upcoming',
        'status-cancelled': status === 'cancelled',
        'status-completed': status === 'completed'
      }
    },

    openReviewModal(event) {
      this.editingEvent = event
      this.reviewForm = {
        rating: event.review ? event.review.rating : 0,
        entry: event.review ? event.review.entry : ''
      }
      this.showReviewModal = true
    },

    closeReviewModal() {
      this.showReviewModal = false
      this.editingEvent = null
      this.reviewForm = {
        rating: 0,
        entry: ''
      }
    },

    async saveReview() {
      if (!this.editingEvent) return

      this.saving = true
      try {
        if (this.editingEvent.review) {
          // Update existing review
          await reviewingAPI.modifyReview(
            this.currentUser,
            this.editingEvent._id,
            this.reviewForm.rating,
            this.reviewForm.entry
          )
        } else {
          // Create new review
          await reviewingAPI.addReview(
            this.currentUser,
            this.editingEvent._id,
            this.reviewForm.rating,
            this.reviewForm.entry
          )
        }

        // Update local state
        this.editingEvent.review = {
          rating: this.reviewForm.rating,
          entry: this.reviewForm.entry
        }

        this.closeReviewModal()
      } catch (error) {
        console.error('Error saving review:', error)
        alert('Error saving review. Please try again.')
      } finally {
        this.saving = false
      }
    },

    async removeFromHistory(event) {
      if (confirm(`Did you not attend "${event.name}"? This will remove it from your event history.`)) {
        try {
          // Remove the user's interest in this event
          await interestAPI.removeItemInterest(this.currentUser, event._id)
          
          // Remove from local list
          this.pastEvents = this.pastEvents.filter(e => e._id !== event._id)
          
          alert('Event removed from your history.')
        } catch (error) {
          console.error('Error removing event from history:', error)
          alert('Error removing event from history. Please try again.')
        }
      }
    },

    async deleteReview(event) {
      if (!confirm(`Are you sure you want to delete your review for "${event.name}"? This action cannot be undone.`)) {
        return
      }

      this.deletingReview = event._id
      
      try {
        console.log('Deleting review for event:', event._id)
        await reviewingAPI.removeReview(this.currentUser, event._id)
        
        // Remove the review from the local event object
        const eventIndex = this.pastEvents.findIndex(e => e._id === event._id)
        if (eventIndex !== -1) {
          this.pastEvents[eventIndex].review = null
        }
        
        console.log('Review deleted successfully')
        alert('Review deleted successfully.')
      } catch (error) {
        console.error('Error deleting review:', error)
        alert('Failed to delete review. Please try again.')
      } finally {
        this.deletingReview = null
      }
    },

    // Status calculation methods (same as EventManagerPage)
    getEventStatus(event) {
      // If event is explicitly cancelled, show cancelled
      if (event.status === 'cancelled') {
        return 'cancelled'
      }
      
      const now = new Date()
      const eventStartTime = new Date(event.date)
      const eventEndTime = new Date(eventStartTime.getTime() + (event.duration || 60) * 60000)
      
      if (eventEndTime <= now) {
        return 'completed'
      } else if (eventStartTime <= now && now < eventEndTime) {
        return 'in-progress'
      } else {
        return 'upcoming'
      }
    },

    getStatusClass(event) {
      const status = this.getEventStatus(event)
      return {
        'status-upcoming': status === 'upcoming',
        'status-in-progress': status === 'in-progress',
        'status-completed': status === 'completed',
        'status-cancelled': status === 'cancelled'
      }
    }
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

.search-section {
  margin-bottom: 2rem;
  padding: 0 1rem;
}

.search-container {
  max-width: 600px;
  margin: 0 auto;
}

.search-input {
  width: 100%;
  padding: 1rem 1.5rem;
  font-size: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.search-input:focus {
  outline: none;
  border-color: #84a98c;
  box-shadow: 0 0 0 3px rgba(132, 169, 140, 0.1);
}

.search-results-info {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
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
  padding: 4rem 2rem;
}

.no-events-content {
  max-width: 400px;
  margin: 0 auto;
}

.no-events-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 1rem;
}

.no-events h3 {
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.no-events p {
  color: #6b7280;
  margin-bottom: 2rem;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 3rem; /* More spacing between cards */
}

.event-history-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.event-history-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.event-title-section {
  flex: 1;
}

.event-title {
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.event-date {
  color: #6b7280;
  font-size: 1rem;
  font-weight: 500;
}

.event-status {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status-upcoming {
  background-color: #e8f5e8;
  color: #2d5a2d;
}

.status-cancelled {
  background-color: #ffeaea;
  color: #8b0000;
}

.status-completed {
  background-color: #e8f4fd;
  color: #1e40af;
}

.status-in-progress {
  background-color: #fff3cd;
  color: #856404;
}

.event-details {
  margin-bottom: 2rem;
}

.event-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.9rem;
}

.icon {
  font-size: 1rem;
}

.event-description {
  color: #4b5563;
  line-height: 1.6;
  margin: 0;
}

.review-section {
  border-top: 1px solid #e5e7eb;
  padding-top: 1.5rem;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.review-header h4 {
  color: #2c3e50;
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.review-actions {
  display: flex;
  gap: 0.75rem;
}

.review-content {
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 1.5rem;
}

.review-rating {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.stars {
  display: flex;
  gap: 0.25rem;
}

.star {
  color: #d1d5db;
  font-size: 1.25rem;
}

.star.filled {
  color: #f59e0b;
}

.rating-value {
  color: #6b7280;
  font-size: 1rem;
  font-weight: 600;
}

.review-text {
  color: #4b5563;
  line-height: 1.6;
  margin: 0;
  font-style: italic;
}

.no-review {
  color: #9ca3af;
  font-style: italic;
  text-align: center;
  padding: 1rem;
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

.btn-primary {
  background: #84a98c;
  color: white;
}

.btn-primary:hover {
  background: #74a077;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-add-review {
  background: #6b7280;
  color: white;
}

.btn-add-review:hover {
  background: #4b5563;
}

.btn-edit-review {
  background: #9ca3af;
  color: white;
}

.btn-edit-review:hover {
  background: #6b7280;
}

.btn-remove-history {
  background: #9ca3af;
  color: white;
}

.btn-remove-history:hover {
  background: #6b7280;
}

.btn-delete-review {
  background: #9ca3af;
  color: white;
}

.btn-delete-review:hover:not(:disabled) {
  background: #6b7280;
}

.btn-delete-review:disabled {
  background: #d1d5db;
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
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
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

.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  resize: vertical;
  font-family: inherit;
}

.form-textarea:focus {
  outline: none;
  border-color: #42b883;
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
}

@media (max-width: 768px) {
  .page-header h2 {
    font-size: 1.5rem;
  }
  
  .event-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .event-info {
    grid-template-columns: 1fr;
  }
  
  .review-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
}
</style>
