# System Architecture

## Architecture Overview

Cultivo follows a **three-tier architecture** with client-server model, RESTful API communication, and hybrid cloud infrastructure.

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT TIER                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │   React SPA (Browser)                                    │   │
│  │   - React Router (Client-side routing)                   │   │
│  │   - Context API (State management)                       │   │
│  │   - Axios (HTTP client with interceptors)                │   │
│  │   - Google Maps API (Interactive maps)                   │   │
│  │   - WebRTC (Media streaming)                             │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ├─── HTTPS/REST API
                              │
┌─────────────────────────────────────────────────────────────────┐
│                     APPLICATION TIER                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │   Express.js Server (Node.js)                            │   │
│  │   ├── Routes (API endpoints)                             │   │
│  │   ├── Controllers (Business logic)                       │   │
│  │   ├── Middleware (Auth, CORS, JSON parsing)              │   │
│  │   └── Utils (JWT, helpers)                               │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ├─── MongoDB Protocol
                              │
┌─────────────────────────────────────────────────────────────────┐
│                        DATA TIER                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │   MongoDB Database                                       │   │
│  │   ├── Users Collection                                   │   │
│  │   ├── Farms Collection                                   │   │
│  │   ├── Workers Collection                                 │   │
│  │   └── CCTVs Collection                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

### Cloud Infrastructure

```
┌───────────────────────────────────────────────────────────────────┐
│                    LOCAL NETWORK (Farm Site)                      │
│  ┌─────────────────┐        ┌────────────────────────────────┐    │
│  │ Hikvision Camera│─RTSP──▶│ FFmpeg Bridge (Desktop/RPi)    │   │
│  │ 192.168.68.112  │        │ - H.265 to H.264 transcoding   │    │
│  └─────────────────┘        └────────────────────────────────┘    │
└───────────────────────────────────────│───────────────────────────┘
                                        │ RTSP Push (TCP)
                                        │ (via Public IP)
                                        ▼
┌──────────────────────────────────────────────────────────────────┐
│             GOOGLE CLOUD PLATFORM (asia-southeast1)              │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  COMPUTE ENGINE VM (us-central1)                            │ │
│  │  ┌───────────────────────────────────────────────────────┐  │ │
│  │  │ MediaMTX Server (136.110.0.27:8889)                   │  │ │
│  │  │ - Receives RTSP stream from FFmpeg                    │  │ │
│  │  │ - Serves WebRTC (WHEP) to browsers                    │  │ │
│  │  │ - Self-signed TLS certificates                        │  │ │
│  │  │ - STUN server for NAT traversal                       │  │ │
│  │  └───────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
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
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  ARTIFACT REGISTRY                                          │ │
│  │  - Docker image storage                                     │ │
│  │  - Version history                                          │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  CLOUD BUILD                                                │ │
│  │  - Automated builds from GitHub                             │ │
│  │  - Multi-stage Docker builds                                │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘
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
     │                                │ Find user by email            │
     │                                ├──────────────────────────────▶│
     │                                │ User document                 │
     │                                │◀──────────────────────────────┤
     │                                │ Compare passwords (bcrypt)    │
     │                                │ Generate JWT token            │
     │                                │                               │
     │ { success: true, token, user } │                               │
     │◀───────────────────────────────┤                               │
     │ Store token in localStorage    │                               │
     │                                │                               │
     │ GET /api/farms                 │                               │
     │ Authorization: Bearer <token>  │                               │
     ├───────────────────────────────▶│                               │
     │                                │ Verify JWT (middleware)       │
     │                                │ Query farms                   │
     │                                ├──────────────────────────────▶│
     │                                │ Farm documents                │
     │                                │◀──────────────────────────────┤
     │ { success: true, data: farms } │                               │
     │◀───────────────────────────────┤                               │
```

**Key Components:**
- Client stores JWT in `localStorage` as "token"
- Axios interceptor adds `Authorization: Bearer {token}` header
- Protect middleware verifies JWT and attaches `req.user`
- JWT payload: `{ id: userId, iat: issuedAt, exp: expiresAt }`

### 2. Worker Management Flow (Nested Resource)

Workers are nested under farms: `/api/farms/:farmId/workers`

**Key Design:**
- Nested routes structure
- farmId association for every worker
- Compound index `(id, farmId)` ensures unique worker IDs per farm

### 3. WebRTC Streaming Flow

```
┌─────────────┐        ┌─────────────┐       ┌─────────────┐       ┌─────────┐
│   Camera    │─RTSP──▶│   FFmpeg    │─RTSP─▶│  MediaMTX   │◀WebRTC│ Browser │
│ (Local IP)  │        │   Bridge    │       │  (GCE VM)   │       │ (Client)│
└─────────────┘        └─────────────┘       └─────────────┘       └─────────┘
    H.265/AAC          Transcoding            WebRTC Server        React App
                       H.264/AAC              Port 8889            SharedStream
```

**Flow:**
1. FFmpeg pulls RTSP from camera (local network)
2. Transcodes H.265 → H.264 for browser compatibility
3. Pushes to MediaMTX on GCE VM
4. React app creates WebRTC connection via WHEP
5. MediaMTX streams to browser (~0.5-1.5s latency)
6. Single WebRTC connection shared across multiple video players

## Design Patterns

### MVC-like Pattern (Backend)

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

## Security Architecture

### Authentication Security
- Password hashing: bcrypt with 10 salt rounds
- JWT tokens: Signed with expiration
- Token storage: localStorage (client)
- Token transmission: Authorization header (`Bearer <token>`)

### Authorization
- Middleware protection: `protect` middleware verifies JWT
- User context: `req.user` attached after verification
- Resource ownership: Queries filtered by `owner` field

### API Security
- CORS configured for cross-origin requests
- Mongoose schema validation
- Generic error messages prevent information leakage
- Rate limiting: Not implemented (future)

### Data Security
- Password exclusion: `.select('-password')` in queries
- Environment variables: Secrets in `.env` (not committed)
- Build-time secrets: API keys as Docker build args

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

## API Design Principles

### RESTful Conventions
- GET: Retrieve resources
- POST: Create new resources
- PUT: Update existing resources
- DELETE: Remove resources

### URL Structure
```
/api/{resource}              # Collection endpoint
/api/{resource}/:id          # Single resource endpoint
/api/{resource}/:id/{action} # Sub-resource or action
/api/{parent}/:id/{nested}   # Nested resource
```

### Error Handling
- 400 Bad Request: Validation errors
- 401 Unauthorized: Missing/invalid token
- 404 Not Found: Resource doesn't exist
- 500 Internal Error: Server-side errors

## Scalability Strategy

### Current Limitations
- Single Cloud Run instance (auto-scales to N)
- Single MediaMTX instance (single point of failure)
- No load balancer (Cloud Run handles automatically)
- No caching layer (Redis not implemented)

### Future Enhancements
1. Multiple MediaMTX instances with load balancing
2. Redis caching for sessions and farm data
3. Database sharding across MongoDB instances
4. CDN for static assets
5. Queue system (Bull/BullMQ) for async tasks
