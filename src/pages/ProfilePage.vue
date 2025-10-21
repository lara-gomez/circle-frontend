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
import { interestAPI, friendingAPI } from '../api/services.js'
import { useAuth } from '../composables/useAuth.js'

export default {
  name: 'ProfilePage',
  setup() {
    const { user } = useAuth()
    
    return {
      user
    }
  },
  data() {
    return {
      memberSince: 'January 2024',
      interests: ['Technology', 'Vue.js', 'Machine Learning', 'Coffee'],
      stats: {
        eventsAttended: 12,
        reviewsWritten: 8,
        friendsCount: 24,
        eventsCreated: 3
      },
      showInterestModal: false,
      newInterest: '',
      // Friends data
      acceptedFriends: [],
      pendingRequests: [],
      showAddFriendModal: false,
      newFriendUsername: '',
      friendRequestError: '',
      sendingFriendRequest: false,
      processingRequest: null
    }
  },
  computed: {
    currentUsername() {
      return this.user?.username || 'Demo User'
    },
    userInitials() {
      return this.currentUsername
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
    }
  },
  async mounted() {
    await this.loadFriendsData()
    await this.loadInterests()
  },
  methods: {
    // Interests methods
    async loadInterests() {
      try {
        const response = await interestAPI.getPersonalInterests(
          this.user?.id || this.user?._id || 'user123'
        )
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
        // Keep mock data on error
        this.interests = ['Technology', 'Vue.js', 'Machine Learning', 'Coffee']
      }
    },

    // Friends methods
    async loadFriendsData() {
      try {
        // Load accepted friends
        const friendsResponse = await friendingAPI.getFriends(this.user?.id || this.user?._id || 'user123')
        this.acceptedFriends = friendsResponse.data || []

        // Load pending requests
        const requestsResponse = await friendingAPI.getIncomingRequests(this.user?.id || this.user?._id || 'user123')
        this.pendingRequests = requestsResponse.data || []

        // Update friends count in stats
        this.stats.friendsCount = this.acceptedFriends.length
      } catch (error) {
        console.error('Error loading friends data:', error)
        // Use mock data on error
        this.acceptedFriends = this.getMockFriends()
        this.pendingRequests = this.getMockPendingRequests()
      }
    },

    async sendFriendRequest() {
      if (!this.newFriendUsername.trim()) return

      this.sendingFriendRequest = true
      this.friendRequestError = ''

      try {
        await friendingAPI.sendFriendRequest(
          this.user?.id || this.user?._id || 'user123',
          this.newFriendUsername.trim()
        )
        
        this.closeAddFriendModal()
        // Optionally show success message
      } catch (error) {
        console.error('Error sending friend request:', error)
        this.friendRequestError = error.response?.data?.error || 'Failed to send friend request'
      } finally {
        this.sendingFriendRequest = false
      }
    },

    async acceptFriendRequest(requestId) {
      this.processingRequest = requestId
      try {
        await friendingAPI.acceptFriendRequest(
          requestId,
          this.user?.id || this.user?._id || 'user123'
        )
        
        // Reload friends data
        await this.loadFriendsData()
      } catch (error) {
        console.error('Error accepting friend request:', error)
      } finally {
        this.processingRequest = null
      }
    },

    async rejectFriendRequest(requestId) {
      this.processingRequest = requestId
      try {
        await friendingAPI.removeFriendRequest(
          requestId,
          this.user?.id || this.user?._id || 'user123'
        )
        
        // Reload friends data
        await this.loadFriendsData()
      } catch (error) {
        console.error('Error rejecting friend request:', error)
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
        await friendingAPI.removeFriend(
          this.user?.id || this.user?._id || 'user123',
          friendId
        )
        
        // Reload friends data
        await this.loadFriendsData()
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

    // Mock data helpers
    getMockFriends() {
      return [
        { id: 'friend1', username: 'Alice Johnson' },
        { id: 'friend2', username: 'Bob Smith' },
        { id: 'friend3', username: 'Carol Davis' }
      ]
    },

    getMockPendingRequests() {
      return [
        { id: 'pending1', username: 'David Wilson' },
        { id: 'pending2', username: 'Eva Brown' }
      ]
    },
    async addInterest() {
      if (this.newInterest.trim() && !this.interests.includes(this.newInterest.trim())) {
        try {
          await interestAPI.addPersonalInterest(
            this.user?.id || this.user?._id || 'user123',
            this.newInterest.trim()
          )
          
          this.interests.push(this.newInterest.trim())
          this.newInterest = ''
          this.closeInterestModal()
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
          await interestAPI.removePersonalInterest(
            this.user?.id || this.user?._id || 'user123',
            interest
          )
          
          this.interests.splice(index, 1)
        } catch (error) {
          console.error('Error removing interest:', error)
          alert('Failed to remove interest. Please try again.')
        }
      }
    },
    
    closeInterestModal() {
      this.showInterestModal = false
      this.newInterest = ''
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
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

.profile-content {
  max-width: none;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
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
  background: #e0f2fe;
  color: #0369a1;
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
  color: #0369a1;
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
  background: rgba(3, 105, 161, 0.1);
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
  color: #42b883;
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
