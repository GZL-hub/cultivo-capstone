# Frontend Development Guide

## Frontend Architecture Overview

The Cultivo frontend is a **Single Page Application (SPA)** built with React 19.1 and TypeScript. It follows a **feature-based component structure** with clear separation of concerns and a service layer for API communication.

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | React 19.1.1 | UI component library with hooks |
| **Language** | TypeScript 4.9.5 | Type-safe development |
| **Build Tool** | Create React App 5.0.1 | Zero-config build setup |
| **Styling** | Tailwind CSS 3.4.17 | Utility-first CSS framework |
| **Routing** | React Router DOM 7.9.1 | Client-side routing |
| **HTTP Client** | Axios 1.12.2 | API communication |
| **Maps** | Google Maps API 2.20.7 | Interactive maps with polygon tools |
| **Charts** | ApexCharts 5.3.5 + Recharts 3.2.1 | Data visualization |
| **Icons** | Lucide React 0.544.0 | Icon library |
| **Animations** | Framer Motion 12.23.21 | UI animations |
| **Notifications** | React Hot Toast 2.6.0 | Toast notifications |

## Project Structure

```
frontend/
├── public/                      # Static assets
│   ├── index.html               # HTML template
│   ├── favicon.ico              # App icon
│   └── manifest.json            # PWA manifest
│
├── src/
│   ├── components/              # Feature-based components
│   │   ├── alerts/              # Alerts & notifications feature
│   │   ├── analytics/           # Analytics & weather dashboard
│   │   │   └── weather/         # Weather-specific components
│   │   ├── dashboard/           # Main dashboard
│   │   │   └── cards/           # Dashboard stat cards
│   │   ├── devices/             # Device management
│   │   │   ├── camera/          # Camera device components
│   │   │   └── sensor/          # Sensor device components
│   │   ├── farm-management/     # Core farm management feature
│   │   │   └── components/
│   │   │       ├── camera/      # CCTV streaming components
│   │   │       ├── farm-map/    # Map with polygon drawing
│   │   │       ├── farm-overview/  # Farm overview & calendar
│   │   │       └── worker/      # Worker management
│   │   ├── layout/              # Layout components (Header, Sidebar)
│   │   ├── login/               # Authentication UI
│   │   └── settings/            # Settings feature
│   │       ├── account/         # Account settings
│   │       └── farm/            # Farm settings
│   │
│   ├── services/                # API service layer
│   │   ├── authService.tsx      # Authentication API
│   │   ├── farmService.tsx      # Farm CRUD API
│   │   ├── workerService.tsx    # Worker CRUD API
│   │   ├── cctvService.tsx      # CCTV API
│   │   ├── userService.tsx      # User management API
│   │   └── polygonService.tsx   # Farm boundary API
│   │
│   ├── types/                   # TypeScript type definitions
│   │   └── index.ts             # Shared types
│   │
│   ├── App.tsx                  # Main application component
│   ├── index.tsx                # React DOM entry point
│   ├── index.css                # Tailwind CSS imports
│   └── output.css               # Compiled Tailwind CSS
│
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript configuration
└── tailwind.config.js           # Tailwind CSS configuration
```

## Component Organization Principles
### Component Hierarchy

```
App.tsx (Root)
  └── Layout
      ├── Header
      ├── Sidebar
      └── <Route Component>
          └── Feature-Specific Components
              └── Reusable UI Components
```

## Key Components Breakdown

### App.tsx (Root Component)

**Responsibilities:**
- Google Maps API initialization
- Authentication state management
- Top-level routing
- Login/logout flow

**Key Features:**
- **Protected Routes**: All routes wrapped in `Layout` require authentication
- **Nested Routes**: Farm management uses nested routing
- **API Key Loading**: Google Maps loaded before rendering map components
- **User Context**: userId passed as prop to farm components

### Layout Components

#### Layout.tsx (Main Layout)
**Structure:**
- **Sidebar**: Navigation menu (fixed left column)
- **Header**: Top bar with user info and logout
- **Main**: Scrollable content area

#### Header.tsx

**Features:**
- User avatar and name display
- Logout button
- Breadcrumb navigation (future)
- Notification bell (future)

#### Sidebar.tsx

**Navigation Links:**
- Dashboard
- Analytics (Farm/Weather)
- Alerts
- Device Settings (Sensors/Cameras)
- Farm Management (Overview/Map/CCTV/Workers)
- Settings

## Service Layer Pattern

### Design Philosophy

All API communication is **abstracted into service modules**:

```
Component → Service → Axios → Backend API
```

**Benefits:**
- **Single Source of Truth**: API endpoints defined once
- **Reusability**: Services used across multiple components
- **Testability**: Easy to mock services for unit tests
- **Consistency**: Standardized error handling and request format

## API Proxy ## (package.json):

```json
{
  "proxy": "http://localhost:8080"
}
```

This proxies all `/api/*` requests to the backend server during development, avoiding CORS issues.

## Routing Architecture

### React Router v7 Configuration
**Nested Routing Benefits:**
- **Shared Layouts**: Parent component renders common UI (tabs, headers)
- **Code Organization**: Related routes grouped together
- **URL Structure**: Logical hierarchy (`/farm/overview`, `/farm/map`)
- **Default Routes**: `index` redirects to default child route

## State Management

### Current Approach: React Hooks + Context API

Cultivo uses **local state management** with hooks and Context API for global state.

**State Types:**

1. **Component State** (`useState`): UI state (modals, forms, loading)
2. **Server State** (`useEffect` + `useState`): Data fetched from API
3. **Global State** (Context API): Authentication, WebRTC streams
4. **URL State** (React Router): Route parameters, query strings


## Google Maps Integration

### FarmMap Component

**Key Features:**
- Display farm boundaries (GeoJSON polygons)
- Draw new farm boundaries
- Edit existing boundaries
- Delete boundaries

## WebRTC Streaming Components

See [WebRTC.md](../.claude/WebRTC.md) for detailed implementation.

**Component Structure:**

```
FarmCCTV.tsx (Main Component)
  └── SharedStreamProvider (Context)
      └── CameraGridItem (Repeated 4/9/16 times)
          └── SharedVideoPlayer (Consumes shared stream)
```

**Key Innovation**: Single WebRTC connection for multiple video players.

## Best Practices

### 1. Component Design

- **Single Responsibility**: Each component has one clear purpose
- **Reusability**: Extract common UI patterns into shared components
- **Props Interface**: Always define TypeScript interfaces for props
- **Default Props**: Use TypeScript optional parameters with defaults

### 2. State Management

- **Local First**: Use local state unless state needs to be shared
- **Lift State Up**: Move state to parent when multiple children need access
- **Avoid Prop Drilling**: Use Context API for deeply nested state
- **Server State**: Fetch data in parent, pass down as props

### 3. Performance

- **Memoization**: Use `React.memo` for expensive components (future)
- **Lazy Loading**: Use `React.lazy` for route-based code splitting (future)
- **Debouncing**: Debounce search inputs to reduce API calls
- **Virtualization**: Use react-window for large lists (future)

### 4. Code Organization

- **Import Order**: React → Third-party → Components → Services → Types
- **File Naming**: PascalCase for components, camelCase for services
- **Colocation**: Keep related files together (component + styles + tests)

## Next Steps

- **[Backend API](./05-BACKEND-API.md)** - API endpoint reference
- **[Database Models](./06-DATABASE-MODELS.md)** - Data schema documentation
- **[Deployment](./07-DEPLOYMENT.md)** - Production deployment guide
