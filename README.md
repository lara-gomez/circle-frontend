# Circle

A modern event discovery and community-building platform that helps users find and connect through local events.

[User Journey + Demo](/user-journey.md)

[Visual Design Study](/visual-design-study.pdf)

## Features

### 🎯 Core Functionality
- **Event Discovery** - Browse recommended events based on your interests
- **Event Management** - Create, edit, cancel, and delete your own events
- **Interest Tracking** - Mark events you're interested in and manage your interest list
- **Event History** - View past events you attended and leave reviews
- **Friend System** - Add friends, manage friend requests, and see which events friends are attending
- **User Profiles** - Manage your profile, interests, and view your activity stats

### 🎨 Design Features
- **Modern UI** - Clean, minimalist design with calm, welcoming aesthetics
- **Responsive Layout** - Desktop-first design that adapts to all screen sizes
- **Real-time Updates** - Reactive data updates without page refreshes
- **Intuitive Navigation** - Seamless routing between Discovery, Event History, Manage Events, and Profile pages

### 🔐 Authentication
- User authentication with username and password
- Protected routes for authenticated users only
- Persistent login sessions

## Tech Stack

- **Vue 3** - Progressive JavaScript framework with Composition API
- **Vite** - Fast build tool and development server
- **Vue Router** - Client-side routing
- **Axios** - HTTP client for API requests
- **Modern CSS** - Custom styling with CSS Grid and Flexbox

## Getting Started

### Prerequisites

- Node.js (version 20.19.0 or higher)
- npm or yarn
- Circle Backend running on `http://localhost:8000`

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd circle-frontend
```

2. Install dependencies:
```bash
npm install
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

**Note:** Ensure the Circle backend is running on `http://localhost:8000` before using the application.

### Building for Production

Build the application for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
circle-frontend/
├── src/
│   ├── api/
│   │   └── services.js          # API service layer
│   ├── components/              # Reusable Vue components
│   │   ├── EventCard.vue
│   │   ├── FriendList.vue
│   │   └── PastEventList.vue
│   ├── composables/             # Vue composition functions
│   │   └── useAuth.js          # Authentication composable
│   ├── layouts/                 # Layout components
│   │   └── AppLayout.vue       # Main app layout with navigation
│   ├── pages/                   # Page components
│   │   ├── LoginPage.vue       # Sign in/up page
│   │   ├── DiscoveryPage.vue   # Home page with event discovery
│   │   ├── EventHistoryPage.vue # Past events and reviews
│   │   ├── EventManagerPage.vue # Create/manage events
│   │   └── ProfilePage.vue     # User profile and settings
│   ├── router/
│   │   └── index.js            # Vue Router configuration
│   ├── App.vue                 # Root component
│   └── main.js                 # Application entry point
├── api-specs/                   # Backend API specifications
├── index.html
├── vite.config.js
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Key Features by Page

### Discovery Page
- View recommended events based on your interests
- Mark events as interested
- See which friends are attending events
- Refresh event recommendations

### Event Manager
- Create new events with details (name, date, location, duration, description)
- Edit existing events
- Cancel/uncancel events
- Delete events
- View events you're interested in
- Remove interest from events

### Event History
- View completed events you were interested in
- Add and edit reviews for past events
- See organizer usernames for each event

### Profile
- View account information
- Manage personal interests (add/remove)
- View activity statistics (events attended, reviews written, friends count, events created)
- Manage friends (friend list, pending requests, send requests, remove friends)

### Authentication
- Sign in with username and password
- Create new accounts
- Protected routes with automatic redirect to login
- Persistent sessions

## API Integration

The frontend integrates with the Circle backend API at `http://localhost:8000/api`:

- **Event API** - Event management (create, modify, cancel, delete, retrieve)
- **UserInterest API** - Track event interests and personal interests
- **Friending API** - Manage friend relationships and requests
- **Reviewing API** - Event reviews and ratings
- **UserAuthentication API** - User authentication and user information

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

## License

This project is licensed under the MIT License.
