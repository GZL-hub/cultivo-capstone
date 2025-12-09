# Frontend Development Guide

## Frontend Architecture Overview

Single Page Application (SPA) built with React 19.1 and TypeScript with feature-based component structure and service layer for API communication.

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
│   │   ├── alerts/              # Alerts & notifications
│   │   ├── analytics/           # Analytics & weather dashboard
│   │   │   └── weather/         # Weather components
│   │   ├── dashboard/           # Main dashboard
│   │   │   └── cards/           # Dashboard stat cards
│   │   ├── devices/             # Device management
│   │   │   ├── camera/          # Camera device components
│   │   │   └── sensor/          # Sensor device components
│   │   ├── farm-management/     # Core farm management
│   │   │   └── components/
│   │   │       ├── camera/      # CCTV streaming
│   │   │       ├── farm-map/    # Map with polygon drawing
│   │   │       ├── farm-overview/  # Farm overview & calendar
│   │   │       └── worker/      # Worker management
│   │   ├── layout/              # Layout (Header, Sidebar)
│   │   ├── login/               # Authentication UI
│   │   └── settings/            # Settings
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

## Component Organization

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

## Key Components

### App.tsx (Root Component)

**Responsibilities:**
- Google Maps API initialization
- Authentication state management
- Top-level routing
- Login/logout flow

**Key Features:**
- Protected routes (all routes in Layout require auth)
- Nested routes for farm management
- API key loading before map rendering
- User context passed as props

### Layout Components

#### Layout.tsx
**Structure:**
- Sidebar: Navigation menu (fixed left)
- Header: Top bar with user info and logout
- Main: Scrollable content area

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

All API communication abstracted into service modules:

```
Component → Service → Axios → Backend API
```

**Benefits:**
- Single source of truth for API endpoints
- Reusability across multiple components
- Easy to mock for testing
- Standardized error handling

### API Proxy

`package.json` proxy configuration:
```json
{
  "proxy": "http://localhost:8080"
}
```

Proxies all `/api/*` requests to backend during development, avoiding CORS issues.

## Routing Architecture

### React Router v7 Configuration
**Nested Routing Benefits:**
- Shared layouts for related routes
- Code organization by feature
- Logical URL hierarchy (`/farm/overview`, `/farm/map`)
- Default routes with `index`

## State Management

### Current Approach: React Hooks + Context API

**State Types:**
1. **Component State** (`useState`): UI state (modals, forms, loading)
2. **Server State** (`useEffect` + `useState`): Data from API
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

See `WebRTC.md` for detailed implementation.

**Component Structure:**
```
FarmCCTV.tsx (Main Component)
  └── SharedStreamProvider (Context)
      └── CameraGridItem (Repeated 4/9/16 times)
          └── SharedVideoPlayer (Consumes shared stream)
```

**Key Innovation:** Single WebRTC connection for multiple video players.

## Best Practices

### 1. Component Design
- Single responsibility per component
- Reusable UI patterns extracted
- TypeScript interfaces for all props
- Optional parameters with defaults

### 2. State Management
- Local first (use local state unless shared)
- Lift state up when multiple children need access
- Context API for deeply nested state
- Fetch data in parent, pass as props

### 3. Performance
- React.memo for expensive components (future)
- React.lazy for route code splitting (future)
- Debouncing for search inputs
- Virtualization for large lists (future)

### 4. Code Organization
- Import order: React → Third-party → Components → Services → Types
- File naming: PascalCase for components, camelCase for services
- Colocation: Keep related files together
