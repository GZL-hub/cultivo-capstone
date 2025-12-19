# Database Models & Schema

## Database Overview

MongoDB NoSQL database with Mongoose ODM. Denormalized design optimized for read performance with ObjectId references for relationships.

**Database Name:** `cultivo`
**Connection:** MongoDB Atlas (Cloud) or local MongoDB instance

## Data Modeling Philosophy

### Design Principles
1. Denormalization for frequently accessed data
2. ObjectId references for independent relationships
3. Strategic indexing for query optimization
4. Schema-level validation for data integrity
5. Automatic timestamps via `{ timestamps: true }`

### Relationship Patterns

```
User (1) ──────► (N) Farm
                  │
                  ├──► (N) Worker
                  ├──► (N) CCTV
                  └──► (N) Sensor (future)
```

## User Model

**File:** `backend/src/models/User.ts`

**Purpose:** Store user account information and authentication credentials.

### Schema Fields

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| `_id` | ObjectId | Auto | Yes | Auto | MongoDB primary key |
| `name` | String | Yes | No | - | User's full name |
| `email` | String | Yes | Yes | - | Email (lowercase) |
| `password` | String | Yes | No | - | Bcrypt hashed password |
| `phone` | String | No | No | '' | Phone number |
| `role` | String | No | No | 'User' | User role (User/Admin) |
| `avatarUrl` | String | No | No | Unsplash image | Profile avatar URL |
| `createdAt` | Date | Auto | No | Auto | Account creation timestamp |
| `updatedAt` | Date | Auto | No | Auto | Last update timestamp |

### Methods & Middleware
- **Pre-Save Hook:** Automatically hashes passwords with bcrypt (10 salt rounds)
- **comparePassword Method:** Verifies password during login

## Farm Model

**File:** `backend/src/models/Farm.ts`

**Purpose:** Store farm information including boundaries and ownership.

### Schema Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | MongoDB primary key |
| `name` | String | Yes | Farm name |
| `type` | String | Yes | Farm type (Crop Farm, Livestock, Mixed) |
| `operationDate` | String | Yes | Operations start date |
| `areaSize` | String | Yes | Farm area (e.g., "50 hectares") |
| `coordinates` | String | No | Center coordinates (lat, lng) |
| `farmBoundary` | Object | No | GeoJSON Polygon for boundary |
| `owner` | ObjectId | Yes | Reference to User document |
| `createdAt` | Date | Auto | Farm creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

### Farm Boundary (GeoJSON)

**Structure:**
- `type`: Must be "Polygon"
- `coordinates`: Array of linear rings (first is exterior, others are holes)
- Each ring: Array of `[longitude, latitude]` pairs
- First and last coordinates must be identical (close polygon)

**Important Notes:**
- Coordinates are `[longitude, latitude]` (NOT `[lat, lng]`)
- Minimum 4 points (3 unique + 1 closing point)
- Follow right-hand rule for exterior rings

## Worker Model

**File:** `backend/src/models/Worker.ts`

**Purpose:** Store worker information associated with specific farms.

### Schema Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | MongoDB primary key |
| `id` | String | Yes | Custom worker ID (e.g., "W001") |
| `name` | String | Yes | Worker's full name |
| `role` | String | Yes | Job role |
| `email` | String | No | Email (validated format) |
| `phone` | String | No | Phone number |
| `joinDate` | String | No | Date worker joined |
| `status` | Enum | No | "active" or "inactive" (default: "active") |
| `farmId` | ObjectId | Yes | Reference to Farm document |
| `createdAt` | Date | Auto | Record creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

### Unique Constraint

**Compound Index:** `(id, farmId)` ensures worker IDs are unique per farm (not globally).

**Behavior:**
- Farm A: Worker "W001" ✅
- Farm B: Worker "W001" ✅
- Farm A: Another "W001" ❌ (Duplicate)

### Email Validation
Mongoose validates email format on save using regex pattern. Invalid emails are rejected.

## CCTV Model

**File:** `backend/src/models/CCTV.ts`

**Purpose:** Store CCTV camera information and streaming URLs.

### Schema Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | MongoDB primary key |
| `name` | String | Yes | Camera name (e.g., "Front Gate Camera") |
| `status` | Enum | No | "online" or "offline" (default: "offline") |
| `type` | String | Yes | Camera type (PTZ, Fixed, Dome) |
| `streamUrl` | String | Yes | WebRTC stream URL (WHEP endpoint) |
| `farmId` | ObjectId | Yes | Reference to Farm document |
| `createdAt` | Date | Auto | Record creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

### Stream URL Format

Example: `https://136.110.0.27:8889/livefeed/whep`

**Components:**
- Protocol: HTTPS (required for WebRTC in production)
- Host: MediaMTX server IP or domain
- Port: 8889 (WebRTC port)
- Path: `/livefeed` (stream path name)
- Protocol: `/whep` (WebRTC HTTP Egress Protocol)

## Relationships & Referential Integrity

### Entity Relationship Diagram

```
┌─────────────────┐
│      User       │
│  _id (PK)       │
│  email (UNIQUE) │
└────────┬────────┘
         │
         │ 1:N (owner)
         │
         ▼
┌─────────────────┐
│      Farm       │
│  _id (PK)       │
│  owner (FK)     │◄─── References User._id
└────────┬────────┘
         │
         ├────────────────────┬────────────────────┐
         │ 1:N                │ 1:N                │ 1:N
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│     Worker      │  │      CCTV       │  │     Sensor      │
│  _id (PK)       │  │  _id (PK)       │  │  _id (PK)       │
│  id (UNIQUE)    │  │  name           │  │  (Future)       │
│  farmId (FK)    │◄──  farmId (FK)    │◄──                │
│                 │  └─────────────────┘  └─────────────────┘
│  UNIQUE INDEX:  │
│  (id, farmId)   │
└─────────────────┘
```

### Mongoose Population

Populate user reference in farm query:
- Populates `owner` field with user document
- Can select specific fields: `.populate('owner', 'name email')`
- Result includes nested user object instead of just ObjectId

## Data Validation

### Mongoose Validation Rules

**Built-in Validators:**
- `required: true` - Field must be present
- `unique: true` - Field value must be unique
- `enum: [values]` - Field must match one of the values
- `match: regex` - Field must match regex pattern
- `min/max` - Numeric range validation
- `minlength/maxlength` - String length validation

**Custom Validators:**
Can define custom validation functions with custom error messages.

## Query Patterns

### Common Queries

**Get all farms for user:**
- Query by owner field
- Sort by creation date

**Get active workers for farm:**
- Filter by farmId and status

**Search workers by name:**
- Case-insensitive regex search on name field

**Get online CCTVs for farm:**
- Filter by farmId and online status
