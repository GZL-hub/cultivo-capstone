# CLAUDE.md - Quick Reference Guide

**Cultivo**: Full-stack farm management platform with WebRTC CCTV, Google Maps, worker management, and analytics.

## Tech Stack
- **Frontend:** React 19.1 (TypeScript) + Tailwind CSS + Google Maps
- **Backend:** Express.js + MongoDB (Mongoose) + JWT auth
- **Deployment:** Docker → Google Cloud Run (Asia Southeast 1)
- **Streaming:** MediaMTX (WebRTC) + FFmpeg on GCE VM

## Quick Start
```bash
# Backend (Terminal 1)
cd backend && npm run dev

# Frontend (Terminal 2)
cd frontend && npm start

# Tailwind (Terminal 3 - optional)
cd frontend && npm run tailwind
```

## Monorepo Structure
```
frontend/       # React SPA
  ├── components/   # Feature-based: login, dashboard, farm-management, etc.
  ├── services/     # API clients (farmService, authService, etc.)
  └── App.tsx       # Router + auth logic

backend/        # Express API
  ├── models/       # Mongoose schemas (User, Farm, Worker, CCTV)
  ├── controllers/  # Business logic
  ├── routes/       # API endpoints
  └── middleware/   # Auth (protect middleware)
```

## Key Patterns
- **Auth:** JWT in localStorage → Axios interceptor → `protect` middleware → `req.user`
- **API Base:** `/api` → Standard response: `{ success, data?, error? }`
- **Services:** All API calls go through `services/*.tsx` (never direct axios in components)
- **Nested Routes:** Workers live under farms: `/api/farms/:farmId/workers`
- **GeoJSON:** Farm boundaries stored as polygons for Google Maps
- **WebRTC:** Shared stream provider (1 connection for 16 cameras)

## Key Files
- Backend entry: `backend/src/index.ts`
- Frontend entry: `frontend/src/App.tsx`
- Auth middleware: `backend/src/middleware/auth.ts`
- WebRTC components: `frontend/src/components/farm-management/components/camera/`

## Environment Variables
```bash
# frontend/.env
REACT_APP_GOOGLE_MAPS_API_KEY=your_key

# backend/.env
MONGODB_URI=mongodb://localhost:27017/cultivo
PORT=8080
JWT_SECRET=your_secret
```

## Development Guidelines
- **TypeScript:** All new code (Props interfaces: `{Component}Props`)
- **Styling:** Tailwind utility classes only
- **Icons:** Lucide React (`import { IconName } from 'lucide-react'`)
- **Components:** Functional with hooks, feature-based organization
- **Error Handling:** 400 (validation), 401 (auth), 404 (not found), 500 (server)

## Detailed Documentation

For comprehensive information, refer to these docs in `.claude/`:

1. **[01-PROJECT-OVERVIEW.md](./01-PROJECT-OVERVIEW.md)** - Project vision, tech stack, features, architecture
2. **[02-GETTING-STARTED.md](./02-GETTING-STARTED.md)** - Setup, prerequisites, running locally
3. **[03-ARCHITECTURE.md](./03-ARCHITECTURE.md)** - Three-tier architecture, deployment, design patterns
4. **[04-FRONTEND-GUIDE.md](./04-FRONTEND-GUIDE.md)** - React components, routing, state management
5. **[05-BACKEND-API.md](./05-BACKEND-API.md)** - API endpoints reference, auth flow, error handling
6. **[06-DATABASE-MODELS.md](./06-DATABASE-MODELS.md)** - Mongoose schemas, relationships, indexes
7. **[07-DEPLOYMENT.md](./07-DEPLOYMENT.md)** - Docker builds, Cloud Run, MediaMTX server, CI/CD
8. **[08-FEATURES-GUIDE.md](./08-FEATURES-GUIDE.md)** - Feature implementations, maps, CCTV, workers
9. **[WebRTC.md](./WebRTC.md)** - WebRTC streaming architecture, FFmpeg, MediaMTX config, shared streams

## Common Tasks

**Add API Endpoint:**
1. Define route in `backend/src/routes/{resource}Routes.ts`
2. Implement controller in `backend/src/controllers/{resource}Controller.ts`
3. Add `protect` middleware if auth required
4. Create service in `frontend/src/services/{resource}Service.tsx`
5. Call from component

**Add Component:**
1. Create in `frontend/src/components/{feature}/`
2. Define TypeScript props interface
3. Use existing services for API calls
4. Apply Tailwind for styling

**Modify Schema:**
1. Update model in `backend/src/models/{Model}.ts`
2. Update controller validation
3. Update frontend TypeScript types

**Deploy:**
```bash
gcloud builds submit --config cloudbuild.yaml \
  --substitutions _MONGODB_URI=<uri>,_REACT_APP_GOOGLE_MAPS_API_KEY=<key>
```

## Critical Notes
- **WebRTC:** See `WebRTC.md` for full streaming setup (FFmpeg bridge → MediaMTX → React)
- **Maps:** Requires `REACT_APP_GOOGLE_MAPS_API_KEY` and enabled Maps JavaScript API
- **Workers:** Compound unique index on (id, farmId) - unique per farm, not globally
- **Deployment:** Multi-stage Docker serves both frontend (static) and backend (Express) on port 8080
- **Auth:** Token in localStorage, checked in `App.tsx`, protected by middleware
