# System Architecture

## Architecture Overview

Cultivo follows a **three-tier architecture** with clear separation between presentation, business logic, and data layers. The system employs a **client-server model** with RESTful API communication and a hybrid cloud infrastructure for media streaming.

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT TIER                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │   React SPA (Browser)                                     │   │
│  │   - React Router (Client-side routing)                    │   │
│  │   - Context API (State management)                        │   │
│  │   - Axios (HTTP client with interceptors)                 │   │
│  │   - Google Maps API (Interactive maps)                    │   │
│  │   - WebRTC (Media streaming)                              │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ├─── HTTPS/REST API
                              │
┌─────────────────────────────────────────────────────────────────┐
│                     APPLICATION TIER                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │   Express.js Server (Node.js)                             │   │
│  │   ├── Routes (API endpoints)                              │   │
│  │   ├── Controllers (Business logic)                        │   │
│  │   ├── Middleware (Auth, CORS, JSON parsing)              │   │
│  │   └── Utils (JWT, helpers)                                │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ├─── MongoDB Protocol
                              │
┌─────────────────────────────────────────────────────────────────┐
│                        DATA TIER                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │   MongoDB Database                                         │   │
│  │   ├── Users Collection                                     │   │
│  │   ├── Farms Collection                                     │   │
│  │   ├── Workers Collection                                   │   │
│  │   └── CCTVs Collection                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

### Cloud Infrastructure

Cultivo uses a **hybrid cloud architecture** with services distributed across GCP:

```
┌───────────────────────────────────────────────────────────────────┐
│                    LOCAL NETWORK (Farm Site)                      │
│  ┌─────────────────┐        ┌────────────────────────────────┐   │
│  │ Hikvision Camera│─RTSP──▶│ FFmpeg Bridge (Desktop/RPi)    │   │
│  │ 192.168.68.112  │        │ - H.265 to H.264 transcoding   │   │
│  └─────────────────┘        └────────────────────────────────┘   │
└───────────────────────────────────────│───────────────────────────┘
                                        │ RTSP Push (TCP)
                                        │ (via Public IP)
                                        ▼
┌───────────────────────────────────────────────────────────────────┐
│             GOOGLE CLOUD PLATFORM (asia-southeast1)               │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  COMPUTE ENGINE VM (us-central1)                            │ │
│  │  ┌───────────────────────────────────────────────────────┐  │ │
│  │  │ MediaMTX Server (136.110.0.27:8889)                   │  │ │
│  │  │ - Receives RTSP stream from FFmpeg                     │  │ │
│  │  │ - Serves WebRTC (WHEP) to browsers                     │  │ │
│  │  │ - Self-signed TLS certificates                         │  │ │
│  │  │ - STUN server for NAT traversal                        │  │ │
│  │  └───────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  CLOUD RUN SERVICE (cultivo-capstone)                       │ │
│  │  ┌───────────────────────────────────────────────────────┐  │ │
│  │  │ Docker Container (Port 8080)                          │  │ │
│  │  │ ├── Express.js Backend (/api/*)                       │  │ │
│  │  │ └── React Frontend (Static files in /public)          │  │ │
│  │  └───────────────────────────────────────────────────────┘  │ │
│  │  - Auto-scaling (0 to N instances)                          │ │
│  │  - Managed HTTPS/TLS                                        │ │
│  │  - Request routing                                          │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  ARTIFACT REGISTRY                                          │ │
│  │  - Docker image storage                                     │ │
│  │  - Version history                                          │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  CLOUD BUILD                                                │ │
│  │  - Automated builds from GitHub                             │ │
│  │  - Multi-stage Docker builds                                │ │
│  └─────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
                                        │
                                        │ MongoDB Protocol
                                        ▼
┌───────────────────────────────────────────────────────────────────┐
│                      MONGODB ATLAS (Cloud)                        │
│  - Managed MongoDB cluster                                        │
│  - Automatic backups                                              │
│  - Global distribution                                            │
└───────────────────────────────────────────────────────────────────┘
```

## Data Flow Patterns

### 1. Authentication Flow

```
┌──────────┐                     ┌──────────┐                    ┌──────────┐
│  Client  │                     │  Backend │                    │ Database │
└────┬─────┘                     └────┬─────┘                    └────┬─────┘
     │                                │                               │
     │ POST /api/auth/login           │                               │
     │ { email, password }            │                               │
     ├───────────────────────────────▶│                               │
     │                                │                               │
     │                                │ Find user by email            │
     │                                ├──────────────────────────────▶│
     │                                │                               │
     │                                │ User document                 │
     │                                │◀──────────────────────────────┤
     │                                │                               │
     │                                │ Compare passwords (bcrypt)    │
     │                                │                               │
     │                                │ Generate JWT token            │
     │                                │                               │
     │ { success: true, token, user } │                               │
     │◀───────────────────────────────┤                               │
     │                                │                               │
     │ Store token in localStorage    │                               │
     │                                │                               │
     │                                │                               │
     │ GET /api/farms                 │                               │
     │ Authorization: Bearer <token>  │                               │
     ├───────────────────────────────▶│                               │
     │                                │                               │
     │                                │ Verify JWT (middleware)       │
     │                                │                               │
     │                                │ Query farms                   │
     │                                ├──────────────────────────────▶│
     │                                │                               │
     │                                │ Farm documents                │
     │                                │◀──────────────────────────────┤
     │                                │                               │
     │ { success: true, data: farms } │                               │
     │◀───────────────────────────────┤                               │
     │                                │                               │
```

**Key Components:**
- **Client**: Stores JWT in `localStorage` as "token"
- **Axios Interceptor**: Automatically adds `Authorization: Bearer {token}` header
- **Protect Middleware**: Verifies JWT and attaches `req.user` for all protected routes
- **JWT Payload**: `{ id: userId, iat: issuedAt, exp: expiresAt }`

### 2. Farm Management Flow

```
┌──────────┐                     ┌──────────┐                    ┌──────────┐
│  Client  │                     │  Backend │                    │ Database │
└────┬─────┘                     └────┬─────┘                    └────┬─────┘
     │                                │                               │
     │ 1. Get all farms               │                               │
     │ GET /api/farms?owner=userId    │                               │
     ├───────────────────────────────▶│                               │
     │                                │ Farm.find({ owner: userId })  │
     │                                ├──────────────────────────────▶│
     │                                │ [farms...]                    │
     │                                │◀──────────────────────────────┤
     │ [farms...]                     │                               │
     │◀───────────────────────────────┤                               │
     │                                │                               │
     │ 2. Create new farm             │                               │
     │ POST /api/farms                │                               │
     │ { name, type, area, owner }    │                               │
     ├───────────────────────────────▶│                               │
     │                                │ new Farm().save()             │
     │                                ├──────────────────────────────▶│
     │                                │ farm document                 │
     │                                │◀──────────────────────────────┤
     │ { success: true, data: farm }  │                               │
     │◀───────────────────────────────┤                               │
     │                                │                               │
     │ 3. Draw farm boundary          │                               │
     │ PUT /api/farms/:id/boundary    │                               │
     │ { farmBoundary: GeoJSON }      │                               │
     ├───────────────────────────────▶│                               │
     │                                │ Farm.findByIdAndUpdate()      │
     │                                ├──────────────────────────────▶│
     │                                │ updated farm                  │
     │                                │◀──────────────────────────────┤
     │ { success: true, data: farm }  │                               │
     │◀───────────────────────────────┤                               │
```

### 3. Worker Management Flow (Nested Resource)

Workers are **nested under farms** with the route pattern `/api/farms/:farmId/workers`:

```
┌──────────┐                     ┌──────────┐                    ┌──────────┐
│  Client  │                     │  Backend │                    │ Database │
└────┬─────┘                     └────┬─────┘                    └────┬─────┘
     │                                │                               │
     │ GET /api/farms/123/workers     │                               │
     ├───────────────────────────────▶│                               │
     │                                │ Worker.find({ farmId: 123 })  │
     │                                ├──────────────────────────────▶│
     │                                │ [workers...]                  │
     │                                │◀──────────────────────────────┤
     │ [workers...]                   │                               │
     │◀───────────────────────────────┤                               │
     │                                │                               │
     │ POST /api/farms/123/workers    │                               │
     │ { id, name, role, email }      │                               │
     ├───────────────────────────────▶│                               │
     │                                │ Check duplicate ID            │
     │                                │ Worker.findOne({id, farmId})  │
     │                                ├──────────────────────────────▶│
     │                                │ null (not found)              │
     │                                │◀──────────────────────────────┤
     │                                │                               │
     │                                │ new Worker({ ...data,         │
     │                                │   farmId: 123 }).save()       │
     │                                ├──────────────────────────────▶│
     │                                │ worker document               │
     │                                │◀──────────────────────────────┤
     │ { success: true, data: worker }│                               │
     │◀───────────────────────────────┤                               │
```

**Key Design Decisions:**
- **Nested Routes**: Workers accessed via `/api/farms/:farmId/workers`
- **farmId Association**: Every worker has a `farmId` reference to its parent farm
- **Unique Constraint**: Compound index `(id, farmId)` ensures unique worker IDs per farm
- **Cascade Consideration**: Deleting a farm should handle associated workers (future enhancement)

### 4. WebRTC Streaming Flow

Detailed in the [WebRTC.md](./.claude/WebRTC.md) file. High-level flow:

```
┌─────────────┐        ┌─────────────┐       ┌─────────────┐       ┌─────────┐
│   Camera    │─RTSP──▶│   FFmpeg    │─RTSP─▶│  MediaMTX   │◀WebRTC│ Browser │
│ (Local IP)  │        │   Bridge    │       │  (GCE VM)   │       │ (Client)│
└─────────────┘        └─────────────┘       └─────────────┘       └─────────┘
    H.265/AAC          Transcoding            WebRTC Server        React App
                       H.264/AAC              Port 8889            SharedStream
```

**Flow Steps:**
1. FFmpeg pulls RTSP stream from camera (local network)
2. Transcodes H.265 → H.264 for browser compatibility
3. Pushes transcoded stream to MediaMTX on GCE VM
4. React app creates WebRTC connection via WHEP endpoint
5. MediaMTX streams video to browser with ~0.5-1.5s latency
6. Single WebRTC connection shared across multiple video players (16x efficiency)

## Design Patterns

### 1. MVC-like Pattern (Backend)

```
Routes (Entry Point)
    ↓
Middleware (Auth, Validation)
    ↓
Controllers (Business Logic)
    ↓
Models (Data Access)
    ↓
Database
```

**Example: Farm CRUD**

```typescript
// Route (farmRoutes.ts)
router.route('/').get(getAllFarms).post(createFarm);

// Controller (farmController.ts)
export const createFarm = async (req, res) => {
  const farm = await Farm.create(req.body);
  res.json({ success: true, data: farm });
};

// Model (Farm.ts)
const FarmSchema = new Schema({ name, type, owner, ... });
export default mongoose.model('Farm', FarmSchema);
```

### 2. Service Layer Pattern (Frontend)

All API communication abstracted into service modules:

```typescript
// Service (farmService.tsx)
export const getFarms = async (ownerId?: string) => {
  const url = ownerId ? `/api/farms?owner=${ownerId}` : '/api/farms';
  const response = await axios.get(url);
  return response.data;
};

// Component (FarmOverview.tsx)
import { getFarms } from '../../services/farmService';

const loadFarms = async () => {
  const data = await getFarms(ownerId);
  setFarms(data);
};
```

**Benefits:**
- Centralized API logic
- Easy to mock for testing
- Consistent error handling
- Single source of truth for endpoints

### 3. Provider Pattern (React Context)

Used for sharing WebRTC streams across components:

```typescript
// SharedStreamProvider.tsx
const SharedStreamContext = createContext<SharedStreamContextType | undefined>(undefined);

export const SharedStreamProvider: React.FC<{ children, streamUrl }> = ({ children, streamUrl }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');

  // Single WebRTC connection logic
  const connect = async () => { /* ... */ };

  return (
    <SharedStreamContext.Provider value={{ stream, connectionState, connect, disconnect }}>
      {children}
    </SharedStreamContext.Provider>
  );
};

// Consumer (SharedVideoPlayer.tsx)
const { stream, connectionState } = useContext(SharedStreamContext);
```

**Benefits:**
- Single WebRTC connection for multiple video players
- Centralized connection state management
- 16x bandwidth and CPU reduction for 4x4 grid

### 4. Middleware Pattern (Express)

Chain of responsibility for request processing:

```typescript
// Auth Middleware (auth.ts)
export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });

  const decoded = verifyToken(token);
  req.user = await User.findById(decoded.id);
  next();
};

// Route with Middleware
router.get('/farms', protect, getAllFarms);
```

### 5. Repository Pattern (Mongoose Models)

Models act as data access layer:

```typescript
// Direct database interaction through model
const farms = await Farm.find({ owner: userId })
  .populate('owner', 'name email')
  .sort({ createdAt: -1 });
```

## Security Architecture

### 1. Authentication Security

- **Password Hashing**: bcrypt with 10 salt rounds
- **JWT Tokens**: Signed tokens with expiration
- **Token Storage**: localStorage (client-side)
- **Token Transmission**: Authorization header (`Bearer <token>`)

### 2. Authorization

- **Middleware Protection**: `protect` middleware verifies JWT
- **User Context**: Authenticated user attached to `req.user`
- **Resource Ownership**: Queries filtered by `owner` field (future enhancement: explicit checks)

### 3. API Security

- **CORS**: Configured to allow cross-origin requests
- **Input Validation**: Mongoose schema validation
- **Error Handling**: Generic error messages to prevent information leakage
- **Rate Limiting**: Not implemented (future enhancement)

### 4. Data Security

- **Password Exclusion**: `.select('-password')` in user queries
- **Environment Variables**: Secrets stored in `.env` (not committed to Git)
- **Build-time Secrets**: API keys passed as build args in Docker

## Database Schema Design

### Entity Relationships

```
┌─────────────┐
│    User     │
│  _id (PK)   │
│  name       │
│  email      │
│  password   │
└─────┬───────┘
      │
      │ 1:N (owner)
      │
┌─────▼───────┐
│    Farm     │
│  _id (PK)   │
│  name       │
│  type       │
│  owner (FK) │
│  boundary   │
└─────┬───────┘
      │
      ├─────────────────┬─────────────────┐
      │ 1:N             │ 1:N             │
      │                 │                 │
┌─────▼───────┐   ┌─────▼───────┐   ┌───▼────────┐
│   Worker    │   │    CCTV     │   │  (Future)  │
│  _id (PK)   │   │  _id (PK)   │   │  Sensor    │
│  id         │   │  name       │   │  Equipment │
│  name       │   │  streamUrl  │   └────────────┘
│  farmId (FK)│   │  farmId (FK)│
└─────────────┘   └─────────────┘
```

### Indexing Strategy

```typescript
// Worker compound index for unique IDs per farm
WorkerSchema.index({ id: 1, farmId: 1 }, { unique: true });

// Future indexes (recommended):
// Farm.index({ owner: 1, createdAt: -1 });
// CCTV.index({ farmId: 1, status: 1 });
```

## API Design Principles

### 1. RESTful Conventions

- **GET**: Retrieve resources
- **POST**: Create new resources
- **PUT**: Update existing resources
- **DELETE**: Remove resources

### 2. URL Structure

```
/api/{resource}              # Collection endpoint
/api/{resource}/:id          # Single resource endpoint
/api/{resource}/:id/{action} # Sub-resource or action
/api/{parent}/:id/{nested}   # Nested resource
```

### 3. Response Format

Consistent JSON structure across all endpoints:

```typescript
{
  success: boolean,
  data?: T,
  error?: string,
  message?: string
}
```

### 4. Error Handling

```typescript
// Standard error responses
400 Bad Request       // Validation errors
401 Unauthorized      // Missing or invalid token
404 Not Found         // Resource doesn't exist
500 Internal Error    // Server-side errors
```

## Performance Considerations

### 1. Frontend Optimization

- **Code Splitting**: Route-based lazy loading (future)
- **Memoization**: React.memo for expensive components (future)
- **Debouncing**: Search inputs to reduce API calls
- **Caching**: Browser HTTP cache for static assets

### 2. Backend Optimization

- **Database Indexes**: Compound indexes for frequent queries
- **Connection Pooling**: Mongoose connection pooling
- **Lean Queries**: `.lean()` for read-only data (future)
- **Pagination**: Limit + skip for large datasets (future)

### 3. Network Optimization

- **HTTP/2**: Supported by Cloud Run
- **Compression**: gzip/brotli compression
- **CDN**: Static assets served from Cloud Run edge locations
- **WebRTC**: Peer-to-peer media streaming (NAT traversal via STUN)

## Scalability Strategy

### Current Limitations

- **Single Cloud Run Instance**: Can scale to N instances automatically
- **Single MediaMTX Instance**: Single point of failure for streaming
- **No Load Balancer**: Cloud Run handles load balancing automatically
- **No Caching Layer**: Redis not implemented

### Future Enhancements

1. **Multiple MediaMTX Instances**: Load balance across multiple VMs
2. **Redis Caching**: Cache user sessions, farm data
3. **Database Sharding**: Distribute data across multiple MongoDB instances
4. **CDN for Assets**: CloudFlare/CloudFront for static files
5. **Queue System**: Bull/BullMQ for async tasks (email, notifications)

## Next Steps

- **[Frontend Guide](./04-FRONTEND-GUIDE.md)** - Frontend component architecture
- **[Backend API](./05-BACKEND-API.md)** - Complete API reference
- **[Database Models](./06-DATABASE-MODELS.md)** - Detailed schema documentation
