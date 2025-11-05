# Cultivo Documentation

Quick navigation to comprehensive documentation for **Cultivo** - a full-stack farm management platform with WebRTC CCTV, Google Maps, and worker management.

## Documentation Index

### Getting Started
- **[01 - Project Overview](./01-PROJECT-OVERVIEW.md)** - Vision, tech stack, features, architecture
- **[02 - Getting Started](./02-GETTING-STARTED.md)** - Prerequisites, setup, running locally

### Architecture & Development
- **[03 - System Architecture](./03-ARCHITECTURE.md)** - Three-tier architecture, deployment, patterns
- **[04 - Frontend Guide](./04-FRONTEND-GUIDE.md)** - React components, routing, state, styling
- **[05 - Backend API](./05-BACKEND-API.md)** - API endpoints, auth flow, error handling
- **[06 - Database Models](./06-DATABASE-MODELS.md)** - Mongoose schemas, indexes, relationships

### Deployment & Features
- **[07 - Deployment Guide](./07-DEPLOYMENT.md)** - Docker, Cloud Run, MediaMTX, CI/CD
- **[08 - Features Guide](./08-FEATURES-GUIDE.md)** - Auth, maps, CCTV, workers, analytics
- **[WebRTC Streaming](./WebRTC.md)** - Complete WebRTC implementation, FFmpeg, MediaMTX config

## Quick Start

```bash
# Backend (Terminal 1)
cd backend && npm install && npm run dev

# Frontend (Terminal 2)
cd frontend && npm install && npm start

# Access: http://localhost:3000
```

**Environment Setup:**
- `backend/.env` → `MONGODB_URI=mongodb://localhost:27017/cultivo`
- `frontend/.env` → `REACT_APP_GOOGLE_MAPS_API_KEY=your_key`

## Common Tasks

| Task | Reference |
|------|-----------|
| **Run locally** | [02 - Getting Started](./02-GETTING-STARTED.md) |
| **Add API endpoint** | [05 - Backend API](./05-BACKEND-API.md) |
| **Create component** | [04 - Frontend Guide](./04-FRONTEND-GUIDE.md) |
| **Deploy to Cloud** | [07 - Deployment Guide](./07-DEPLOYMENT.md) |
| **WebRTC setup** | [WebRTC.md](./WebRTC.md) |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19.1, TypeScript, Tailwind CSS, Google Maps |
| **Backend** | Express.js, MongoDB (Mongoose), JWT auth |
| **Streaming** | WebRTC (MediaMTX), FFmpeg |
| **Deployment** | Docker, Google Cloud Run, GCP Compute Engine |

## Architecture

```
Browser (React + Maps + WebRTC)
    ↓ HTTPS/REST
Cloud Run (Express + React static)
    ↓ MongoDB Protocol
MongoDB Atlas (users, farms, workers, cctvs)

Compute Engine VM (MediaMTX)
    ↑ RTSP Push
FFmpeg Bridge (Local Network)
    ↑ RTSP
Hikvision Camera
```

## Key Features

- **Farm Management** - Google Maps polygons, GeoJSON boundaries
- **Worker Management** - CRUD, nested routes, status tracking
- **CCTV Streaming** - Ultra-low latency WebRTC (~0.5-1.5s), shared streams
- **Authentication** - JWT tokens, bcrypt, protected routes
- **Analytics** - Charts, weather forecasting, device monitoring

## Project Structure

```
frontend/           # React SPA
  ├── components/   # Feature-based components
  └── services/     # API clients

backend/            # Express API
  ├── models/       # Mongoose schemas
  ├── controllers/  # Business logic
  ├── routes/       # API endpoints
  └── middleware/   # Auth protection

.claude/            # Documentation
Dockerfile          # Multi-stage build
cloudbuild.yaml     # GCP deployment
```

## Support

- **Quick Reference**: [CLAUDE.md](./CLAUDE.md) - Agent-friendly quick ref
- **GitHub Issues**: Report bugs and feature requests
- **External Docs**: [React](https://reactjs.org/) · [Express](https://expressjs.com/) · [MongoDB](https://www.mongodb.com/) · [Tailwind](https://tailwindcss.com/)

---

**New to the project?** → Start with [01 - Project Overview](./01-PROJECT-OVERVIEW.md)

**Ready to code?** → Follow [02 - Getting Started](./02-GETTING-STARTED.md)

**Need API reference?** → Check [05 - Backend API](./05-BACKEND-API.md)
