# Backend API Reference

## API Overview

The Cultivo backend provides a RESTful API built with Express.js and TypeScript. All endpoints follow consistent patterns for requests, responses, and error handling.

**Base URL:**
- Development: `http://localhost:8080/api`
- Production: `https://your-cloud-run-url.run.app/api`

**Content-Type:** `application/json`

**Authentication:** JWT Bearer Token (except auth endpoints)

## Response Format

All API responses follow this standardized structure:

```typescript
interface ApiResponse<T> {
  success: boolean;      // Indicates request success/failure
  data?: T;             // Response payload (on success)
  error?: string;       // Error message (on failure)
  message?: string;     // Additional context message
}
```

### Success Response Example

```json
{
  "success": true,
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "Green Valley Farm",
    "type": "Crop Farm"
  },
  "message": "Farm retrieved successfully"
}
```

### Error Response Example

```json
{
  "success": false,
  "error": "Farm not found",
  "message": "No farm found with ID: 60f7b3b3b3b3b3b3b3b3b3b3"
}
```

## HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| **200** | OK | Successful GET, PUT, DELETE requests |
| **201** | Created | Successful POST requests (resource created) |
| **400** | Bad Request | Invalid input data, validation errors |
| **401** | Unauthorized | Missing or invalid authentication token |
| **404** | Not Found | Resource not found |
| **409** | Conflict | Duplicate resource (e.g., email already exists) |
| **500** | Internal Server Error | Server-side errors |

## Authentication

### Overview

Cultivo uses **JWT (JSON Web Token)** for stateless authentication. Tokens are issued upon login/registration and must be included in the `Authorization` header for protected routes.

### JWT Token Format

```
Authorization: Bearer <jwt_token>
```

**Token Payload:**

```json
{
  "id": "60f7b3b3b3b3b3b3b3b3b3b3",  // User ID
  "iat": 1626768000,                  // Issued at (Unix timestamp)
  "exp": 1629360000                   // Expires at (Unix timestamp)
}
```

**Token Expiration:** 30 days (configurable in backend)

---

## Authentication Endpoints

### POST /api/auth/register

Create a new user account.

**Authentication:** Not required

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123"
}
```

**Validation Rules:**
- `name`: Required, min 2 characters
- `email`: Required, valid email format, must be unique
- `password`: Required, min 6 characters

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "User",
      "avatarUrl": "https://images.unsplash.com/photo-1758551051834-61f10a361b73?w=150",
      "createdAt": "2023-10-01T12:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

**Error Responses:**

```json
// 400 - Validation Error
{
  "success": false,
  "error": "Please provide all required fields"
}

// 409 - Duplicate Email
{
  "success": false,
  "error": "Email already exists"
}
```

---

### POST /api/auth/login

Authenticate user and receive JWT token.

**Authentication:** Not required

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "User",
      "avatarUrl": "https://images.unsplash.com/photo-1758551051834-61f10a361b73?w=150"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

**Error Responses:**

```json
// 400 - Missing Credentials
{
  "success": false,
  "error": "Please provide email and password"
}

// 401 - Invalid Credentials
{
  "success": false,
  "error": "Invalid email or password"
}
```

---

### GET /api/auth/me

Get current authenticated user's profile.

**Authentication:** Required

**Request Headers:**

```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "role": "User",
    "avatarUrl": "https://images.unsplash.com/photo-1758551051834-61f10a361b73?w=150",
    "createdAt": "2023-10-01T12:00:00.000Z",
    "updatedAt": "2023-10-15T14:30:00.000Z"
  }
}
```

**Error Response (401):**

```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

---

## Farm Endpoints

### GET /api/farms

Retrieve all farms (optionally filtered by owner).

**Authentication:** Not currently required (TODO: Add protection)

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `owner` | string | No | Filter farms by owner user ID |

**Example Requests:**

```bash
# Get all farms
GET /api/farms

# Get farms for specific owner
GET /api/farms?owner=60f7b3b3b3b3b3b3b3b3b3b3
```

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
      "name": "Green Valley Farm",
      "type": "Crop Farm",
      "operationDate": "2020-05-15",
      "areaSize": "50 hectares",
      "coordinates": "12.9716, 77.5946",
      "owner": "60f7b3b3b3b3b3b3b3b3b3b3",
      "createdAt": "2023-10-01T12:00:00.000Z",
      "updatedAt": "2023-10-01T12:00:00.000Z"
    },
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b5",
      "name": "Sunrise Livestock Ranch",
      "type": "Livestock",
      "operationDate": "2019-03-20",
      "areaSize": "120 hectares",
      "farmBoundary": {
        "type": "Polygon",
        "coordinates": [
          [
            [77.5946, 12.9716],
            [77.5956, 12.9716],
            [77.5956, 12.9726],
            [77.5946, 12.9726],
            [77.5946, 12.9716]
          ]
        ]
      },
      "owner": "60f7b3b3b3b3b3b3b3b3b3b3",
      "createdAt": "2023-09-20T10:00:00.000Z",
      "updatedAt": "2023-10-10T15:30:00.000Z"
    }
  ]
}
```

---

### GET /api/farms/:id

Retrieve a single farm by ID.

**Authentication:** Not currently required

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | MongoDB ObjectId of the farm |

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
    "name": "Green Valley Farm",
    "type": "Crop Farm",
    "operationDate": "2020-05-15",
    "areaSize": "50 hectares",
    "coordinates": "12.9716, 77.5946",
    "owner": "60f7b3b3b3b3b3b3b3b3b3b3",
    "createdAt": "2023-10-01T12:00:00.000Z",
    "updatedAt": "2023-10-01T12:00:00.000Z"
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "error": "Farm not found"
}
```

---

### POST /api/farms

Create a new farm.

**Authentication:** Not currently required

**Request Body:**

```json
{
  "name": "Mountain View Farm",
  "type": "Mixed Farming",
  "operationDate": "2023-10-20",
  "areaSize": "75 hectares",
  "coordinates": "13.0827, 80.2707",
  "owner": "60f7b3b3b3b3b3b3b3b3b3b3"
}
```

**Validation Rules:**
- `name`: Required
- `type`: Required
- `operationDate`: Required (date string)
- `areaSize`: Required
- `owner`: Required (valid user ObjectId)

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b6",
    "name": "Mountain View Farm",
    "type": "Mixed Farming",
    "operationDate": "2023-10-20",
    "areaSize": "75 hectares",
    "coordinates": "13.0827, 80.2707",
    "owner": "60f7b3b3b3b3b3b3b3b3b3b3",
    "createdAt": "2023-10-20T12:00:00.000Z",
    "updatedAt": "2023-10-20T12:00:00.000Z"
  },
  "message": "Farm created successfully"
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": "Please provide all required fields"
}
```

---

### PUT /api/farms/:id

Update an existing farm.

**Authentication:** Not currently required

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | MongoDB ObjectId of the farm |

**Request Body:** (Partial update supported)

```json
{
  "name": "Updated Farm Name",
  "areaSize": "80 hectares"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
    "name": "Updated Farm Name",
    "type": "Crop Farm",
    "operationDate": "2020-05-15",
    "areaSize": "80 hectares",
    "coordinates": "12.9716, 77.5946",
    "owner": "60f7b3b3b3b3b3b3b3b3b3b3",
    "createdAt": "2023-10-01T12:00:00.000Z",
    "updatedAt": "2023-10-20T16:45:00.000Z"
  },
  "message": "Farm updated successfully"
}
```

---

### DELETE /api/farms/:id

Delete a farm.

**Authentication:** Not currently required

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | MongoDB ObjectId of the farm |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Farm deleted successfully"
}
```

**Error Response (404):**

```json
{
  "success": false,
  "error": "Farm not found"
}
```

---

### GET /api/farms/:id/boundary

Retrieve farm boundary (GeoJSON polygon).

**Authentication:** Not required

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "farmBoundary": {
      "type": "Polygon",
      "coordinates": [
        [
          [77.5946, 12.9716],
          [77.5956, 12.9716],
          [77.5956, 12.9726],
          [77.5946, 12.9726],
          [77.5946, 12.9716]
        ]
      ]
    }
  }
}
```

---

### PUT /api/farms/:id/boundary

Update farm boundary with GeoJSON polygon.

**Authentication:** Not required

**Request Body:**

```json
{
  "farmBoundary": {
    "type": "Polygon",
    "coordinates": [
      [
        [77.5946, 12.9716],
        [77.5956, 12.9716],
        [77.5956, 12.9726],
        [77.5946, 12.9726],
        [77.5946, 12.9716]
      ]
    ]
  }
}
```

**GeoJSON Format:**
- `type`: Must be "Polygon"
- `coordinates`: Array of linear rings (first ring is exterior, others are holes)
- Each ring: Array of [longitude, latitude] pairs
- First and last coordinates must be identical (close the polygon)

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
    "name": "Green Valley Farm",
    "farmBoundary": {
      "type": "Polygon",
      "coordinates": [...]
    },
    "updatedAt": "2023-10-20T16:45:00.000Z"
  },
  "message": "Farm boundary updated successfully"
}
```

---

## Worker Endpoints (Nested Resource)

Workers are **nested under farms** with routes: `/api/farms/:farmId/workers`

### GET /api/farms/:farmId/workers

Retrieve all workers for a specific farm.

**Authentication:** Not required

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `farmId` | string | Yes | MongoDB ObjectId of the farm |

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by status: "active" or "inactive" |
| `search` | string | No | Search by worker name or role |

**Example Requests:**

```bash
# Get all workers for a farm
GET /api/farms/60f7b3b3b3b3b3b3b3b3b3b4/workers

# Get active workers only
GET /api/farms/60f7b3b3b3b3b3b3b3b3b3b4/workers?status=active

# Search workers by name
GET /api/farms/60f7b3b3b3b3b3b3b3b3b3b4/workers?search=John
```

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b7",
      "id": "W001",
      "name": "John Smith",
      "role": "Farm Manager",
      "email": "john.smith@example.com",
      "phone": "+1234567890",
      "joinDate": "2023-01-15",
      "status": "active",
      "farmId": "60f7b3b3b3b3b3b3b3b3b3b4",
      "createdAt": "2023-01-15T10:00:00.000Z",
      "updatedAt": "2023-10-01T12:00:00.000Z"
    },
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b8",
      "id": "W002",
      "name": "Jane Doe",
      "role": "Field Worker",
      "status": "active",
      "farmId": "60f7b3b3b3b3b3b3b3b3b3b4",
      "createdAt": "2023-03-20T14:30:00.000Z",
      "updatedAt": "2023-10-15T09:15:00.000Z"
    }
  ]
}
```

---

### GET /api/farms/:farmId/workers/:workerId

Retrieve a single worker by ID.

**Authentication:** Not required

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `farmId` | string | Yes | MongoDB ObjectId of the farm |
| `workerId` | string | Yes | MongoDB ObjectId of the worker |

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b7",
    "id": "W001",
    "name": "John Smith",
    "role": "Farm Manager",
    "email": "john.smith@example.com",
    "phone": "+1234567890",
    "joinDate": "2023-01-15",
    "status": "active",
    "farmId": "60f7b3b3b3b3b3b3b3b3b3b4"
  }
}
```

---

### POST /api/farms/:farmId/workers

Create a new worker for a specific farm.

**Authentication:** Not required

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `farmId` | string | Yes | MongoDB ObjectId of the farm |

**Request Body:**

```json
{
  "id": "W003",
  "name": "Alice Johnson",
  "role": "Equipment Operator",
  "email": "alice.johnson@example.com",
  "phone": "+9876543210",
  "joinDate": "2023-10-20",
  "status": "active"
}
```

**Validation Rules:**
- `id`: Required, must be unique per farm (compound index)
- `name`: Required
- `role`: Required
- `email`: Optional, must be valid email format
- `phone`: Optional
- `joinDate`: Optional (date string)
- `status`: Optional, defaults to "active"

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b9",
    "id": "W003",
    "name": "Alice Johnson",
    "role": "Equipment Operator",
    "email": "alice.johnson@example.com",
    "phone": "+9876543210",
    "joinDate": "2023-10-20",
    "status": "active",
    "farmId": "60f7b3b3b3b3b3b3b3b3b3b4",
    "createdAt": "2023-10-20T12:00:00.000Z",
    "updatedAt": "2023-10-20T12:00:00.000Z"
  },
  "message": "Worker created successfully"
}
```

**Error Responses:**

```json
// 400 - Missing Required Fields
{
  "success": false,
  "error": "Please provide worker id, name, and role"
}

// 409 - Duplicate Worker ID
{
  "success": false,
  "error": "Worker with ID W003 already exists for this farm"
}
```

---

### PUT /api/farms/:farmId/workers/:workerId

Update an existing worker.

**Authentication:** Not required

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `farmId` | string | Yes | MongoDB ObjectId of the farm |
| `workerId` | string | Yes | MongoDB ObjectId of the worker |

**Request Body:** (Partial update supported)

```json
{
  "role": "Senior Equipment Operator",
  "status": "inactive"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b9",
    "id": "W003",
    "name": "Alice Johnson",
    "role": "Senior Equipment Operator",
    "email": "alice.johnson@example.com",
    "phone": "+9876543210",
    "joinDate": "2023-10-20",
    "status": "inactive",
    "farmId": "60f7b3b3b3b3b3b3b3b3b3b4",
    "updatedAt": "2023-11-05T14:30:00.000Z"
  },
  "message": "Worker updated successfully"
}
```

---

### DELETE /api/farms/:farmId/workers/:workerId

Delete a worker.

**Authentication:** Not required

**URL Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `farmId` | string | Yes | MongoDB ObjectId of the farm |
| `workerId` | string | Yes | MongoDB ObjectId of the worker |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Worker deleted successfully"
}
```

**Error Response (404):**

```json
{
  "success": false,
  "error": "Worker not found"
}
```

---

## CCTV Endpoints (Nested Resource)

### GET /api/farms/:farmId/cctvs

Retrieve all CCTV cameras for a specific farm.

**Authentication:** Not required

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3ba",
      "name": "Front Gate Camera",
      "status": "online",
      "type": "PTZ",
      "streamUrl": "https://136.110.0.27:8889/livefeed/whep",
      "farmId": "60f7b3b3b3b3b3b3b3b3b3b4",
      "createdAt": "2023-10-01T12:00:00.000Z",
      "updatedAt": "2023-10-20T16:00:00.000Z"
    }
  ]
}
```

---

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

```json
{
  "name": "Updated Name",
  "phone": "+1234567890",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

---

## Error Handling

### Common Error Responses

**401 Unauthorized:**

```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

**404 Not Found:**

```json
{
  "success": false,
  "error": "Resource not found"
}
```

**500 Internal Server Error:**

```json
{
  "success": false,
  "error": "Server error",
  "message": "An unexpected error occurred"
}
```

## Testing the API

### Using cURL

```bash
# Register a new user
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get farms (with token)
curl -X GET http://localhost:8080/api/farms \
  -H "Authorization: Bearer <your_token_here>"
```

### Using Postman

1. Create a new request
2. Set method and URL
3. Add `Authorization` header for protected routes
4. Add request body (JSON) for POST/PUT requests
5. Send request and inspect response

## Next Steps

- **[Database Models](./06-DATABASE-MODELS.md)** - Detailed schema documentation
- **[Deployment](./07-DEPLOYMENT.md)** - Production deployment guide
