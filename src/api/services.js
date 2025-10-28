import api from './axios.js'

// User Authentication API
export const authAPI = {
  register: (username, password) => 
    api.post('/UserAuthentication/register', { username, password }),
  
  authenticate: (username, password) => 
    api.post('/UserAuthentication/authenticate', { username, password }),
  
  getUsername: (user) => 
    api.post('/UserAuthentication/_getUsername', { user }),
  
  getUserByUsername: (username) => 
    api.post('/UserAuthentication/_getUserByUsername', { username })
}

// Event API
export const eventAPI = {
  createEvent: (eventData) => 
    api.post('/Event/createEvent', eventData),
  
  modifyEvent: (eventData) => 
    api.post('/Event/modifyEvent', eventData),
  
  cancelEvent: (organizer, event) => 
    api.post('/Event/cancelEvent', { organizer, event }),
  
  unCancelEvent: (organizer, event) => 
    api.post('/Event/unCancelEvent', { organizer, event }),
  
  deleteEvent: (organizer, event) => 
    api.post('/Event/deleteEvent', { organizer, event }),
  
  completeEvent: (event) => 
    api.post('/Event/completeEvent', { event }),
  
  getEventById: (event) => 
    api.post('/Event/_getEventById', { event }),
  
  getEventsByOrganizer: (organizer) => 
    api.post('/Event/_getEventsByOrganizer', { organizer }),
  
  getEventsByStatus: (status) => 
    api.post('/Event/_getEventsByStatus', { status }),
  
  getAllEvents: () => 
    api.post('/Event/_getAllEvents', {}),

  getEventsByRecommendationContext: (user, filters, priorities) =>
    api.post('/Event/_getEventsByRecommendationContext', { user, filters, priorities }),
}

// User Interest API
export const interestAPI = {
  addPersonalInterest: (user, tag) => 
    api.post('/UserInterest/addPersonalInterest', { user, tag }),
  
  removePersonalInterest: (user, tag) => 
    api.post('/UserInterest/removePersonalInterest', { user, tag }),
  
  addItemInterest: (user, item) => 
    api.post('/UserInterest/addItemInterest', { user, item }),
  
  removeItemInterest: (user, item) => 
    api.post('/UserInterest/removeItemInterest', { user, item }),
  
  getPersonalInterests: (user) => 
    api.post('/UserInterest/_getPersonalInterests', { user }),
  
  getItemInterests: (user) => 
    api.post('/UserInterest/_getItemInterests', { user })
}

// Friending API
export const friendingAPI = {
  sendFriendRequest: (user, target) => 
    api.post('/Friending/sendFriendRequest', { user, target }),
  
  acceptFriendRequest: (requester, target) => 
    api.post('/Friending/acceptFriendRequest', { requester, target }),
  
  removeFriendRequest: (requester, target) => 
    api.post('/Friending/removeFriendRequest', { requester, target }),
  
  removeFriend: (user, friend) => 
    api.post('/Friending/removeFriend', { user, friend }),
  
  getFriends: (user) => 
    api.post('/Friending/_getFriends', { user }),
  
  getIncomingRequests: (user) => 
    api.post('/Friending/_getIncomingRequests', { user }),
  
  getOutgoingRequests: (user) => 
    api.post('/Friending/_getOutgoingRequests', { user })
}

// Reviewing API
export const reviewingAPI = {
  addReview: (user, item, rating, entry) => 
    api.post('/Reviewing/addReview', { user, item, rating, entry }),
  
  removeReview: (user, item) => 
    api.post('/Reviewing/removeReview', { user, item }),
  
  modifyReview: (user, item, rating, entry) => 
    api.post('/Reviewing/modifyReview', { user, item, rating, entry }),
  
  getReview: (user, item) => 
    api.post('/Reviewing/_getReview', { user, item }),
  
  getReviewsByItem: (item) => 
    api.post('/Reviewing/_getReviewsByItem', { item }),
  
  getReviewsByUser: (user) => 
    api.post('/Reviewing/_getReviewsByUser', { user })
}
