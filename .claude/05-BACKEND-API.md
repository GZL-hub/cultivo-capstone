# Backend API Reference

## API Overview

RESTful API built with Express.js and TypeScript following standard patterns for requests, responses, and error handling.

**Base URL:**
- Development: `http://localhost:8080/api`
- Production: `https://your-cloud-run-url.run.app/api`

**Content-Type:** `application/json`
**Authentication:** JWT Bearer Token (except auth endpoints)

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "message": "Optional details"
}
```

## HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| **200** | OK | Successful GET, PUT, DELETE |
| **201** | Created | Successful POST (resource created) |
| **400** | Bad Request | Invalid input, validation errors |
| **401** | Unauthorized | Missing/invalid auth token |
| **404** | Not Found | Resource not found |
| **409** | Conflict | Duplicate resource |
| **500** | Internal Server Error | Server-side errors |

## Authentication

### JWT Token Format
```
Authorization: Bearer <jwt_token>
```

**Token Payload:**
- `id`: User ID
- `iat`: Issued at (Unix timestamp)
- `exp`: Expires at (Unix timestamp)

**Token Expiration:** 30 days (configurable)

## Authentication Endpoints

### POST /api/auth/register
Create new user account.

**Authentication:** Not required

**Request Body:**
- `name`: Required, min 2 characters
- `email`: Required, valid email format, must be unique
- `password`: Required, min 6 characters

**Response (201):** Returns user object and JWT token

### POST /api/auth/login
Authenticate user and receive JWT token.

**Authentication:** Not required

**Request Body:**
- `email`: Required
- `password`: Required

**Response (200):** Returns user object and JWT token

### GET /api/auth/me
Get current authenticated user's profile.

**Authentication:** Required

**Response (200):** Returns user object (password excluded)

## Farm Endpoints

### GET /api/farms
Retrieve all farms (optionally filtered by owner).

**Query Parameters:**
- `owner`: Filter by owner user ID (optional)

### GET /api/farms/:id
Retrieve single farm by ID.

### POST /api/farms
Create new farm.

**Request Body:**
- `name`: Required
- `type`: Required
- `operationDate`: Required (date string)
- `areaSize`: Required
- `owner`: Required (valid user ObjectId)
- `coordinates`: Optional
- `farmBoundary`: Optional (GeoJSON polygon)

### PUT /api/farms/:id
Update existing farm (partial update supported).

### DELETE /api/farms/:id
Delete farm.

### GET /api/farms/:id/boundary
Retrieve farm boundary (GeoJSON polygon).

### PUT /api/farms/:id/boundary
Update farm boundary with GeoJSON polygon.

**Request Body:**
- `farmBoundary`: GeoJSON object with `type: "Polygon"` and `coordinates` array

**GeoJSON Format:**
- Coordinates: `[longitude, latitude]` format
- First and last points must be identical (close polygon)
- Minimum 4 points (3 unique + 1 closing)

## Worker Endpoints (Nested Resource)

Workers nested under farms: `/api/farms/:farmId/workers`

### GET /api/farms/:farmId/workers
Retrieve all workers for specific farm.

**Query Parameters:**
- `status`: Filter by "active" or "inactive" (optional)
- `search`: Search by name or role (optional)

### GET /api/farms/:farmId/workers/:workerId
Retrieve single worker by ID.

### POST /api/farms/:farmId/workers
Create new worker for farm.

**Request Body:**
- `id`: Required, unique per farm (compound index)
- `name`: Required
- `role`: Required
- `email`: Optional, valid email format
- `phone`: Optional
- `joinDate`: Optional (date string)
- `status`: Optional, defaults to "active"

**Validation:**
- Worker IDs must be unique per farm (not globally)
- Compound index: `(id, farmId)`

### PUT /api/farms/:farmId/workers/:workerId
Update existing worker (partial update supported).

### DELETE /api/farms/:farmId/workers/:workerId
Delete worker.

## CCTV Endpoints (Nested Resource)

### GET /api/farms/:farmId/cctvs
Retrieve all CCTV cameras for specific farm.

**Response:** Array of CCTV objects with:
- `name`: Camera name
- `status`: "online" or "offline"
- `type`: Camera type (PTZ, Fixed, Dome, etc.)
- `streamUrl`: WebRTC WHEP endpoint URL
- `farmId`: Reference to parent farm

**Stream URL Format:**
```
https://136.110.0.27:8889/livefeed/whep
```

Components:
- Protocol: HTTPS (required for WebRTC)
- Host: MediaMTX server IP/domain
- Port: 8889 (WebRTC port)
- Path: `/livefeed` (stream name)
- Protocol: `/whep` (WebRTC HTTP Egress Protocol)

## User Management Endpoints

### GET /api/users
Retrieve all users (admin only - future).

**Authentication:** Required

### GET /api/users/:id
Get user by ID.

**Authentication:** Required

### PUT /api/users/:id
Update user profile.

**Authentication:** Required

**Request Body:**
- `name`: Optional
- `phone`: Optional
- `avatarUrl`: Optional
