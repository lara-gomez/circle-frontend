# API Concept Synchronizations (Session-Based API)

The Circle frontend now consumes the @sync-api-specs.md surface, which introduces
session-scoped endpoints and slightly different response payloads. This note
summarizes how each major concept interacts across the app _after_ the session
migration.

---

## 1. Authentication Foundation

- `useAuth` calls `authAPI.login(username, password)` → receives `{ session }`.
- The session is persisted in `localStorage` (`session`, `user`, `isAuthenticated`)
  and exposed through the composable (`user`, `session`, `isAuthenticated`).
- `services.js` wraps every concept API and injects `session` automatically via
  `getSessionOrThrow()`. Any call without a session now throws immediately, which
  helps surface expired-session bugs quickly.

Supporting endpoints:

```javascript
authAPI.login(username, password)           // POST /api/login
authAPI.getSessionUser(session)             // POST /api/Session/_getUser
authAPI.logout(session)                     // POST /api/logout
```

`initAuth()` hydrates both `user` and `session` on every hard refresh, keeping
router guards and Axios calls in sync.

---

## 2. Authentication ↔ Other Concepts

### 2.1 Username resolution
- Files: `ProfilePage.vue`, `DiscoveryPage.vue`, `EventCard.vue`
- Flow: concept APIs return user IDs → `authAPI.getUsername(userId)` maps them
  to human-friendly names for UI display (friends, organizers, reviewer badges).

### 2.2 Session-scoped mutations
- Event, UserInterest, Friending, and Reviewing mutations are all driven by the
  stored session. No component passes an explicit `user` identifier anymore.

Examples:

```javascript
await eventAPI.createEvent({ name, date, duration, location, description })
await interestAPI.addPersonalInterest(tag)
await interestAPI.addItemInterest(eventId)
await friendingAPI.sendFriendRequest(targetUsername)
await reviewingAPI.addReview(eventId, rating, entry)
```

---

## 3. Event ↔ UserInterest

### 3.1 Marking interest
- File: `DiscoveryPage.vue` (`handleInterestChange`)
- Flow:
  - Add: `interestAPI.addItemInterest(eventId)`
  - Remove: `interestAPI.removeItemInterest(eventId)`
  - UI state mirrors backend by mutating `userInterests` and refreshing friends’
    interest data.

### 3.2 Recommendations
- File: `DiscoveryPage.vue`
- Flow:
  1. `interestAPI.getPersonalInterests()` → `results[]` of tags.
  2. Convert tags to comma-separated filters.
  3. `eventAPI.getEventsByRecommendationContext(filters, 'upcoming')`.
  4. Load all upcoming events via `eventAPI.getEventsByStatus('upcoming')`.
  5. Merge, de-dupe, and filter out past events.

### 3.3 Organizer dashboards
- File: `EventManagerPage.vue`
- Flow:
  1. `eventAPI.getEventsByOrganizer(userId)` → `results[]` of owned events.
  2. `interestAPI.getUsersInterestedInItems(eventId)` counts attendees.
  3. `interestAPI.getItemInterests()` hydrates "Events You're Interested In".

Response decoding follows the new shapes (`{ results: [...] }`, `{ event: {...} }`)
instead of the previous array payloads.

---

## 4. Friending ↔ UserInterest

### 4.1 Friend lifecycle
- File: `ProfilePage.vue`
- Session-based endpoints:
  - `friendingAPI.sendFriendRequest(targetUsername)`
  - `friendingAPI.acceptFriendRequest(requesterId)`
  - `friendingAPI.removeFriendRequest(requesterId, targetId)`
  - `friendingAPI.removeFriend(friendId)`
- Queries still take an explicit `user` while including `session`:
  - `friendingAPI.getFriends(userId)`
  - `friendingAPI.getIncomingRequests(userId)`
  - `friendingAPI.getOutgoingRequests(userId)`
- Username enrichment remains via `authAPI.getUsername`.

### 4.2 Friends interested in events
- File: `DiscoveryPage.vue`
- Flow:
  1. Fetch friends once (`getFriends`).
  2. Resolve usernames (cached in a lookup map).
  3. For each visible event: `interestAPI.getUsersInterestedInItems(eventId)`.
  4. Intersect interested user IDs with the friend set to populate the tooltip
     (`friendsAttendingMap`).

This replaces the previous “fetch each friend’s interests” approach with the new
session-compliant per-event lookup.

---

## 5. Reviewing ↔ Event

- Files: `EventHistoryPage.vue`, `PastEventList.vue`, `ProfilePage.vue`
- Mutations:

```javascript
await reviewingAPI.addReview(eventId, rating, entry)
await reviewingAPI.modifyReview(eventId, rating, entry)
await reviewingAPI.removeReview(eventId)
```

- Queries (`getReviewsByUser`, `getReviewsByItem`) keep their passthrough shape.
- Each review’s `target` is resolved with `eventAPI.getEventById(eventId)` which
  now returns `{ event: {...} }`.

---

## 6. Profile Aggregations

- File: `ProfilePage.vue`
- `loadRecentActivity()` now consumes session-aware helpers:

```javascript
const [interests, reviews, events, friends] = await Promise.all([
  interestAPI.getItemInterests(),                 // current user only
  reviewingAPI.getReviewsByUser(userId),
  eventAPI.getEventsByOrganizer(userId),
  friendingAPI.getFriends(userId)
])
```

- Interested events pull per-item event metadata (`eventAPI.getEventById`).
- Friend connections reuse friending data while resolving usernames.

---

## 7. Event History

- Files: `EventHistoryPage.vue`, `PastEventList.vue`
- Interest retrieval uses `interestAPI.getItemInterests()` (session scoped).
- Completed-event filtering and review editing work on the new response shapes:
  - `eventAPI.getEventById()` → `{ event }`
  - Review mutations drop the explicit user parameter.

---

## 8. Service Layer Upgrades

Located in `src/api/services.js`:

- `getSessionOrThrow()` centralizes session retrieval and throws a descriptive
  error if the session is missing.
- Each concept API normalizes the new request bodies (e.g., no explicit
  `organizer` or `user` on session-protected endpoints).
- Query helpers decode `{ results: [...] }` in consuming components instead of
  relying on the older bare array responses.

---

## Quick Reference Matrix

| Concept             | Key Session-Aware Calls                                        | Primary Consumers                  |
|---------------------|----------------------------------------------------------------|------------------------------------|
| Authentication      | `login`, `logout`, `getSessionUser`                            | `useAuth`                          |
| Event               | `createEvent`, `modifyEvent`, `_getEventById`, `_getEventsByStatus` | `Discovery`, `EventManager`, `Profile` |
| UserInterest        | `addPersonalInterest`, `addItemInterest`, `_getPersonalInterests`, `_getUsersInterestedInItems` | `Profile`, `Discovery`, `EventManager` |
| Friending           | `sendFriendRequest`, `acceptFriendRequest`, `_getFriends`      | `Profile`, `Discovery`             |
| Reviewing           | `addReview`, `modifyReview`, `removeReview`, `_getReviewsByUser` | `EventHistory`, `Profile`          |

All of these wrappers rely on the composable-managed session, so any new call
sites should continue using the helpers in `services.js` rather than issuing
raw Axios requests.


