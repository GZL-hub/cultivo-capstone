# Database Models & Schema

## Database Overview

Cultivo uses **MongoDB**, a NoSQL document database, with **Mongoose** as the ODM (Object Document Mapper). The database design follows a denormalized approach optimized for read performance while maintaining referential integrity through ObjectId references.

**Database Name:** `cultivo`

**Connection:** MongoDB Atlas (Cloud) or local MongoDB instance

## Data Modeling Philosophy

### Design Principles

1. **Denormalization**: Embed related data when it's frequently accessed together
2. **References**: Use ObjectId references for relationships that need to be independent
3. **Indexing**: Strategic indexes for query optimization
4. **Validation**: Schema-level validation for data integrity
5. **Timestamps**: Automatic createdAt/updatedAt fields via `{ timestamps: true }`

### Relationship Patterns

```
User (1) ──────► (N) Farm
                  │
                  ├──► (N) Worker
                  ├──► (N) CCTV
                  └──► (N) Sensor (future)
```

---

## User Model

**File:** `backend/src/models/User.ts`

**Purpose:** Store user account information and authentication credentials.

### Schema Definition

```typescript
interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    default: 'User'
  },
  avatarUrl: {
    type: String,
    default: 'https://images.unsplash.com/photo-1758551051834-61f10a361b73?w=150'
  }
}, { timestamps: true });
```

### Field Details

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| `_id` | ObjectId | Auto | Yes | Auto-generated | MongoDB primary key |
| `name` | String | Yes | No | - | User's full name |
| `email` | String | Yes | Yes | - | Email address (lowercase) |
| `password` | String | Yes | No | - | Bcrypt hashed password |
| `phone` | String | No | No | '' | Phone number |
| `role` | String | No | No | 'User' | User role (User/Admin) |
| `avatarUrl` | String | No | No | Unsplash image | Profile avatar URL |
| `createdAt` | Date | Auto | No | Auto | Account creation timestamp |
| `updatedAt` | Date | Auto | No | Auto | Last update timestamp |

### Middleware & Methods

#### Pre-Save Hook (Password Hashing)
**Purpose:** Automatically hash passwords before saving to database

#### Instance Method: comparePassword
**Purpose:** Verify password during login (compares plaintext with hashed)

---

## Farm Model

**File:** `backend/src/models/Farm.ts`

**Purpose:** Store farm information including boundaries and ownership.

### Schema Definition

```typescript
interface IFarm extends Document {
  name: string;
  type: string;
  operationDate: string;
  areaSize: string;
  coordinates?: string;
  farmBoundary?: {
    type: string;
    coordinates: number[][][];
  };
  owner: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FarmSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true
  },
  operationDate: {
    type: String,
    required: true
  },
  areaSize: {
    type: String,
    required: true
  },
  coordinates: {
    type: String,
    required: false
  },
  farmBoundary: {
    type: Schema.Types.Mixed,
    required: false,
    default: undefined
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });
```

### Field Details

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | MongoDB primary key |
| `name` | String | Yes | Farm name |
| `type` | String | Yes | Farm type (Crop Farm, Livestock, Mixed, etc.) |
| `operationDate` | String | Yes | Date farm operations started |
| `areaSize` | String | Yes | Farm area (e.g., "50 hectares") |
| `coordinates` | String | No | Center coordinates (lat, lng) |
| `farmBoundary` | Object | No | GeoJSON Polygon for farm boundary |
| `owner` | ObjectId | Yes | Reference to User document |
| `createdAt` | Date | Auto | Farm creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

### Farm Boundary (GeoJSON)

The `farmBoundary` field stores **GeoJSON Polygon** data for drawing farm boundaries on maps.

**Structure:**
**Example:**

```json
{
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
```

**Important Notes:**
- Coordinates are [longitude, latitude] (NOT [lat, lng])
- First and last points must be identical to close the polygon
- Minimum 4 points (3 unique + 1 closing point)
- Coordinates must follow right-hand rule for exterior rings

### Indexes
### Example Document

```json
{
  "_id": ObjectId("60f7b3b3b3b3b3b3b3b3b3b4"),
  "name": "Green Valley Farm",
  "type": "Crop Farm",
  "operationDate": "2020-05-15",
  "areaSize": "50 hectares",
  "coordinates": "12.9716, 77.5946",
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
  "owner": ObjectId("60f7b3b3b3b3b3b3b3b3b3b3"),
  "createdAt": ISODate("2023-10-01T12:00:00.000Z"),
  "updatedAt": ISODate("2023-10-15T14:30:00.000Z")
}
```

---

## Worker Model

**File:** `backend/src/models/Worker.ts`

**Purpose:** Store worker information associated with specific farms.

### Schema Definition

```typescript
interface IWorker extends Document {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  joinDate?: string;
  status?: 'active' | 'inactive';
  farmId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WorkerSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  email: {
    type: String,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String
  },
  joinDate: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true
  }
}, { timestamps: true });
```

### Field Details

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | MongoDB primary key |
| `id` | String | Yes | Custom worker ID (e.g., "W001") |
| `name` | String | Yes | Worker's full name |
| `role` | String | Yes | Job role (Farm Manager, Field Worker, etc.) |
| `email` | String | No | Email address (validated format) |
| `phone` | String | No | Phone number |
| `joinDate` | String | No | Date worker joined |
| `status` | Enum | No | "active" or "inactive" (default: "active") |
| `farmId` | ObjectId | Yes | Reference to Farm document |
| `createdAt` | Date | Auto | Record creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

### Unique Constraint

**Compound Index** ensures worker IDs are unique **per farm**:
**Why:** Different farms can have workers with the same ID (e.g., "W001"), but within a single farm, worker IDs must be unique.

**Example:**
- Farm A: Worker with id="W001" ✅
- Farm B: Worker with id="W001" ✅
- Farm A: Another worker with id="W001" ❌ (Duplicate)

**Behavior:** Mongoose validates email format on save. Invalid emails are rejected.
### Example Document

```json
{
  "_id": ObjectId("60f7b3b3b3b3b3b3b3b3b3b7"),
  "id": "W001",
  "name": "John Smith",
  "role": "Farm Manager",
  "email": "john.smith@example.com",
  "phone": "+1234567890",
  "joinDate": "2023-01-15",
  "status": "active",
  "farmId": ObjectId("60f7b3b3b3b3b3b3b3b3b3b4"),
  "createdAt": ISODate("2023-01-15T10:00:00.000Z"),
  "updatedAt": ISODate("2023-10-01T12:00:00.000Z")
}
```

---

## CCTV Model

**File:** `backend/src/models/CCTV.ts`

**Purpose:** Store CCTV camera information and streaming URLs.

### Schema Definition

```typescript
interface ICCTV extends Document {
  name: string;
  status: 'online' | 'offline';
  type: string;
  streamUrl: string;
  farmId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CCTVSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['online', 'offline'],
    default: 'offline'
  },
  type: {
    type: String,
    required: true
  },
  streamUrl: {
    type: String,
    required: true
  },
  farmId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farm',
    required: true
  }
}, { timestamps: true });
```

### Field Details

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Auto | MongoDB primary key |
| `name` | String | Yes | Camera name (e.g., "Front Gate Camera") |
| `status` | Enum | No | "online" or "offline" (default: "offline") |
| `type` | String | Yes | Camera type (PTZ, Fixed, Dome, etc.) |
| `streamUrl` | String | Yes | WebRTC stream URL (WHEP endpoint) |
| `farmId` | ObjectId | Yes | Reference to Farm document |
| `createdAt` | Date | Auto | Record creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

### Stream URL Format

**Example:**
```
https://136.110.0.27:8889/livefeed/whep
```

**Components:**
- **Protocol:** HTTPS (required for WebRTC in production)
- **Host:** MediaMTX server IP or domain
- **Port:** 8889 (WebRTC port)
- **Path:** `/livefeed` (stream path name)
- **Protocol:** `/whep` (WebRTC HTTP Egress Protocol)

### Example Document

```json
{
  "_id": ObjectId("60f7b3b3b3b3b3b3b3b3b3ba"),
  "name": "Front Gate Camera",
  "status": "online",
  "type": "PTZ",
  "streamUrl": "https://136.110.0.27:8889/livefeed/whep",
  "farmId": ObjectId("60f7b3b3b3b3b3b3b3b3b3b4"),
  "createdAt": ISODate("2023-10-01T12:00:00.000Z"),
  "updatedAt": ISODate("2023-10-20T16:00:00.000Z")
}
```

---

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

**Populate User in Farm Query:**

```typescript
const farm = await Farm.findById(farmId).populate('owner', 'name email');

// Result
{
  _id: "60f7b3b3b3b3b3b3b3b3b3b4",
  name: "Green Valley Farm",
  owner: {
    _id: "60f7b3b3b3b3b3b3b3b3b3b3",
    name: "John Doe",
    email: "john.doe@example.com"
  }
}
```
---

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

```typescript
// Example: Custom validator for phone number
phone: {
  type: String,
  validate: {
    validator: function(v: string) {
      return /^\+?[\d\s-()]+$/.test(v);
    },
    message: (props: any) => `${props.value} is not a valid phone number!`
  }
}
```

---

## Query Patterns

### Common Queries

**Get all farms for a user:**

```typescript
const farms = await Farm.find({ owner: userId }).sort({ createdAt: -1 });
```

**Get active workers for a farm:**

```typescript
const workers = await Worker.find({ farmId: farmId, status: 'active' });
```

**Search workers by name:**

```typescript
const workers = await Worker.find({
  farmId: farmId,
  name: { $regex: searchTerm, $options: 'i' }  // Case-insensitive search
});
```

**Get online CCTVs for a farm:**

```typescript
const cameras = await CCTV.find({ farmId: farmId, status: 'online' });
```

---
## Next Steps

- **[Deployment Guide](./07-DEPLOYMENT.md)** - Production deployment
- **[Development Workflow](./09-DEVELOPMENT-WORKFLOW.md)** - Git workflow and testing
