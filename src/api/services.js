import api from './axios.js'

const getSessionOrThrow = () => {
  const session = localStorage.getItem('session')
  if (!session) {
    throw new Error('No active session found. Please sign in again.')
  }
  return session
}

// User Authentication API
export const authAPI = {
  register: (username, password) =>
    api.post('/UserAuthentication/register', { username, password }),

  login: (username, password) =>
    api.post('/login', { username, password }),

  logout: (session) =>
    api.post('/logout', { session }),

  getSessionUser: (session) =>
    api.post('/Session/_getUser', { session }),

  getUsername: (user) =>
    api.post('/UserAuthentication/_getUsername', { user }),

  getUserByUsername: (username) =>
    api.post('/UserAuthentication/_getUserByUsername', { username })
}

// Event API
export const eventAPI = {
  createEvent: (eventData) =>
    api.post('/Event/createEvent', {
      session: getSessionOrThrow(),
      ...eventData
    }),

  modifyEvent: (eventData) =>
    api.post('/Event/modifyEvent', {
      session: getSessionOrThrow(),
      ...eventData
    }),

  cancelEvent: (organizer, event) =>
    api.post('/Event/cancelEvent', {
      session: getSessionOrThrow(),
      organizer,
      event
    }),

  unCancelEvent: (organizer, event) =>
    api.post('/Event/unCancelEvent', {
      session: getSessionOrThrow(),
      organizer,
      event
    }),

  deleteEvent: (organizer, event) =>
    api.post('/Event/deleteEvent', {
      session: getSessionOrThrow(),
      organizer,
      event
    }),

  completeEvent: (event) =>
    api.post('/Event/completeEvent', {
      session: getSessionOrThrow(),
      event
    }),

  getEventById: (event) =>
    api.post('/Event/_getEventById', {
      session: getSessionOrThrow(),
      event
    }),

  getEventsByOrganizer: (organizer) =>
    api.post('/Event/_getEventsByOrganizer', {
      session: getSessionOrThrow(),
      organizer
    }),

  getEventsByStatus: (status) =>
    api.post('/Event/_getEventsByStatus', {
      session: getSessionOrThrow(),
      status
    }),

  getAllEvents: () =>
    api.post('/Event/_getAllEvents', {
      session: getSessionOrThrow()
    }),

  getEventsByRecommendationContext: (filters, priorities) =>
    api.post('/Event/_getEventsByRecommendationContext', {
      session: getSessionOrThrow(),
      filters,
      priorities
    })
}

// User Interest API
export const interestAPI = {
  addPersonalInterest: (tag) =>
    api.post('/UserInterest/addPersonalInterest', {
      session: getSessionOrThrow(),
      tag
    }),

  removePersonalInterest: (tag) =>
    api.post('/UserInterest/removePersonalInterest', {
      session: getSessionOrThrow(),
      tag
    }),

  addItemInterest: (item) =>
    api.post('/UserInterest/addItemInterest', {
      session: getSessionOrThrow(),
      item
    }),

  removeItemInterest: (item) =>
    api.post('/UserInterest/removeItemInterest', {
      session: getSessionOrThrow(),
      item
    }),

  getPersonalInterests: () =>
    api.post('/UserInterest/_getPersonalInterests', {
      session: getSessionOrThrow()
    }),

  getItemInterests: () =>
    api.post('/UserInterest/_getItemInterests', {
      session: getSessionOrThrow()
    }),

  getUsersInterestedInItems: (item) =>
    api.post('/UserInterest/_getUsersInterestedInItems', {
      session: getSessionOrThrow(),
      item
    })
}

// Friending API
export const friendingAPI = {
  sendFriendRequest: (targetUsername) =>
    api.post('/Friending/sendFriendRequest', {
      session: getSessionOrThrow(),
      targetUsername
    }),

  acceptFriendRequest: (requester) =>
    api.post('/Friending/acceptFriendRequest', {
      session: getSessionOrThrow(),
      requester
    }),

  removeFriendRequest: (requester, target) =>
    api.post('/Friending/removeFriendRequest', {
      session: getSessionOrThrow(),
      requester,
      target
    }),

  removeFriend: (friend) =>
    api.post('/Friending/removeFriend', {
      session: getSessionOrThrow(),
      friend
    }),

  getFriends: (user) =>
    api.post('/Friending/_getFriends', {
      session: getSessionOrThrow(),
      user
    }),

  getIncomingRequests: (user) =>
    api.post('/Friending/_getIncomingRequests', {
      session: getSessionOrThrow(),
      user
    }),

  getOutgoingRequests: (user) =>
    api.post('/Friending/_getOutgoingRequests', {
      session: getSessionOrThrow(),
      user
    })
}

// Reviewing API
export const reviewingAPI = {
  addReview: (item, rating, entry) =>
    api.post('/Reviewing/addReview', {
      session: getSessionOrThrow(),
      item,
      rating,
      entry
    }),

  removeReview: (item) =>
    api.post('/Reviewing/removeReview', {
      session: getSessionOrThrow(),
      item
    }),

  modifyReview: (item, rating, entry) =>
    api.post('/Reviewing/modifyReview', {
      session: getSessionOrThrow(),
      item,
      rating,
      entry
    }),

  getReview: (user, item) =>
    api.post('/Reviewing/_getReview', { user, item }),

  getReviewsByItem: (item) =>
    api.post('/Reviewing/_getReviewsByItem', { item }),

  getReviewsByUser: (user) =>
    api.post('/Reviewing/_getReviewsByUser', { user })
}
