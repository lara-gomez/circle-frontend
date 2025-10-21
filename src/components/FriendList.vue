<template>
  <div class="friend-list">
    <div class="friends-container">
      <div 
        v-for="friend in friends" 
        :key="friend.friend || friend" 
        class="friend-item"
        :title="getFriendName(friend.friend || friend)"
      >
        <div class="friend-avatar">
          {{ getInitials(friend.friend || friend) }}
        </div>
        <span class="friend-name">{{ getFriendName(friend.friend || friend) }}</span>
      </div>
      
      <div v-if="friends.length === 0" class="no-friends">
        No friends attending
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FriendList',
  props: {
    friends: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      friendNames: new Map()
    }
  },
  methods: {
    getInitials(friendId) {
      // Generate initials from friend ID or name
      const name = this.getFriendName(friendId)
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    },
    
    getFriendName(friendId) {
      // Check if we have a cached name
      if (this.friendNames.has(friendId)) {
        return this.friendNames.get(friendId)
      }
      
      // For demo purposes, generate a mock name
      // In a real app, you'd fetch this from the API
      const mockNames = [
        'Alex Johnson', 'Sarah Chen', 'Mike Rodriguez', 'Emma Wilson',
        'David Kim', 'Lisa Brown', 'Chris Taylor', 'Anna Davis',
        'James Miller', 'Maria Garcia', 'Tom Anderson', 'Kate White'
      ]
      
      // Use friendId to consistently generate the same name
      const index = friendId.length % mockNames.length
      const name = mockNames[index]
      this.friendNames.set(friendId, name)
      return name
    }
  }
}
</script>

<style scoped>
.friend-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.friends-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.friend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  background-color: #f3f4f6;
  border-radius: 20px;
  font-size: 0.75rem;
  color: #374151;
  max-width: 120px;
}

.friend-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #10b981;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.625rem;
  font-weight: 600;
  flex-shrink: 0;
}

.friend-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.no-friends {
  color: #9ca3af;
  font-style: italic;
  font-size: 0.875rem;
}

@media (max-width: 640px) {
  .friend-item {
    max-width: 100px;
    font-size: 0.7rem;
  }
  
  .friend-avatar {
    width: 20px;
    height: 20px;
    font-size: 0.5rem;
  }
}
</style>
