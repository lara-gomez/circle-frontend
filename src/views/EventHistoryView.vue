<template>
  <div class="event-history-view">
    <!-- Navigation Header -->
    <nav class="nav-header">
      <div class="nav-brand">
        <h1>Circle</h1>
      </div>
      <div class="nav-menu">
        <button class="nav-item" @click="navigateToDiscovery">Discovery</button>
        <button class="nav-item active">Event History</button>
        <button class="nav-item" @click="navigateToProfile">Profile</button>
      </div>
      <div class="nav-user">
        <span class="user-greeting">Hello, {{ currentUsername }}!</span>
        <button class="btn-logout" @click="logout">Logout</button>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Page Header -->
      <section class="page-header">
        <h2>Your Event History</h2>
        <p>Review and manage your past event experiences.</p>
      </section>

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
          <button class="btn btn-primary" @click="navigateToDiscovery">
            Discover Events
          </button>
        </div>
      </div>

      <!-- Events List -->
      <div v-else class="events-list">
        <div 
          v-for="event in pastEvents" 
          :key="event._id" 
          class="event-history-card"
        >
          <div class="event-header">
            <div class="event-title-section">
              <h3 class="event-title">{{ event.name }}</h3>
              <div class="event-date">{{ formatDate(event.date) }}</div>
            </div>
            <div class="event-status" :class="statusClass(event.status)">
              {{ event.status }}
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
                <span>{{ event.organizer }}</span>
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
    </main>

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
  </div>
</template>

<script>
import { eventAPI, reviewingAPI } from '../api/services.js'

export default {
  name: 'EventHistoryView',
  data() {
    return {
      currentUser: 'user123', // This would come from authentication
      currentUsername: 'Demo User',
      pastEvents: [],
      loading: true,
      showReviewModal: false,
      editingEvent: null,
      saving: false,
      reviewForm: {
        rating: 0,
        entry: ''
      }
    }
  },
  async mounted() {
    await this.initializeUser()
    await this.loadPastEvents()
  },
  methods: {
    async initializeUser() {
      try {
        // In a real app, this would come from authentication state
        this.currentUser = 'user123'
        this.currentUsername = 'Demo User'
      } catch (error) {
        console.error('Error initializing user:', error)
      }
    },

    async loadPastEvents() {
      this.loading = true
      try {
        // Get user's reviews
        const reviewsResponse = await reviewingAPI.getReviewsByUser(this.currentUser)
        const reviews = reviewsResponse.data || []
        
        // Get event details for each reviewed event
        const eventsWithReviews = []
        for (const reviewData of reviews) {
          const review = reviewData.review
          try {
            const eventResponse = await eventAPI.getEventById(review.target)
            const event = eventResponse.data[0]
            if (event) {
              eventsWithReviews.push({
                ...event,
                review: review
              })
            }
          } catch (error) {
            console.error(`Error fetching event ${review.target}:`, error)
          }
        }
        
        // Sort by date (most recent first)
        this.pastEvents = eventsWithReviews.sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        )
        
        // If no events from API, use mock data
        if (this.pastEvents.length === 0) {
          this.pastEvents = this.getMockPastEvents()
        }
      } catch (error) {
        console.error('Error loading past events:', error)
        // Use mock data on error
        this.pastEvents = this.getMockPastEvents()
      } finally {
        this.loading = false
      }
    },

    getMockPastEvents() {
      return [
        {
          _id: 'event1',
          name: 'Vue.js Workshop',
          date: '2024-01-15T18:00:00Z',
          duration: 120,
          location: 'MIT Building 32',
          description: 'Learn Vue.js fundamentals with hands-on coding exercises. Perfect for beginners and intermediate developers.',
          organizer: 'Tech Club',
          status: 'completed',
          review: {
            rating: 8,
            entry: 'Great workshop! The instructor was very knowledgeable and the hands-on exercises were really helpful. I learned a lot about Vue.js components and state management.'
          }
        },
        {
          _id: 'event2',
          name: 'Coffee & Code',
          date: '2024-01-10T10:00:00Z',
          duration: 90,
          location: 'Stata Center',
          description: 'Casual coding session with coffee and pastries. Bring your laptop and work on personal projects.',
          organizer: 'Coding Community',
          status: 'completed',
          review: {
            rating: 7,
            entry: 'Nice atmosphere for getting work done. Good coffee too! Met some interesting people working on similar projects.'
          }
        },
        {
          _id: 'event3',
          name: 'AI & Machine Learning Meetup',
          date: '2024-01-05T19:00:00Z',
          duration: 150,
          location: 'MIT CSAIL',
          description: 'Discussion on latest AI trends and hands-on ML workshop. All skill levels welcome.',
          organizer: 'AI Society',
          status: 'completed',
          review: null
        }
      ]
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

    navigateToDiscovery() {
      this.$router.push('/discovery')
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
.event-history-view {
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

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h2 {
  color: #2c3e50;
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.page-header p {
  color: #6b7280;
  font-size: 1.125rem;
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
  gap: 2rem;
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
  background: #42b883;
  color: white;
}

.btn-primary:hover {
  background: #369870;
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
  background: #3b82f6;
  color: white;
}

.btn-add-review:hover {
  background: #2563eb;
}

.btn-edit-review {
  background: #f59e0b;
  color: white;
}

.btn-edit-review:hover {
  background: #d97706;
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
