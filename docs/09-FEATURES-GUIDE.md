# Features Guide

This document provides detailed implementation guides for Cultivo's key features.

## Table of Contents

1. [Authentication System](#authentication-system)
2. [Farm Management](#farm-management)
3. [Interactive Farm Maps](#interactive-farm-maps)
4. [Worker Management](#worker-management)
5. [CCTV Live Streaming](#cctv-live-streaming)
6. [Device Management](#device-management)
7. [Analytics & Weather](#analytics--weather)
8. [Settings & Profile](#settings--profile)

---

## Authentication System

### Overview

JWT-based authentication with bcrypt password hashing.

### Components

**Location:** `frontend/src/components/login/`

- `Login.tsx` - Main authentication UI (login/register tabs)

**Files:**
- `frontend/src/services/authService.tsx` - Auth API client
- `backend/src/controllers/authController.ts` - Auth business logic
- `backend/src/middleware/auth.ts` - JWT verification middleware
- `backend/src/models/User.ts` - User model with password hashing

### Implementation Details

#### Frontend: Login Component

```typescript
// components/login/Login.tsx
const Login: React.FC<Props> = ({ onLogin, onRegister, loading, error }) => {
  const [isLogin, setIsLogin] = useState(true);  // Toggle between login/register
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      onLogin(formData.email, formData.password);
    } else {
      onRegister(formData.name, formData.email, formData.password);
    }
  };

  // UI with email/password inputs + submit button
};
```

#### Frontend: Auth Service

```typescript
// services/authService.tsx
import axios from 'axios';

// Configure axios interceptor
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (email: string, password: string) => {
  const response = await axios.post('/api/auth/login', { email, password });
  if (response.data.success) {
    localStorage.setItem('token', response.data.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
  }
  return response.data;
};

export const register = async (userData: RegisterData) => {
  const response = await axios.post('/api/auth/register', userData);
  if (response.data.success) {
    localStorage.setItem('token', response.data.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.data.user));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};
```

#### Backend: Auth Controller

```typescript
// controllers/authController.ts
export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      error: 'Email already exists'
    });
  }

  // Create user (password hashed automatically by pre-save hook)
  const user = await User.create({ name, email, password });

  // Generate JWT token
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    }
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid email or password'
    });
  }

  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      error: 'Invalid email or password'
    });
  }

  // Generate token
  const token = generateToken(user._id);

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl
      },
      token
    }
  });
};
```

#### Backend: JWT Middleware

```typescript
// middleware/auth.ts
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  // Extract token from Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  // Verify token
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  // Attach user to request
  const user = await User.findById(decoded.id).select('-password');
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  (req as any).user = user;
  next();
};
```

### Security Considerations

1. **Password Hashing**: bcrypt with 10 salt rounds (pre-save hook)
2. **JWT Expiration**: 30 days (configurable)
3. **HTTPS Only**: Production requires HTTPS
4. **Token Storage**: localStorage (consider httpOnly cookies for better security)

---

## Farm Management

### Overview

CRUD operations for farms with GeoJSON boundary support.

### Components

**Location:** `frontend/src/components/farm-management/`

- `FarmManagement.tsx` - Parent component with nested routing
- `components/farm-overview/FarmOverview.tsx` - Farm list and details
- `components/farm-map/FarmMap.tsx` - Interactive map with boundaries

**Files:**
- `frontend/src/services/farmService.tsx` - Farm API client
- `backend/src/controllers/farmController.ts` - Farm CRUD logic
- `backend/src/models/Farm.ts` - Farm model

### Implementation: Farm Overview

#### Frontend Component

```typescript
// farm-overview/FarmOverview.tsx
const FarmOverview: React.FC<{ ownerId: string }> = ({ ownerId }) => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFarms();
  }, [ownerId]);

  const loadFarms = async () => {
    setLoading(true);
    try {
      const response = await farmService.getFarms(ownerId);
      if (response.success) {
        setFarms(response.data);
      }
    } catch (error) {
      console.error('Failed to load farms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFarm = async (farmData: Partial<Farm>) => {
    const response = await farmService.createFarm(farmData);
    if (response.success) {
      loadFarms();  // Refresh list
      toast.success('Farm created successfully');
    }
  };

  const handleDeleteFarm = async (farmId: string) => {
    if (!confirm('Delete this farm?')) return;

    const response = await farmService.deleteFarm(farmId);
    if (response.success) {
      loadFarms();
      toast.success('Farm deleted');
    }
  };

  // Render farm cards with details
};
```

#### Backend Controller

```typescript
// controllers/farmController.ts
export const getAllFarms = async (req: Request, res: Response) => {
  const { owner } = req.query;

  const query = owner ? { owner } : {};
  const farms = await Farm.find(query).sort({ createdAt: -1 });

  res.json({
    success: true,
    data: farms
  });
};

export const createFarm = async (req: Request, res: Response) => {
  const { name, type, operationDate, areaSize, coordinates, owner } = req.body;

  // Validate required fields
  if (!name || !type || !operationDate || !areaSize || !owner) {
    return res.status(400).json({
      success: false,
      error: 'Please provide all required fields'
    });
  }

  const farm = await Farm.create({
    name,
    type,
    operationDate,
    areaSize,
    coordinates,
    owner
  });

  res.status(201).json({
    success: true,
    data: farm,
    message: 'Farm created successfully'
  });
};
```

---

## Interactive Farm Maps

### Overview

Google Maps integration with polygon drawing for farm boundaries.

### Components

**Location:** `frontend/src/components/farm-management/components/farm-map/`

- `FarmMap.tsx` - Main map component
- `polygon/PolygonDrawer.tsx` - Drawing tools (future)

### Implementation

```typescript
// farm-map/FarmMap.tsx
import { GoogleMap, Polygon, DrawingManager } from '@react-google-maps/api';

const FarmMap: React.FC<{ ownerId: string }> = ({ ownerId }) => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [drawingMode, setDrawingMode] = useState(false);
  const [center, setCenter] = useState({ lat: 12.9716, lng: 77.5946 });

  // Load farms with boundaries
  useEffect(() => {
    const loadFarms = async () => {
      const response = await farmService.getFarms(ownerId);
      if (response.success) {
        setFarms(response.data);
        if (response.data.length > 0) {
          setSelectedFarm(response.data[0]);
        }
      }
    };
    loadFarms();
  }, [ownerId]);

  // Handle polygon drawing complete
  const handlePolygonComplete = async (polygon: google.maps.Polygon) => {
    if (!selectedFarm) return;

    // Extract coordinates
    const path = polygon.getPath().getArray();
    const coordinates = path.map(latLng => [latLng.lng(), latLng.lat()]);
    coordinates.push(coordinates[0]);  // Close the polygon

    // Convert to GeoJSON format
    const farmBoundary = {
      type: 'Polygon',
      coordinates: [coordinates]
    };

    // Save to backend
    const response = await polygonService.updateFarmBoundary(
      selectedFarm._id,
      { farmBoundary }
    );

    if (response.success) {
      toast.success('Farm boundary saved');
      setSelectedFarm(response.data);
      setDrawingMode(false);

      // Remove drawing polygon
      polygon.setMap(null);
    }
  };

  // Convert GeoJSON to LatLng array
  const convertToLatLng = (coordinates: number[][][]) => {
    return coordinates[0].map(([lng, lat]) => ({ lat, lng }));
  };

  return (
    <div>
      {/* Farm Selector Dropdown */}
      <select
        value={selectedFarm?._id || ''}
        onChange={(e) => {
          const farm = farms.find(f => f._id === e.target.value);
          setSelectedFarm(farm || null);
        }}
      >
        <option value="">Select a farm</option>
        {farms.map(farm => (
          <option key={farm._id} value={farm._id}>
            {farm.name}
          </option>
        ))}
      </select>

      {/* Drawing Mode Toggle */}
      <button onClick={() => setDrawingMode(!drawingMode)}>
        {drawingMode ? 'Cancel Drawing' : 'Draw Boundary'}
      </button>

      {/* Google Map */}
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '600px' }}
        center={center}
        zoom={12}
        options={{
          mapTypeId: 'satellite',  // Satellite view for farms
          mapTypeControl: true
        }}
      >
        {/* Display existing boundaries */}
        {selectedFarm?.farmBoundary && (
          <Polygon
            paths={convertToLatLng(selectedFarm.farmBoundary.coordinates)}
            options={{
              strokeColor: '#4F46E5',
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: '#4F46E5',
              fillOpacity: 0.2,
              editable: false
            }}
          />
        )}

        {/* Drawing Manager for new boundaries */}
        {drawingMode && (
          <DrawingManager
            onPolygonComplete={handlePolygonComplete}
            options={{
              drawingControl: true,
              drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [google.maps.drawing.OverlayType.POLYGON]
              },
              polygonOptions: {
                strokeColor: '#10B981',
                strokeWeight: 2,
                fillColor: '#10B981',
                fillOpacity: 0.3,
                editable: true,
                draggable: true
              }
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
};
```

### GeoJSON Format

**Stored in MongoDB:**

```json
{
  "farmBoundary": {
    "type": "Polygon",
    "coordinates": [
      [
        [77.5946, 12.9716],  // [lng, lat]
        [77.5956, 12.9716],
        [77.5956, 12.9726],
        [77.5946, 12.9726],
        [77.5946, 12.9716]   // Close polygon
      ]
    ]
  }
}
```

---

## Worker Management

### Overview

Full CRUD operations for workers with nested resource pattern (`/api/farms/:farmId/workers`).

### Components

**Location:** `frontend/src/components/farm-management/components/worker/`

- `WorkerManagement.tsx` - Worker list with CRUD operations
- `WorkerCard.tsx` - Individual worker display card
- `WorkerForm.tsx` - Create/edit form modal

### Implementation

#### Frontend: Worker List

```typescript
// worker/WorkerManagement.tsx
const WorkerManagement: React.FC = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (selectedFarm) {
      loadWorkers();
    }
  }, [selectedFarm, statusFilter]);

  const loadWorkers = async () => {
    const response = await workerService.getWorkers(selectedFarm, statusFilter);
    if (response.success) {
      setWorkers(response.data);
    }
  };

  const handleCreate = async (workerData: Partial<Worker>) => {
    const response = await workerService.createWorker(selectedFarm, workerData);
    if (response.success) {
      loadWorkers();
      toast.success('Worker added successfully');
    }
  };

  const handleDelete = async (workerId: string) => {
    const response = await workerService.deleteWorker(selectedFarm, workerId);
    if (response.success) {
      loadWorkers();
      toast.success('Worker removed');
    }
  };

  // Filter workers by search term
  const filteredWorkers = workers.filter(worker =>
    worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Render worker grid with search/filter UI
};
```

#### Backend: Worker Controller

```typescript
// controllers/workerController.ts
export const getWorkers = async (req: Request, res: Response) => {
  const { farmId } = req.params;
  const { status, search } = req.query;

  // Build query
  const query: any = { farmId };
  if (status && status !== 'all') {
    query.status = status;
  }

  let workers = await Worker.find(query).sort({ createdAt: -1 });

  // Search filter (in-memory for simplicity, use $text index for production)
  if (search) {
    const searchStr = (search as string).toLowerCase();
    workers = workers.filter(w =>
      w.name.toLowerCase().includes(searchStr) ||
      w.role.toLowerCase().includes(searchStr)
    );
  }

  res.json({
    success: true,
    data: workers
  });
};

export const createWorker = async (req: Request, res: Response) => {
  const { farmId } = req.params;
  const { id, name, role, email, phone, joinDate, status } = req.body;

  // Validate required fields
  if (!id || !name || !role) {
    return res.status(400).json({
      success: false,
      error: 'Please provide worker id, name, and role'
    });
  }

  // Check for duplicate worker ID in same farm
  const existing = await Worker.findOne({ id, farmId });
  if (existing) {
    return res.status(409).json({
      success: false,
      error: `Worker with ID ${id} already exists for this farm`
    });
  }

  const worker = await Worker.create({
    id,
    name,
    role,
    email,
    phone,
    joinDate,
    status: status || 'active',
    farmId
  });

  res.status(201).json({
    success: true,
    data: worker,
    message: 'Worker created successfully'
  });
};
```

### Key Features

1. **Unique Worker IDs per Farm**: Compound index `(id, farmId)` ensures uniqueness
2. **Status Filtering**: Filter workers by active/inactive status
3. **Search**: Search by worker name or role
4. **Nested Routes**: Workers accessed via `/api/farms/:farmId/workers`

---

## CCTV Live Streaming

### Overview

Ultra-low latency WebRTC streaming with shared stream architecture for multiple viewers.

**For complete implementation details, see:** `.claude/WebRTC.md`

### Architecture

```
Camera (RTSP) → FFmpeg (Transcoding) → MediaMTX (WebRTC) → React App
```

### Key Innovation: Shared Stream Provider

**Problem:** 4x4 grid = 16 WebRTC connections = 16x bandwidth + CPU

**Solution:** Single WebRTC connection shared across all video players

### Implementation

#### Shared Stream Context

```typescript
// farm-management/components/camera/SharedStreamProvider.tsx
export const SharedStreamProvider: React.FC<Props> = ({ children, streamUrl }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const connect = async () => {
    setConnectionState('connecting');

    // Create peer connection
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // Handle track event (receive stream)
    pc.ontrack = (event) => {
      setStream(event.streams[0]);
      setConnectionState('connected');
    };

    // Handle ICE connection state
    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'failed') {
        setConnectionState('error');
        reconnect();  // Auto-reconnect on failure
      }
    };

    // Request video only
    pc.addTransceiver('video', { direction: 'recvonly' });

    // Create SDP offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // Send offer to WHEP endpoint
    const response = await fetch(streamUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/sdp' },
      body: offer.sdp
    });

    // Set remote SDP answer
    const answer = await response.text();
    await pc.setRemoteDescription({ type: 'answer', sdp: answer });

    peerConnectionRef.current = pc;
  };

  const disconnect = () => {
    peerConnectionRef.current?.close();
    setStream(null);
    setConnectionState('idle');
  };

  const reconnect = async () => {
    // Exponential backoff logic
  };

  return (
    <SharedStreamContext.Provider value={{ stream, connectionState, connect, disconnect }}>
      {children}
    </SharedStreamContext.Provider>
  );
};
```

#### Shared Video Player

```typescript
// farm-management/components/camera/SharedVideoPlayer.tsx
const SharedVideoPlayer: React.FC = () => {
  const { stream, connectionState } = useContext(SharedStreamContext);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  );
};
```

#### CCTV Dashboard

```typescript
// farm-management/components/camera/FarmCCTV.tsx
const FarmCCTV: React.FC = () => {
  const [gridSize, setGridSize] = useState<2 | 3 | 4>(2);
  const streamUrl = 'https://136.110.0.27:8889/livefeed/whep';

  return (
    <SharedStreamProvider streamUrl={streamUrl}>
      {/* Grid Controls */}
      <div>
        <button onClick={() => setGridSize(2)}>2x2</button>
        <button onClick={() => setGridSize(3)}>3x3</button>
        <button onClick={() => setGridSize(4)}>4x4</button>
      </div>

      {/* Camera Grid */}
      <div className={`grid grid-cols-${gridSize} gap-4`}>
        {Array.from({ length: gridSize * gridSize }).map((_, index) => (
          <CameraGridItem
            key={index}
            cameraName={`Camera ${index + 1}`}
          />
        ))}
      </div>
    </SharedStreamProvider>
  );
};
```

### Benefits

- **16x Bandwidth Reduction**: 1 connection for 16 cameras
- **Lower Server Load**: MediaMTX handles 1 connection instead of 16
- **Better Performance**: Single video decoder in browser
- **Scalability**: Supports more viewers without overhead

---

## Analytics & Weather

### Overview

Farm analytics dashboard with weather forecasting integration.

### Components

**Location:** `frontend/src/components/analytics/`

- `Analytics.tsx` - Parent with nested routing
- `FarmAnalytics.tsx` - Farm performance metrics
- `weather/WeatherAnalytics.tsx` - 5-day weather forecast

### Weather Feature

Uses external weather API (OpenWeatherMap or similar) for forecasts.

**Implementation:**

```typescript
// analytics/weather/WeatherAnalytics.tsx
const WeatherAnalytics: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState({ lat: 12.9716, lng: 77.5946 });

  useEffect(() => {
    fetchWeather();
  }, [location]);

  const fetchWeather = async () => {
    // Fetch from weather API
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${location.lat}&lon=${location.lng}&appid=API_KEY`
    );
    const data = await response.json();
    setWeatherData(processWeatherData(data));
  };

  // Render weather cards with ApexCharts/Recharts
};
```

---

## Next Steps

Explore detailed guides:
- **[Frontend Development](./04-FRONTEND-GUIDE.md)** - Component architecture
- **[Backend API](./05-BACKEND-API.md)** - API reference
- **[Database Models](./06-DATABASE-MODELS.md)** - Schema documentation
