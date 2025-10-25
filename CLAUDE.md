# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Cultivo is a full-stack farm management platform enabling farmers to monitor farms with maps and sensors, manage workers, track equipment (sensors/cameras), analyze weather data, and monitor live CCTV feeds via WebRTC.

**Tech Stack:**
- **Frontend:** React 19.1 (TypeScript) + Tailwind CSS + Google Maps
- **Backend:** Express.js + MongoDB (Mongoose) + JWT auth
- **Deployment:** Docker multi-stage build → Google Cloud Run (Asia Southeast 1)

## Development Commands

### Backend (from `/backend`)
```bash
npm run dev        # Start development server with auto-reload (ts-node + nodemon)
npm run build      # Compile TypeScript to dist/
npm start          # Run compiled production build
```

### Frontend (from `/frontend`)
```bash
npm start          # Start development server (port 3000, proxies API to localhost:8080)
npm run build      # Create production build
npm run tailwind   # Watch and compile Tailwind CSS changes
npm test           # Run Jest tests
```

### Full Application
```bash
# Terminal 1 (Backend)
cd backend && npm run dev

# Terminal 2 (Frontend)
cd frontend && npm start

# Terminal 3 (Optional - Tailwind watch)
cd frontend && npm run tailwind
```

### Docker & Deployment
```bash
# Local Docker build (requires build args)
docker build --build-arg REACT_APP_GOOGLE_MAPS_API_KEY=<key> \
  --build-arg MONGODB_URI=<uri> -t cultivo .

# Run container
docker run -p 8080:8080 -e MONGODB_URI=<uri> cultivo

# Deploy to Cloud Run (via Cloud Build)
gcloud builds submit --config cloudbuild.yaml \
  --substitutions _MONGODB_URI=<uri>,_REACT_APP_GOOGLE_MAPS_API_KEY=<key>
```

## Architecture

### Monorepo Structure
```
cultivo-capstone/
├── frontend/       # React SPA (Create React App)
│   ├── src/
│   │   ├── components/      # Feature-based components
│   │   ├── services/        # API client modules
│   │   └── App.tsx          # Router + auth logic
│   └── package.json
├── backend/        # Express API server
│   ├── src/
│   │   ├── models/          # Mongoose schemas
│   │   ├── controllers/     # Business logic
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Auth middleware
│   │   └── index.ts         # Express app setup
│   └── package.json
├── Dockerfile              # Multi-stage build
└── cloudbuild.yaml        # GCP deployment config
```

### API Architecture

**Base URL:** `/api`

**Authentication Flow:**
1. Client calls `POST /api/auth/login` → receives JWT token
2. Token stored in localStorage
3. Axios interceptor adds `Authorization: Bearer {token}` header to all requests
4. Backend `protect` middleware verifies JWT and attaches user to `req.user`

**Key Endpoints:**
- `/api/auth` - login, register, getMe
- `/api/farms` - Farm CRUD + boundary operations (GeoJSON polygons)
- `/api/farms/:farmId/workers` - Worker CRUD (nested under farms)
- `/api/users` - User management

**Response Format:**
```typescript
{
  success: boolean,
  data?: T,
  error?: string
}
```

### Data Models

**User** (`backend/src/models/User.ts`)
- Fields: name, email (unique), password (bcrypt hashed), phone, role, avatarUrl
- Middleware: Auto-hash password on save
- Method: `comparePassword()` for login verification

**Farm** (`backend/src/models/Farm.ts`)
- Fields: name, type, operationDate, areaSize, coordinates, farmBoundary (GeoJSON Polygon), owner (user ID)
- Special: Stores polygon coordinates for interactive map boundaries

**Worker** (`backend/src/models/Worker.ts`)
- Fields: id (unique short string), name, role, email, phone, joinDate, status, farmId (ObjectId reference)
- Indexed: Compound index on (id, farmId) ensures unique worker IDs per farm

### Frontend Architecture

**Component Organization:**
- `components/login/` - Authentication UI
- `components/layout/` - Header, Sidebar, main Layout wrapper
- `components/dashboard/` - Overview with sensor/weather cards
- `components/farm-management/` - Core feature with map, CCTV, workers
- `components/devices/` - Sensor and camera device management
- `components/analytics/` - Farm analytics + weather forecasting
- `components/settings/` - Account and farm configuration

**Service Layer Pattern:**
All API calls abstracted into service modules (`services/*.tsx`):
```typescript
// Example: farmService.tsx
import axios from 'axios';

export const getFarms = async () => {
  const response = await axios.get('/api/farms');
  return response.data;
};
```

**Authentication State:**
- Token stored in `localStorage` as "token"
- `App.tsx` checks token on mount and redirects to `/login` if missing
- `authService.tsx` handles login/register and token management

### Key Features Implementation

**Google Maps Integration:**
- `farm-management/components/farm-map/FarmMap.tsx` - Main map component
- `farm-management/components/farm-map/polygon/` - Drawing tools for farm boundaries
- Uses `@react-google-maps/api` library
- Requires `REACT_APP_GOOGLE_MAPS_API_KEY` env var

**WebRTC CCTV Streaming:**
- `farm-management/components/camera/FarmCCTV.tsx` - Main CCTV view
- `WebRTCPlayer.tsx` - Handles WebRTC connection and playback
- Status indicators and troubleshooting tips included

**Worker Management:**
- Nested resource: `/api/farms/:farmId/workers`
- Full CRUD with status filtering (active/inactive) and search
- Table view with pagination

## Environment Variables

### Frontend (`.env` in `/frontend`)
```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Backend (`.env` in `/backend`)
```env
MONGODB_URI=mongodb://localhost:27017/cultivo  # or Atlas URI
PORT=8080                                       # Optional, defaults to 8080
JWT_SECRET=your_secret_key                      # Optional, has default
```

## Important Patterns & Conventions

### Authentication Middleware
Protected routes use `protect` middleware (`backend/src/middleware/auth.ts`):
```typescript
// In routes:
router.get('/farms', protect, getFarms);

// Middleware attaches user:
req.user // Current authenticated user
```

### Error Handling
- 400: Validation errors
- 401: Authentication failures
- 404: Resource not found
- 500: Server errors
- Always include descriptive error messages in response

### Database Queries
- Use Mongoose methods: `Model.find()`, `Model.findById()`, etc.
- Apply filters via query params (e.g., `?owner=userId`, `?status=active`)
- Populate references where needed (e.g., farm owner)

### Component Conventions
- Use TypeScript for all new components
- Props interfaces named `{ComponentName}Props`
- Prefer functional components with hooks
- Extract reusable logic into custom hooks
- Use Lucide React for icons (`import { IconName } from 'lucide-react'`)

### Styling
- Tailwind CSS utility classes (configured in `tailwind.config.js`)
- Custom CSS in `index.css` (imports Tailwind layers)
- Run `npm run tailwind` in frontend to watch CSS changes
- Generated output: `src/output.css`

## Deployment Architecture

**Multi-Stage Docker Build:**
1. **Stage 1:** Build React app → `/app/frontend/build`
2. **Stage 2:** Compile TypeScript backend → `/app/backend/dist`
3. **Stage 3:** Node.js slim image with:
   - Backend server (`dist/index.js`)
   - Static frontend files served from `/public`
   - Single process serving both API and SPA

**Cloud Run Configuration:**
- Port: 8080 (Cloud Run default)
- Region: asia-southeast1
- Artifact Registry: `asia-southeast1-docker.pkg.dev`
- Build args required: `MONGODB_URI`, `REACT_APP_GOOGLE_MAPS_API_KEY`

**SPA Routing:**
Backend serves `index.html` for all non-API routes (see `backend/src/index.ts:44-46`), enabling client-side routing with React Router.

## Testing

**Frontend:**
- Jest + React Testing Library configured
- Run: `npm test` from `/frontend`
- Test files: `*.test.tsx` or `*.test.ts`

**Backend:**
- No test suite currently configured
- Test script placeholder in `package.json`

## Recent Development Focus

Based on git history:
- WebRTC camera streaming implementation
- Worker management CRUD operations
- UI improvements for worker cards
- Mixed content (HTTPS/HTTP) security fixes
- Pagination features

## Working with the Codebase

**Adding a New API Endpoint:**
1. Define route in `backend/src/routes/{resource}Routes.ts`
2. Implement controller in `backend/src/controllers/{resource}Controller.ts`
3. Add middleware (e.g., `protect`) if authentication required
4. Update frontend service in `frontend/src/services/{resource}Service.tsx`
5. Call service from React component

**Adding a New Component:**
1. Create component in appropriate feature directory (`components/{feature}/`)
2. Define TypeScript interface for props
3. Import and use in parent component or add route in `App.tsx`
4. Use existing services for API calls
5. Apply Tailwind classes for styling

**Modifying Database Schema:**
1. Update Mongoose model in `backend/src/models/{Model}.ts`
2. If changing required fields, ensure controllers handle validation
3. Test with existing data to avoid migration issues
4. Update TypeScript interfaces in frontend if needed
