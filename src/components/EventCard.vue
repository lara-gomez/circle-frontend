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
      
      <div class="friends-attending" v-if="friendsAttending.length > 0">
        <div class="friends-info">
          <span class="friends-icon">👥</span>
          <span class="friends-count">{{ friendsAttending.length }} friend{{ friendsAttending.length !== 1 ? 's' : '' }} attending</span>
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
      organizerUsername: null
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
      if (!username) return '?'
      return username
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    },
    
    async fetchOrganizerUsername() {
      try {
        // Import the authAPI here to avoid circular dependencies
        const { authAPI } = await import('../api/services.js')
        const response = await authAPI.getUsername(this.event.organizer)
        // Extract username from the response object
        this.organizerUsername = response.data?.username || response.data
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.event-title {
  color: #2c3e50;
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
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-interest:hover:not(:disabled) {
  background-color: #e5e7eb;
}

.btn-interest.active {
  background-color: #10b981;
  color: white;
  border-color: #10b981;
}


.friends-attending {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  color: #6b7280;
  font-size: 0.875rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
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
  color: #374151;
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
  background: linear-gradient(135deg, #42b883, #369870);
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
  color: #6b7280;
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
</style>
