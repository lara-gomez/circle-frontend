<template>
  <!-- Page Header -->
  <section class="page-header">
    <h2>Manage Events</h2>
    <p>Create, modify, and manage your events.</p>
    <button class="btn btn-primary btn-large" @click="openEventModal()">
      Create New Event
    </button>
  </section>

  <!-- Loading State -->
  <div v-if="loading" class="loading">
    <div class="loading-spinner"></div>
    <p>Loading your events...</p>
  </div>

  <!-- No Events State -->
  <div v-else-if="userEvents.length === 0" class="no-events">
    <div class="no-events-content">
      <span class="no-events-icon">📅</span>
      <h3>No Events Created</h3>
      <p>You haven't created any events yet.</p>
      <button class="btn btn-primary" @click="openEventModal()">
        Create Your First Event
      </button>
    </div>
  </div>

  <!-- Events List -->
  <div v-else class="events-list">
    <div class="section-header">
      <h3>Your Events</h3>
      <div class="section-actions">
        <button 
          @click="loadEvents" 
          class="btn btn-refresh"
          :disabled="loading"
        >
          {{ loading ? 'Loading...' : 'Refresh' }}
        </button>
      </div>
    </div>
      
      <div class="events-grid">
        <div 
          v-for="event in sortedUserEvents" 
          :key="event._id" 
          class="event-manager-card"
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
                <span class="icon">⏰</span>
                <span>{{ formatDuration(event.duration) }}</span>
              </div>
              <div class="info-item">
                <span class="icon">👥</span>
                <span>{{ event.attendees || 0 }} attendees</span>
              </div>
            </div>
            <p class="event-description">{{ event.description }}</p>
          </div>

          <div class="event-actions">
            <button 
              @click="openEventModal(event)" 
              class="btn btn-edit"
            >
              Edit
            </button>
            <button 
              @click="cancelEvent(event)" 
              class="btn btn-cancel"
              v-if="getEventStatus(event) === 'upcoming' && event.status !== 'cancelled'"
            >
              Cancel
            </button>
            <button 
              @click="uncancelEvent(event)" 
              class="btn btn-uncancel"
              v-if="event.status === 'cancelled'"
            >
              Uncancel
            </button>
            <button 
              @click="deleteEvent(event)" 
              class="btn btn-delete"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Interested Events Section -->
    <div class="events-section">
      <div class="section-header">
        <h3>Events You're Interested In</h3>
        <div class="section-actions">
          <button 
            @click="refreshInterestedEvents" 
            class="btn btn-refresh"
            :disabled="loadingInterested"
          >
            {{ loadingInterested ? 'Loading...' : 'Refresh' }}
          </button>
        </div>
      </div>
      
      <div v-if="loadingInterested" class="loading">
        <div class="loading-spinner"></div>
        <p>Loading interested events...</p>
      </div>
      
      <div v-else-if="interestedEvents.length === 0" class="no-events">
        <div class="no-events-content">
          <span class="no-events-icon">❤️</span>
          <h3>No Interested Events</h3>
          <p>You haven't marked any events as interested yet.</p>
          <div class="action-buttons">
            <router-link to="/discovery" class="btn btn-primary">
              Discover Events
            </router-link>
            <button 
              @click="refreshInterestedEvents" 
              class="btn btn-secondary"
              :disabled="loadingInterested"
            >
              {{ loadingInterested ? 'Loading...' : 'Retry Loading' }}
            </button>
          </div>
        </div>
      </div>
      
      <div v-else class="events-list">
        <div 
          v-for="event in interestedEvents.filter(e => e && e._id)" 
          :key="event._id" 
          class="event-manager-card interested-event"
        >
          <div class="event-header">
            <div class="event-title-section">
              <h3 class="event-title">{{ event.name }}</h3>
              <div class="event-status" :class="getStatusClass(event)">
                {{ getEventStatus(event) }}
              </div>
            </div>
          </div>
          
          <div class="event-details">
            <div class="event-info">
              <div class="info-item">
                <span class="icon">📅</span>
                <span>{{ formatDate(event.date) }}</span>
              </div>
              <div class="info-item">
                <span class="icon">⏰</span>
                <span>{{ formatDuration(event.duration) }}</span>
              </div>
              <div class="info-item">
                <span class="icon">📍</span>
                <span>{{ event.location }}</span>
              </div>
              <div class="info-item">
                <span class="icon">👤</span>
                <span>{{ getOrganizerUsername(event.organizer) }}</span>
              </div>
            </div>
            
            <p class="event-description">{{ event.description }}</p>
          </div>
          
          <div class="event-actions">
            <div class="action-buttons">
              <button 
                class="btn btn-secondary"
                @click="removeInterest(event._id)"
                :disabled="processingInterest === event._id"
              >
                {{ processingInterest === event._id ? 'Removing...' : 'Remove Interest' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Event Modal -->
    <div v-if="showEventModal" class="modal-overlay" @click="closeEventModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingEvent ? 'Edit Event' : 'Create New Event' }}</h3>
          <button class="modal-close" @click="closeEventModal">×</button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="saveEvent">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Event Name *</label>
                <input 
                  v-model="eventForm.name" 
                  type="text" 
                  class="form-input"
                  placeholder="Enter event name"
                  required
                />
              </div>
              
              <div class="form-group">
                <label class="form-label">Location *</label>
                <input 
                  v-model="eventForm.location" 
                  type="text" 
                  class="form-input"
                  placeholder="Enter event location"
                  required
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Date & Time *</label>
                <input 
                  v-model="eventForm.date" 
                  type="datetime-local" 
                  class="form-input"
                  required
                />
              </div>
              
              <div class="form-group">
                <label class="form-label">Duration (minutes) *</label>
                <input 
                  v-model="eventForm.duration" 
                  type="number" 
                  min="1"
                  class="form-input"
                  placeholder="e.g., 120"
                  required
                />
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">Description *</label>
              <textarea 
                v-model="eventForm.description" 
                class="form-textarea"
                placeholder="Describe your event..."
                rows="4"
                required
              ></textarea>
            </div>
          </form>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeEventModal">
            Cancel
          </button>
          <button 
            class="btn btn-primary" 
            @click="saveEvent"
            :disabled="saving || !isFormValid"
          >
            {{ saving ? 'Saving...' : (editingEvent ? 'Update Event' : 'Create Event') }}
          </button>
        </div>
      </div>
    </div>
</template>

<script>
import { eventAPI, interestAPI } from '../api/services.js'
import { useAuth } from '../composables/useAuth.js'

export default {
  name: 'EventManagerPage',
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
      userEvents: [],
      interestedEvents: [],
      loading: true,
      loadingInterested: true,
      showEventModal: false,
      editingEvent: null,
      saving: false,
      processingInterest: null,
      organizerUsernames: {}, // Cache for organizer usernames
      eventForm: {
        name: '',
        date: '',
        duration: 60,
        location: '',
        description: ''
      }
    }
  },
  computed: {
    currentUser() {
      return this.user?.id || this.user?._id || this.user || 'user123'
    },
    isFormValid() {
      return this.eventForm.name.trim() && 
             this.eventForm.date && 
             this.eventForm.duration > 0 && 
             this.eventForm.location.trim() && 
             this.eventForm.description.trim()
    },
    sortedUserEvents() {
      // Create a copy of the array to sort
      const events = [...this.userEvents].filter(e => e && e._id)
      
      // Sort by status: upcoming (by earliest date), then cancelled, then completed
      events.sort((a, b) => {
        const statusA = this.getEventStatus(a)
        const statusB = this.getEventStatus(b)
        
        // Define status priority order
        const statusOrder = { 'upcoming': 0, 'cancelled': 1, 'completed': 2 }
        const priorityA = statusOrder[statusA] !== undefined ? statusOrder[statusA] : 99
        const priorityB = statusOrder[statusB] !== undefined ? statusOrder[statusB] : 99
        
        // If different status priorities, sort by priority
        if (priorityA !== priorityB) {
          return priorityA - priorityB
        }
        
        // If same status, sort by date (earliest first for upcoming, latest first for others)
        const dateA = new Date(a.date || 0)
        const dateB = new Date(b.date || 0)
        
        if (statusA === 'upcoming') {
          return dateA - dateB // Earliest first
        } else {
          return dateB - dateA // Latest first
        }
      })
      
      return events
    }
  },
  async mounted() {
    await this.initializeUser()
    await this.loadEvents()
    await this.loadInterestedEvents()
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

    async loadEvents() {
      this.loading = true
      try {
        console.log('EventManagerPage - Loading events for user:', this.currentUser)
        console.log('EventManagerPage - User object:', this.user)
        const response = await eventAPI.getEventsByOrganizer(this.currentUser)
        console.log('EventManagerPage - Events response:', response)
        this.userEvents = response.data || []
        
        // Load organizer usernames for user events
        await this.loadOrganizerUsernames(this.userEvents)
        
        // No mock data fallback - only show real events
      } catch (error) {
        console.error('Error loading events:', error)
        // Keep empty array on error
        this.userEvents = []
      } finally {
        this.loading = false
      }
    },

    async loadInterestedEvents() {
      console.log('🔄 loadInterestedEvents called, current state:', {
        loadingInterested: this.loadingInterested,
        interestedEventsLength: this.interestedEvents.length
      })
      
      this.loadingInterested = true
      
      try {
        // Get user's item interests (event IDs)
        console.log('EventManagerPage - Getting interests for user:', this.currentUser)
        const interestsResponse = await interestAPI.getItemInterests(this.currentUser)
        console.log('EventManagerPage - Interests response:', interestsResponse)
        
        const interestedItems = interestsResponse.data || []
        
        if (interestedItems.length === 0) {
          console.log('✅ No interested items found, setting empty array and stopping loading')
          this.interestedEvents = []
          this.loadingInterested = false
          console.log('✅ Early return - loadingInterested set to false')
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
          .filter(event => event && event._id) // Ensure each event has an _id

        // Filter out completed events - only show upcoming/in-progress events
        const now = new Date()
        this.interestedEvents = allInterestedEvents.filter(event => {
          if (!event.date || !event.duration) return true // Keep events with missing data
          
          const eventStartTime = new Date(event.date)
          const eventEndTime = new Date(eventStartTime.getTime() + (event.duration * 60 * 1000))
          
          // Only show events that haven't ended yet
          return eventEndTime > now
        })

        console.log('📡 All interested events:', allInterestedEvents.length)
        console.log('📡 Upcoming/interested events (filtered):', this.interestedEvents.length)

        // Load organizer usernames for interested events
        await this.loadOrganizerUsernames(this.interestedEvents)

        // No mock data fallback - only show real events
      } catch (error) {
        console.error('Error loading interested events:', error)
        // Keep empty array on error
        this.interestedEvents = []
      } finally {
        this.loadingInterested = false
        console.log('✅ Finally block - loadingInterested set to false, interestedEvents length:', this.interestedEvents.length)
      }
    },

    async removeInterest(eventId) {
      this.processingInterest = eventId
      try {
        await interestAPI.removeItemInterest(this.currentUser, eventId)
        
        // Remove from local list
        this.interestedEvents = this.interestedEvents.filter(event => event._id !== eventId)
      } catch (error) {
        console.error('Error removing interest:', error)
        alert('Failed to remove interest. Please try again.')
      } finally {
        this.processingInterest = null
      }
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

    getEventStatus(event) {
      // If event is cancelled, always show cancelled status
      if (event.status === 'cancelled') {
        return 'cancelled'
      }
      
      // Otherwise, calculate status based on time
      if (!event.date || !event.duration) return 'upcoming'
      
      const now = new Date()
      const eventStartTime = new Date(event.date)
      const eventEndTime = new Date(eventStartTime.getTime() + (event.duration * 60 * 1000))
      
      if (eventEndTime <= now) {
        return 'completed'
      } else if (eventStartTime <= now) {
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
        'status-cancelled': status === 'cancelled',
        'status-completed': status === 'completed'
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

    openEventModal(event = null) {
      this.editingEvent = event
      if (event) {
        // Edit existing event
        this.eventForm = {
          name: event.name,
          date: new Date(event.date).toISOString().slice(0, 16),
          duration: event.duration,
          location: event.location,
          description: event.description
        }
      } else {
        // Create new event
        this.eventForm = {
          name: '',
          date: '',
          duration: 60,
          location: '',
          description: ''
        }
      }
      this.showEventModal = true
    },

    closeEventModal() {
      this.showEventModal = false
      this.editingEvent = null
      this.eventForm = {
        name: '',
        date: '',
        duration: 60,
        location: '',
        description: ''
      }
    },

    async saveEvent() {
      if (!this.isFormValid) return

      this.saving = true
      try {
        console.log('EventManagerPage - Creating event with organizer:', this.currentUser)
        console.log('EventManagerPage - User object during creation:', this.user)
        const eventData = {
          organizer: this.currentUser,
          name: this.eventForm.name,
          date: new Date(this.eventForm.date).toISOString(),
          duration: parseInt(this.eventForm.duration),
          location: this.eventForm.location,
          description: this.eventForm.description
        }
        console.log('EventManagerPage - Event data:', eventData)

        console.log("Sending event data to API:", eventData);

        let result;

        if (this.editingEvent) {
          // Update existing event
          result = await eventAPI.modifyEvent({
            organizer: this.currentUser,
            event: this.editingEvent._id,
            newName: eventData.name,
            newDate: eventData.date,
            newDuration: eventData.duration,
            newLocation: eventData.location,
            newDescription: eventData.description
          });
        } else {
          // Create new event
          result = await eventAPI.createEvent(eventData);
        }

        console.log("API response:", result);

        if ('error' in result) {
          // Show backend validation errors
          alert(`Error saving event: ${result.error}`);
        } else {
          this.closeEventModal();
          await this.loadEvents();
        }
      } catch (error) {
        console.error('Error saving event:', error)
        alert('Error saving event. Please try again.')
      } finally {
        this.saving = false
      }
    },

    async cancelEvent(event) {
      if (confirm(`Are you sure you want to cancel "${event.name}"?`)) {
        try {
          await eventAPI.cancelEvent(this.currentUser, event._id)
          await this.loadEvents()
          // Also reload interested events to update status in interested list
          await this.loadInterestedEvents()
        } catch (error) {
          console.error('Error cancelling event:', error)
          alert('Error cancelling event. Please try again.')
        }
      }
    },

    async uncancelEvent(event) {
      if (confirm(`Are you sure you want to restore "${event.name}" to upcoming?`)) {
        try {
          await eventAPI.unCancelEvent(this.currentUser, event._id)
          await this.loadEvents()
          // Also reload interested events to update status in interested list
          await this.loadInterestedEvents()
        } catch (error) {
          console.error('Error uncancelling event:', error)
          alert(error.response?.data?.error || 'Error uncancelling event. Please try again.')
        }
      }
    },

    async deleteEvent(event) {
      if (confirm(`Are you sure you want to delete "${event.name}"? This action cannot be undone.`)) {
        try {
          await eventAPI.deleteEvent(this.currentUser, event._id)
          await this.loadEvents()
          // Also reload interested events in case the deleted event was in the interested list
          await this.loadInterestedEvents()
        } catch (error) {
          console.error('Error deleting event:', error)
          alert('Error deleting event. Please try again.')
        }
      }
    },


    getMockInterestedEvents() {
      return [
        {
          _id: 'interested1',
          name: 'Vue.js Workshop',
          date: '2024-02-15T18:00:00Z',
          duration: 120,
          location: 'MIT Building 32',
          description: 'Learn Vue.js fundamentals and best practices',
          organizer: 'Tech Club',
          status: 'upcoming'
        },
        {
          _id: 'interested2',
          name: 'Machine Learning Meetup',
          date: '2024-02-20T19:00:00Z',
          duration: 90,
          location: 'MIT Building 34',
          description: 'Discuss latest ML trends and techniques',
          organizer: 'AI Society',
          status: 'upcoming'
        }
      ]
    },

    // Method to manually refresh interested events
    async refreshInterestedEvents() {
      console.log('Manually refreshing interested events...')
      await this.loadInterestedEvents()
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
  margin-bottom: 2.5rem; /* More spacing */
  max-width: 700px; /* Wider max-width */
  margin-left: auto;
  margin-right: auto;
  line-height: 1.7; /* Better line height */
}

.btn-large {
  padding: 1rem 2.5rem; /* Larger padding for desktop */
  font-size: 1.125rem; /* Larger font */
  font-weight: 600; /* Bolder */
  border-radius: 12px; /* More rounded */
}

.events-section {
  margin-top: 6rem; /* More generous spacing */
  margin-bottom: 5rem; /* More spacing */
}

.section-header {
  margin-bottom: 3rem; /* More spacing */
}

.section-header h3 {
  color: #2f3e46; /* Updated color */
  font-size: 2rem; /* Larger for desktop */
  font-weight: 600; /* Bolder */
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

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
}

.btn-secondary {
  background: #6b7280;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-secondary:hover:not(:disabled) {
  background: #4b5563;
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

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr)); /* Larger cards for desktop */
  gap: 3rem; /* More spacing between cards */
  max-width: none;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.event-manager-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.event-manager-card:hover {
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
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
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

.event-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
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

.btn-primary:hover:not(:disabled) {
  background: #369870;
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

.btn-edit {
  background: #3b82f6;
  color: white;
}

.btn-edit:hover {
  background: #2563eb;
}

.btn-cancel {
  background: #f59e0b;
  color: white;
}

.btn-cancel:hover {
  background: #d97706;
}

.btn-uncancel {
  background: #10b981;
  color: white;
}

.btn-uncancel:hover {
  background: #059669;
}

.btn-delete {
  background: #ef4444;
  color: white;
}

.btn-delete:hover {
  background: #dc2626;
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
  max-width: 600px;
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
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

/* Interested Events Styles */
.interested-event {
  border-left: 4px solid #42b883;
}

.interested-event .event-title {
  color: #42b883;
}

@media (max-width: 768px) {
  .page-header h2 {
    font-size: 1.5rem;
  }
  
  .events-grid {
    grid-template-columns: 1fr;
  }
  
  .event-actions {
    flex-direction: column;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
}
</style>
