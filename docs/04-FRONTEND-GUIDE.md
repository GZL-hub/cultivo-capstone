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

### 1. Feature-Based Structure

Components are organized by **feature/domain** rather than technical type:

```
✅ Good: Feature-based
components/
├── farm-management/    # Farm feature
│   ├── FarmManagement.tsx
│   └── components/
│       ├── farm-map/
│       ├── farm-overview/
│       └── worker/

❌ Bad: Type-based
components/
├── containers/
├── presentational/
└── hoc/
```

**Benefits:**
- **Cohesion**: Related components grouped together
- **Scalability**: Easy to add new features without restructuring
- **Maintainability**: Clear boundaries between features
- **Code Splitting**: Can lazy load entire features (future enhancement)

### 2. Component Hierarchy

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

```typescript
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>('');

  // Google Maps API loading
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "",
    libraries: ['places', 'drawing'],
  });

  // Check authentication on mount
  useEffect(() => {
    if (authService.isAuthenticated()) {
      setIsLoggedIn(true);
      setUserId(authService.getCurrentUser()?.id);
    }
  }, []);

  // Routing
  return (
    <Router>
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} onRegister={handleRegister} />
      ) : (
        <Layout onLogout={handleLogout}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/farm" element={<FarmManagement />}>
              <Route path="overview" element={<FarmOverview />} />
              <Route path="map" element={<FarmMap />} />
              <Route path="cctv" element={<FarmCCTV />} />
              <Route path="workers" element={<WorkerManagement />} />
            </Route>
            {/* ... more routes */}
          </Routes>
        </Layout>
      )}
    </Router>
  );
}
```

**Key Features:**
- **Protected Routes**: All routes wrapped in `Layout` require authentication
- **Nested Routes**: Farm management uses nested routing
- **API Key Loading**: Google Maps loaded before rendering map components
- **User Context**: userId passed as prop to farm components

### Layout Components

#### Layout.tsx (Main Layout)

```typescript
interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout }) => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onLogout={onLogout} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
```

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

**Implementation:**
```typescript
const navItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/farm', icon: MapPin, label: 'Farm Management' },
  { path: '/analytics', icon: BarChart, label: 'Analytics' },
  // ...
];
```

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

### Example: farmService.tsx

```typescript
import axios from 'axios';

// Get all farms (optionally filtered by owner)
export const getFarms = async (ownerId?: string) => {
  const url = ownerId ? `/api/farms?owner=${ownerId}` : '/api/farms';
  const response = await axios.get(url);
  return response.data;
};

// Get single farm by ID
export const getFarmById = async (farmId: string) => {
  const response = await axios.get(`/api/farms/${farmId}`);
  return response.data;
};

// Create new farm
export const createFarm = async (farmData: Partial<Farm>) => {
  const response = await axios.post('/api/farms', farmData);
  return response.data;
};

// Update farm
export const updateFarm = async (farmId: string, farmData: Partial<Farm>) => {
  const response = await axios.put(`/api/farms/${farmId}`, farmData);
  return response.data;
};

// Delete farm
export const deleteFarm = async (farmId: string) => {
  const response = await axios.delete(`/api/farms/${farmId}`);
  return response.data;
};
```

### Axios Configuration

**Automatic Token Injection** (configured in authService.tsx):

```typescript
// Axios interceptor adds Authorization header to all requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Error interceptor handles 401 Unauthorized
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Auto-logout on token expiration
      authService.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**API Proxy** (package.json):

```json
{
  "proxy": "http://localhost:8080"
}
```

This proxies all `/api/*` requests to the backend server during development, avoiding CORS issues.

## Routing Architecture

### React Router v7 Configuration

**Route Structure:**

```typescript
<Routes>
  <Route path="/" element={<Dashboard />} />

  {/* Nested Analytics Routes */}
  <Route path="/analytics" element={<Analytics />}>
    <Route path="farm" element={<FarmAnalytics />} />
    <Route path="weather" element={<WeatherAnalytics />} />
    <Route index element={<Navigate to="farm" replace />} />
  </Route>

  {/* Nested Farm Management Routes */}
  <Route path="/farm" element={<FarmManagement />}>
    <Route path="overview" element={<FarmOverview ownerId={userId} />} />
    <Route path="map" element={<FarmMap ownerId={userId} />} />
    <Route path="cctv" element={<FarmCCTV />} />
    <Route path="workers" element={<WorkerManagement />} />
    <Route index element={<Navigate to="overview" replace />} />
  </Route>

  {/* 404 Redirect */}
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

**Nested Routing Benefits:**
- **Shared Layouts**: Parent component renders common UI (tabs, headers)
- **Code Organization**: Related routes grouped together
- **URL Structure**: Logical hierarchy (`/farm/overview`, `/farm/map`)
- **Default Routes**: `index` redirects to default child route

### Navigation

**Programmatic Navigation:**

```typescript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/farm/overview');
```

**Link Components:**

```typescript
import { Link } from 'react-router-dom';

<Link to="/farm/map" className="nav-link">Farm Map</Link>
```

## State Management

### Current Approach: React Hooks + Context API

Cultivo uses **local state management** with hooks and Context API for global state.

**State Types:**

1. **Component State** (`useState`): UI state (modals, forms, loading)
2. **Server State** (`useEffect` + `useState`): Data fetched from API
3. **Global State** (Context API): Authentication, WebRTC streams
4. **URL State** (React Router): Route parameters, query strings

### Authentication State (Context Pattern)

**Implementation Pattern:**

```typescript
// App.tsx manages auth state
const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
const [userId, setUserId] = useState<string>('');

// Pass down via props or Context
<Layout onLogout={handleLogout}>
  <FarmOverview ownerId={userId} />
</Layout>
```

**Future Enhancement**: Create `AuthContext` for cleaner global auth state:

```typescript
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### WebRTC Stream State (Context API)

**SharedStreamProvider** manages a single WebRTC connection:

```typescript
// SharedStreamProvider.tsx
export const SharedStreamProvider: React.FC<Props> = ({ children, streamUrl }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');

  const connect = async () => {
    const pc = new RTCPeerConnection({ iceServers: [...] });
    // WebRTC connection logic
    pc.ontrack = (event) => setStream(event.streams[0]);
  };

  return (
    <SharedStreamContext.Provider value={{ stream, connectionState, connect }}>
      {children}
    </SharedStreamContext.Provider>
  );
};

// Consumer
const { stream, connectionState } = useContext(SharedStreamContext);
```

**Benefits:**
- Single WebRTC connection shared across 16 cameras (4x4 grid)
- 16x bandwidth reduction
- Centralized connection management

## Styling Architecture

### Tailwind CSS Utility-First Approach

**Configuration** (`tailwind.config.js`):

```javascript
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',     // Indigo
        secondary: '#10B981',   // Green
        background: '#F9FAFB',  // Light gray
        text: '#1F2937',        // Dark gray
      },
    },
  },
  plugins: [],
};
```

**Usage Example:**

```typescript
<div className="flex items-center justify-between p-6 bg-white rounded-lg shadow-md">
  <h2 className="text-2xl font-bold text-primary">Farm Overview</h2>
  <button className="px-4 py-2 bg-secondary text-white rounded hover:bg-green-600">
    Add Farm
  </button>
</div>
```

**Responsive Design:**

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Responsive grid: 1 column mobile, 2 tablet, 4 desktop */}
</div>
```

### Custom CSS (index.css)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom global styles */
body {
  @apply bg-background text-text;
}

/* Custom component classes */
.btn-primary {
  @apply px-4 py-2 bg-primary text-white rounded hover:bg-indigo-600;
}
```

**Build Process:**

```bash
# Watch mode for development
npm run tailwind

# Tailwind CLI command (in package.json)
"tailwind": "npx @tailwindcss/cli -i ./src/index.css -o ./src/output.css --watch"
```

## Google Maps Integration

### FarmMap Component

**Key Features:**
- Display farm boundaries (GeoJSON polygons)
- Draw new farm boundaries
- Edit existing boundaries
- Delete boundaries

**Implementation:**

```typescript
import { GoogleMap, Polygon, DrawingManager } from '@react-google-maps/api';

const FarmMap: React.FC<Props> = ({ ownerId }) => {
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [drawingMode, setDrawingMode] = useState<boolean>(false);

  const onPolygonComplete = (polygon: google.maps.Polygon) => {
    const path = polygon.getPath().getArray();
    const coordinates = path.map(latLng => [latLng.lng(), latLng.lat()]);

    // Save to backend
    updateFarmBoundary(selectedFarm.id, { coordinates });
  };

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '600px' }}
      center={center}
      zoom={12}
    >
      {/* Existing Boundaries */}
      {selectedFarm?.farmBoundary && (
        <Polygon
          paths={convertToLatLng(selectedFarm.farmBoundary.coordinates)}
          options={{ strokeColor: '#4F46E5', fillColor: '#4F46E5' }}
        />
      )}

      {/* Drawing Tool */}
      {drawingMode && (
        <DrawingManager
          onPolygonComplete={onPolygonComplete}
          options={{
            drawingControl: true,
            drawingControlOptions: {
              drawingModes: ['polygon'],
            },
          }}
        />
      )}
    </GoogleMap>
  );
};
```

**GeoJSON Format:**

```json
{
  "type": "Polygon",
  "coordinates": [
    [
      [lng1, lat1],
      [lng2, lat2],
      [lng3, lat3],
      [lng1, lat1]  // Close the polygon
    ]
  ]
}
```

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

## TypeScript Patterns

### Interface Definitions

```typescript
// types/index.ts
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  avatarUrl?: string;
}

export interface Farm {
  _id: string;
  name: string;
  type: string;
  operationDate: string;
  areaSize: string;
  coordinates?: string;
  farmBoundary?: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  owner: string;
}

export interface Worker {
  _id: string;
  id: string;  // Custom worker ID (unique per farm)
  name: string;
  role: string;
  email?: string;
  phone?: string;
  joinDate?: string;
  status: 'active' | 'inactive';
  farmId: string;
}
```

### Component Props Interfaces

```typescript
interface FarmOverviewProps {
  ownerId: string;
}

const FarmOverview: React.FC<FarmOverviewProps> = ({ ownerId }) => {
  // Component implementation
};
```

### API Response Types

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Usage
const response: ApiResponse<Farm[]> = await getFarms(ownerId);
```

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

### 4. Error Handling

```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const loadData = async () => {
  setLoading(true);
  setError(null);

  try {
    const data = await farmService.getFarms();
    setFarms(data);
  } catch (err: any) {
    setError(err.message || 'Failed to load farms');
  } finally {
    setLoading(false);
  }
};
```

### 5. Code Organization

- **Import Order**: React → Third-party → Components → Services → Types
- **File Naming**: PascalCase for components, camelCase for services
- **Colocation**: Keep related files together (component + styles + tests)

## Next Steps

- **[Backend API](./05-BACKEND-API.md)** - API endpoint reference
- **[Database Models](./06-DATABASE-MODELS.md)** - Data schema documentation
- **[Deployment](./07-DEPLOYMENT.md)** - Production deployment guide
