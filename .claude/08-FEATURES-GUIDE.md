# Features Guide

## Table of Contents

1. [Authentication System](#authentication-system)
2. [Farm Management](#farm-management)
3. [Interactive Farm Maps](#interactive-farm-maps)
4. [Worker Management](#worker-management)
5. [CCTV Live Streaming](#cctv-live-streaming)
6. [Device Management](#device-management)
7. [Analytics & Weather](#analytics--weather)

## Authentication System

### Overview
JWT-based authentication with bcrypt password hashing.

### Components

**Frontend Location:** `frontend/src/components/login/`
- `Login.tsx` - Main authentication UI with login/register tabs

**Backend Files:**
- `frontend/src/services/authService.tsx` - Auth API client
- `backend/src/controllers/authController.ts` - Auth business logic
- `backend/src/middleware/auth.ts` - JWT verification middleware
- `backend/src/models/User.ts` - User model with password hashing

### Implementation Details

**Frontend:**
- Toggle between login/register modes
- Form validation for email and password
- Calls appropriate auth service method

**Backend:**
- Pre-save hook hashes passwords with bcrypt
- Login compares hashed passwords
- JWT token generated on successful auth
- Middleware verifies token on protected routes

## Farm Management

### Overview
CRUD operations for farms with GeoJSON boundary support.

### Components

**Location:** `frontend/src/components/farm-management/`
- `FarmManagement.tsx` - Parent component with nested routing
- `components/farm-overview/FarmOverview.tsx` - Farm list and details
- `components/farm-map/FarmMap.tsx` - Interactive map with boundaries

**Backend Files:**
- `frontend/src/services/farmService.tsx` - Farm API client
- `backend/src/controllers/farmController.ts` - Farm CRUD logic
- `backend/src/models/Farm.ts` - Farm model

### Key Features
- Create, read, update, delete farms
- Store farm metadata (name, type, area, operation date)
- GeoJSON polygon boundaries for maps
- Owner association with users

## Interactive Farm Maps

### Overview
Google Maps integration with polygon drawing for farm boundaries.

### Components

**Location:** `frontend/src/components/farm-management/components/farm-map/`
- `FarmMap.tsx` - Main map component
- `polygon/PolygonDrawer.tsx` - Drawing tools (future)

### GeoJSON Format

**Structure:**
- `type`: "Polygon"
- `coordinates`: Array of `[longitude, latitude]` pairs
- First and last points identical (close polygon)

**Stored in MongoDB:**
Farm documents include optional `farmBoundary` field with GeoJSON data.

## Worker Management

### Overview
Full CRUD operations for workers with nested resource pattern under farms.

### Components

**Location:** `frontend/src/components/farm-management/components/worker/`
- `WorkerManagement.tsx` - Worker list with CRUD operations
- `WorkerCard.tsx` - Individual worker display card
- `WorkerForm.tsx` - Create/edit form modal

**Backend Files:**
- `frontend/src/services/workerService.tsx` - Worker API client
- `backend/src/controllers/workerController.ts` - Worker CRUD logic
- `backend/src/models/Worker.ts` - Worker model

### Key Features
1. **Unique Worker IDs per Farm:** Compound index `(id, farmId)`
2. **Status Filtering:** Filter by active/inactive
3. **Search:** Search by name or role
4. **Nested Routes:** `/api/farms/:farmId/workers`

## CCTV Live Streaming

### Overview
Ultra-low latency WebRTC streaming with shared stream architecture.

**Complete details:** See `.claude/WebRTC.md`

### Architecture

```
Camera (RTSP) → FFmpeg (Transcoding) → MediaMTX (WebRTC) → React App
```

### Key Innovation: Shared Stream Provider

**Problem:** Multiple viewers = multiple WebRTC connections = N×bandwidth
**Solution:** Single WebRTC connection shared across all video players

**Benefits:**
- 16× bandwidth reduction (1 connection for 16 cameras)
- Lower server load
- Better browser performance
- Improved scalability

### Components

**Location:** `frontend/src/components/farm-management/components/camera/`
- `FarmCCTV.tsx` - Main CCTV component
- `SharedStreamProvider.tsx` - Context for shared WebRTC connection
- `CameraGridItem.tsx` - Individual camera display
- `SharedVideoPlayer.tsx` - Video player consuming shared stream

## Device Management

### Overview
Management interface for farm devices (sensors and cameras).

### Components

**Location:** `frontend/src/components/devices/`
- `DeviceSettings.tsx` - Parent with nested routing
- `camera/CameraSettings.tsx` - Camera device management
- `sensor/SensorSettings.tsx` - Sensor device management

## Analytics & Weather

### Overview
Farm analytics dashboard with weather forecasting integration.

### Components

**Location:** `frontend/src/components/analytics/`
- `Analytics.tsx` - Parent with nested routing
- `FarmAnalytics.tsx` - Farm performance metrics
- `weather/WeatherAnalytics.tsx` - Weather forecast display

### Weather Feature
Uses external weather API (GoogleWeatherAPI) for 5-day forecasts.

**Key Data:**
- Temperature (high/low)
- Weather conditions
- Precipitation probability
- Wind speed
