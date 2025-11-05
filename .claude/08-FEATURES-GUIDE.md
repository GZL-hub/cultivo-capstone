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

---

## Interactive Farm Maps

### Overview

Google Maps integration with polygon drawing for farm boundaries.

### Components

**Location:** `frontend/src/components/farm-management/components/farm-map/`

- `FarmMap.tsx` - Main map component
- `polygon/PolygonDrawer.tsx` - Drawing tools (future)

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

Uses external weather API (GoogleWeatherAPI) for forecasts.
---
