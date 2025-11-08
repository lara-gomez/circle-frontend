<template>
  <div class="past-events">
    <h3 class="section-title">Past Events You've Reviewed</h3>
    
    <div v-if="loading" class="loading">
      Loading past events...
    </div>
    
    <div v-else-if="pastEvents.length === 0" class="no-events">
      <p>No past events to display.</p>
      <p class="subtitle">Events you've reviewed will appear here.</p>
    </div>
    
    <div v-else class="events-grid">
      <div 
        v-for="event in pastEvents" 
        :key="event._id" 
        class="past-event-card"
      >
        <div class="event-header">
          <h4 class="event-title">{{ event.name }}</h4>
          <div class="event-date">
            {{ formatDate(event.date) }}
          </div>
        </div>
        
        <div class="event-details">
          <p class="event-description">{{ event.description }}</p>
          <div class="event-location">
            <span class="icon">📍</span>
            {{ event.location }}
          </div>
        </div>
        
        <div class="review-section" v-if="event.review">
          <div class="review-rating">
            <span class="rating-label">Your Rating:</span>
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
        
        <div class="event-actions">
          <button 
            @click="viewEvent(event._id)" 
            class="btn btn-view"
          >
            View Details
          </button>
          <button 
            @click="editReview(event)" 
            class="btn btn-edit"
            v-if="event.review"
          >
            Edit Review
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reviewingAPI, eventAPI } from '../api/services.js'

export default {
  name: 'PastEventList',
  props: {
    currentUser: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      pastEvents: [],
      loading: true
    }
  },
  async mounted() {
    await this.loadPastEvents()
  },
  methods: {
    async loadPastEvents() {
      this.loading = true
      try {
        // Get user's reviews
        const reviewsResponse = await reviewingAPI.getReviewsByUser(this.currentUser)
        const reviews = reviewsResponse.data || []
        
        // Get event details for each reviewed event
        const eventsWithReviews = []
        for (const reviewData of reviews) {
          const review = reviewData.review || reviewData
          if (!review || !review.target) {
            continue
          }
          try {
            const eventResponse = await eventAPI.getEventById(review.target)
            const event = eventResponse.data?.event
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
      } catch (error) {
        console.error('Error loading past events:', error)
        // For demo purposes, show mock data
        this.pastEvents = this.getMockPastEvents()
      } finally {
        this.loading = false
      }
    },
    
    getMockPastEvents() {
      return [
        {
          _id: 'event1',
          name: 'Tech Meetup: Vue.js Workshop',
          date: '2024-01-15T18:00:00Z',
          location: 'MIT Building 32',
          description: 'Learn Vue.js fundamentals with hands-on coding exercises.',
          review: {
            rating: 8,
            entry: 'Great workshop! The instructor was very knowledgeable and the hands-on exercises were really helpful.'
          }
        },
        {
          _id: 'event2',
          name: 'Coffee & Code',
          date: '2024-01-10T10:00:00Z',
          location: 'Stata Center',
          description: 'Casual coding session with coffee and pastries.',
          review: {
            rating: 7,
            entry: 'Nice atmosphere for getting work done. Good coffee too!'
          }
        }
      ]
    },
    
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },
    
    viewEvent(eventId) {
      this.$emit('view-event', eventId)
    },
    
    editReview(event) {
      this.$emit('edit-review', event)
    }
  }
}
</script>

<style scoped>
.past-events {
  margin-top: 2rem;
}

.section-title {
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e5e7eb;
}

.loading {
  text-align: center;
  color: #6b7280;
  font-style: italic;
  padding: 2rem;
}

.no-events {
  text-align: center;
  color: #6b7280;
  padding: 2rem;
}

.subtitle {
  font-size: 0.875rem;
  margin-top: 0.5rem;
  color: #9ca3af;
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.past-event-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.past-event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.event-title {
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
}

.event-date {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
}

.event-details {
  margin-bottom: 1rem;
}

.event-description {
  color: #4b5563;
  line-height: 1.5;
  margin-bottom: 0.75rem;
}

.event-location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.icon {
  font-size: 1rem;
}

.review-section {
  background-color: #f9fafb;
  border-radius: 6px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.review-rating {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.rating-label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.stars {
  display: flex;
  gap: 0.125rem;
}

.star {
  color: #d1d5db;
  font-size: 1.125rem;
}

.star.filled {
  color: #f59e0b;
}

.rating-value {
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
}

.review-text {
  color: #4b5563;
  font-style: italic;
  line-height: 1.5;
  margin: 0;
  font-size: 0.875rem;
}

.event-actions {
  display: flex;
  gap: 0.75rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-view {
  background-color: #3b82f6;
  color: white;
}

.btn-view:hover {
  background-color: #2563eb;
}

.btn-edit {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-edit:hover {
  background-color: #e5e7eb;
}

@media (max-width: 640px) {
  .events-grid {
    grid-template-columns: 1fr;
  }
  
  .event-actions {
    flex-direction: column;
  }
  
  .btn {
    justify-content: center;
  }
}
</style>
