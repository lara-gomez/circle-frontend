<template>
  <div class="event-card">
    <div class="event-header">
      <h3 class="event-title">{{ event.name }}</h3>
      <div class="event-status" :class="statusClass">
        {{ event.status }}
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
          <span>{{ organizerUsername || event.organizer }}</span>
        </div>
      </div>
      
      <p class="event-description">{{ event.description }}</p>
    </div>
    
    <div class="event-actions">
      <div class="action-buttons">
        <button 
          @click="toggleInterest" 
          :class="['btn', 'btn-interest', { 'active': isInterested }]"
          :disabled="loading"
        >
          {{ isInterested ? '✓ Interested' : '+ Interested' }}
        </button>
        
      </div>
      
      <div class="friends-interested" v-if="friendsAttending.length > 0" 
           @mouseenter="showTooltip = true"
           @mouseleave="showTooltip = false">
        <div class="friends-info">
          <span class="friends-icon">👥</span>
          <span class="friends-count">{{ friendsAttending.length }} friend{{ friendsAttending.length !== 1 ? 's' : '' }} interested</span>
        </div>
        <!-- Custom tooltip -->
        <div v-if="showTooltip" class="custom-tooltip">
          {{ getFriendsTooltipText() }}
        </div>
        <div class="friends-avatars">
          <div 
            v-for="(friend, index) in friendsAttending.slice(0, 3)" 
            :key="friend.id || friend._id"
            class="friend-avatar"
            :title="friend.username"
          >
            <span class="avatar-text">{{ getFriendInitials(friend.username) }}</span>
          </div>
          <div 
            v-if="friendsAttending.length > 3" 
            class="more-friends"
            :title="`${friendsAttending.length - 3} more friends`"
          >
            +{{ friendsAttending.length - 3 }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import FriendList from './FriendList.vue'

export default {
  name: 'EventCard',
  components: {
    FriendList
  },
  props: {
    event: {
      type: Object,
      required: true
    },
    currentUser: {
      type: String,
      required: true
    },
    friendsAttending: {
      type: Array,
      default: () => []
    },
    isInterested: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      organizerUsername: null,
      showTooltip: false
    }
  },
  computed: {
    statusClass() {
      return {
        'status-upcoming': this.event.status === 'upcoming',
        'status-cancelled': this.event.status === 'cancelled',
        'status-completed': this.event.status === 'completed'
      }
    }
  },
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
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
    
    async toggleInterest() {
      if (this.loading) return
      
      this.loading = true
      const newInterestState = !this.isInterested
      
      // Emit the interest change to parent component
      this.$emit('interest-changed', this.event._id, newInterestState)
      
      this.loading = false
    },
    

    getFriendInitials(username) {
      if (!username || typeof username !== 'string') {
        console.log('Invalid username for initials:', username, typeof username)
        return '?'
      }
      // For usernames like "new_test", split by underscore and take first letter of each part
      const parts = username.split(/[_\s-]/) // Split by underscore, space, or hyphen
      return parts
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    },

    getFriendsTooltipText() {
      if (!this.friendsAttending || this.friendsAttending.length === 0) {
        return 'No friends interested'
      }
      
      const usernames = this.friendsAttending.map(friend => {
        return friend.username || friend.id || 'Unknown'
      })
      
      return `Friends interested: ${usernames.join(', ')}`
    },
    
    async fetchOrganizerUsername() {
      try {
        // Import the authAPI here to avoid circular dependencies
        const { authAPI } = await import('../api/services.js')
        const response = await authAPI.getUsername(this.event.organizer)
        
        // Handle different response formats
        if (response.data) {
          if (Array.isArray(response.data)) {
            // If response.data is an array, get the first element
            this.organizerUsername = response.data[0]?.username || response.data[0]
          } else if (typeof response.data === 'object' && response.data.username) {
            // If response.data is an object with username property
            this.organizerUsername = response.data.username
          } else {
            // If response.data is a string
            this.organizerUsername = response.data
          }
        }
      } catch (error) {
        console.error('Error fetching organizer username:', error)
        // Keep organizerUsername as null, will fallback to showing user ID
      }
    }
  },
  
  async mounted() {
    await this.fetchOrganizerUsername()
  },
  
}
</script>

<style scoped>
.event-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.event-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(132, 169, 140, 0.15);
  border-color: #84a98c;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.event-title {
  color: #2f3e46;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
}

.event-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status-upcoming {
  background-color: #e8f0ea;
  color: #52796f;
}

.status-cancelled {
  background-color: #fef2f2;
  color: #dc2626;
}

.status-completed {
  background-color: #e8f0ea;
  color: #2f3e46;
}

.event-details {
  margin-bottom: 1.5rem;
}

.event-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #52796f;
  font-size: 0.9rem;
}

.icon {
  font-size: 1rem;
}

.event-description {
  color: #354f52;
  line-height: 1.6;
  margin: 0;
}

.event-actions {
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-interest {
  background-color: #f8f9fa;
  color: #52796f;
  border: 1px solid #e5e7eb;
}

.btn-interest:hover:not(:disabled) {
  background-color: #e8f0ea;
  border-color: #84a98c;
}

.btn-interest.active {
  background-color: #84a98c;
  color: white;
  border-color: #84a98c;
}


.friends-interested {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  color: #52796f;
  font-size: 0.875rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  position: relative;
}

.friends-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.friends-icon {
  font-size: 1rem;
}

.friends-count {
  font-weight: 500;
  color: #2f3e46;
}

.friends-avatars {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.friend-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #84a98c, #74a077);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.friend-avatar .avatar-text {
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
}

.more-friends {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #52796f;
  font-size: 0.7rem;
  font-weight: 600;
  border: 2px solid white;
}

@media (max-width: 640px) {
  .event-info {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .btn {
    justify-content: center;
  }
}

.custom-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #2f3e46;
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  white-space: nowrap;
  z-index: 1000;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 0.5rem;
}

.custom-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: #2f3e46;
}
</style>
