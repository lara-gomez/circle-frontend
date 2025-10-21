<template>
  <!-- Page Header -->
  <section class="page-header">
    <h2>Manage Events</h2>
    <p>Create, modify, and manage your events.</p>
    <button class="btn btn-primary btn-large" @click="openEventModal()">
      Create New Event
    </button>
  </section>

    <!-- Events List -->
    <div class="events-section">
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
      
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <p>Loading your events...</p>
      </div>
      
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
      
      <div v-else class="events-grid">
        <div 
          v-for="event in userEvents" 
          :key="event._id" 
          class="event-manager-card"
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
              v-if="event.status === 'upcoming'"
            >
              Cancel
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
            @click="loadInterestedEvents" 
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
          <router-link to="/discovery" class="btn btn-primary">
            Discover Events
          </router-link>
        </div>
      </div>
      
      <div v-else class="events-grid">
        <div 
          v-for="event in interestedEvents" 
          :key="event._id" 
          class="event-manager-card interested-event"
        >
          <div class="event-header">
            <div class="event-title-section">
              <h3 class="event-title">{{ event.name }}</h3>
              <div class="event-status" :class="getStatusClass(event.status)">
                {{ event.status }}
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
                <span>{{ event.organizer }}</span>
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
      return this.user?.id || this.user?._id || 'user123'
    },
    isFormValid() {
      return this.eventForm.name.trim() && 
             this.eventForm.date && 
             this.eventForm.duration > 0 && 
             this.eventForm.location.trim() && 
             this.eventForm.description.trim()
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
        const response = await eventAPI.getEventsByOrganizer(this.currentUser)
        this.userEvents = response.data || []
        
        // If no events from API, use mock data
        if (this.userEvents.length === 0) {
          this.userEvents = this.getMockEvents()
        }
      } catch (error) {
        console.error('Error loading events:', error)
        // Use mock data on error
        this.userEvents = this.getMockEvents()
      } finally {
        this.loading = false
      }
    },

    async loadInterestedEvents() {
      this.loadingInterested = true
      try {
        const response = await interestAPI.getItemInterests(this.currentUser)
        const interestedItems = response.data || []
        
        // Get event details for each interested item
        const eventPromises = interestedItems.map(item => 
          eventAPI.getEventById(item.item)
        )
        const eventResponses = await Promise.all(eventPromises)
        
        this.interestedEvents = eventResponses
          .map(response => response.data[0])
          .filter(event => event) // Filter out any null/undefined events
        
        if (this.interestedEvents.length === 0) {
          this.interestedEvents = this.getMockInterestedEvents()
        }
      } catch (error) {
        console.error('Error loading interested events:', error)
        this.interestedEvents = this.getMockInterestedEvents()
      } finally {
        this.loadingInterested = false
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

    getMockEvents() {
      return [
        {
          _id: 'event1',
          name: 'Vue.js Workshop',
          date: '2024-02-15T18:00:00Z',
          duration: 120,
          location: 'MIT Building 32',
          description: 'Learn Vue.js fundamentals with hands-on coding exercises.',
          organizer: 'user123',
          status: 'upcoming',
          attendees: 15
        },
        {
          _id: 'event2',
          name: 'Coffee & Code',
          date: '2024-02-20T10:00:00Z',
          duration: 90,
          location: 'Stata Center',
          description: 'Casual coding session with coffee and pastries.',
          organizer: 'user123',
          status: 'upcoming',
          attendees: 8
        },
        {
          _id: 'event3',
          name: 'AI Meetup',
          date: '2024-01-25T19:00:00Z',
          duration: 150,
          location: 'MIT CSAIL',
          description: 'Discussion on latest AI trends and hands-on ML workshop.',
          organizer: 'user123',
          status: 'completed',
          attendees: 25
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
        const eventData = {
          organizer: this.currentUser,
          name: this.eventForm.name,
          date: new Date(this.eventForm.date).toISOString(),
          duration: parseInt(this.eventForm.duration),
          location: this.eventForm.location,
          description: this.eventForm.description
        }

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
        } catch (error) {
          console.error('Error cancelling event:', error)
          alert('Error cancelling event. Please try again.')
        }
      }
    },

    async deleteEvent(event) {
      if (confirm(`Are you sure you want to delete "${event.name}"? This action cannot be undone.`)) {
        try {
          await eventAPI.deleteEvent(this.currentUser, event._id)
          await this.loadEvents()
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
    }
  }
}
</script>

<style scoped>
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
  margin-bottom: 2rem;
}

.btn-large {
  padding: 0.75rem 2rem;
  font-size: 1rem;
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
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
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
