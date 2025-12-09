# Cultivo Documentation

Comprehensive technical documentation for **Cultivo** - a full-stack farm management platform with WebRTC CCTV, IoT sensors, Google Maps, and worker management.

## Documentation Structure

All documentation has been **trimmed and optimized** to focus on current implementation details. Code examples, verbose explanations, and tutorial-style content have been removed.

### Main Documentation

1. **[01-PROJECT-OVERVIEW.md](./01-PROJECT-OVERVIEW.md)** - Project vision, tech stack, key features
2. **[02-GETTING-STARTED.md](./02-GETTING-STARTED.md)** - Prerequisites, installation, environment setup
3. **[03-ARCHITECTURE.md](./03-ARCHITECTURE.md)** - Three-tier architecture, deployment, data flow
4. **[04-FRONTEND-GUIDE.md](./04-FRONTEND-GUIDE.md)** - React components, routing, state management
5. **[05-BACKEND-API.md](./05-BACKEND-API.md)** - API endpoints, authentication, response formats
6. **[06-DATABASE-MODELS.md](./06-DATABASE-MODELS.md)** - Mongoose schemas, relationships, indexes
7. **[07-DEPLOYMENT.md](./07-DEPLOYMENT.md)** - Docker builds, Cloud Run, CI/CD pipeline
8. **[08-FEATURES-GUIDE.md](./08-FEATURES-GUIDE.md)** - Feature implementations, components

### Specialized Guides

**IoT & Sensors:**
- **[iot/IOT_ARCHITECTURE.md](./iot/IOT_ARCHITECTURE.md)** - ESP32 dual reporting system, data flow, security
- **[iot/ESP32_SETUP_GUIDE.md](./iot/ESP32_SETUP_GUIDE.md)** - Hardware specs, pin configuration tables
- **[iot/SENSOR_MANAGEMENT_README.md](./iot/SENSOR_MANAGEMENT_README.md)** - Sensor dashboard features, NPK analysis

**Streaming:**
- **[WebRTC.md](./WebRTC.md)** - WebRTC streaming architecture, FFmpeg, MediaMTX configuration

### Quick Reference
- **[CLAUDE.md](./CLAUDE.md)** - Quick start guide for developers and AI agents

## Quick Start

```bash
# Backend (Terminal 1)
cd backend && npm install && npm run dev

# Frontend (Terminal 2)
cd frontend && npm install && npm start

# Access: http://localhost:3000
```

**Environment Setup:**
- `backend/.env` → `MONGODB_URI`, `JWT_SECRET`
- `frontend/.env` → `REACT_APP_GOOGLE_MAPS_API_KEY`

## Common Tasks

| Task | Reference |
|------|-----------|
| **System architecture** | [03-ARCHITECTURE.md](./03-ARCHITECTURE.md) |
| **API endpoints** | [05-BACKEND-API.md](./05-BACKEND-API.md) |
| **Database schema** | [06-DATABASE-MODELS.md](./06-DATABASE-MODELS.md) |
| **Frontend structure** | [04-FRONTEND-GUIDE.md](./04-FRONTEND-GUIDE.md) |
| **Deploy to cloud** | [07-DEPLOYMENT.md](./07-DEPLOYMENT.md) |
| **WebRTC setup** | [WebRTC.md](./WebRTC.md) |
| **IoT sensor setup** | [iot/ESP32_SETUP_GUIDE.md](./iot/ESP32_SETUP_GUIDE.md) |
| **Sensor management** | [iot/SENSOR_MANAGEMENT_README.md](./iot/SENSOR_MANAGEMENT_README.md) |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19.1, TypeScript, Tailwind CSS, Google Maps API |
| **Backend** | Express.js, MongoDB (Mongoose), JWT authentication |
| **Streaming** | WebRTC (MediaMTX), FFmpeg transcoding |
| **IoT** | ESP32, 7-in-1 NPK sensors, Blynk IoT platform |
| **Deployment** | Docker (multi-stage), Google Cloud Run, GCP Compute Engine |

## Architecture Overview

```
Browser (React + Maps + WebRTC)
    ↓ HTTPS/REST
Cloud Run (Express + React static)
    ↓ MongoDB Protocol
MongoDB Atlas (users, farms, workers, cctvs, sensors, sensorreadings)

Compute Engine VM (MediaMTX)
    ↑ RTSP Push
FFmpeg Bridge (Local Network)
    ↑ RTSP
Hikvision Camera

ESP32 Devices (Field)
    ├─ Blynk Cloud (2s interval, real-time monitoring)
    └─ Cloud Run API (5min interval, historical data)
```

## Key Features

- **Farm Management** - Google Maps polygons, GeoJSON boundaries, multi-farm support
- **Worker Management** - CRUD operations, nested routes, status tracking, search
- **CCTV Streaming** - Ultra-low latency WebRTC (~0.5-1.5s), shared stream (16x efficiency)
- **IoT Sensors** - Soil moisture, temperature, pH, EC, NPK nutrients, automated irrigation
- **Authentication** - JWT tokens, bcrypt password hashing, protected routes
- **Analytics** - Charts, weather forecasting, device monitoring, historical data
- **Alerts** - Real-time sensor alerts, configurable thresholds, status indicators

## Project Structure

```
frontend/           # React SPA
  ├── components/   # Feature-based: dashboard, farm-management, devices, analytics
  └── services/     # API clients: authService, farmService, sensorService, etc.

backend/            # Express API
  ├── models/       # Mongoose schemas: User, Farm, Worker, CCTV, Sensor, SensorReading
  ├── controllers/  # Business logic handlers
  ├── routes/       # API endpoint definitions
  └── middleware/   # Authentication, CORS, error handling

.claude/            # Documentation (trimmed, no code examples)
  ├── 01-PROJECT-OVERVIEW.md through 08-FEATURES-GUIDE.md
  ├── CLAUDE.md             # Quick reference
  ├── README.md             # This file
  ├── WebRTC.md             # Streaming guide
  └── iot/                  # IoT documentation

Dockerfile          # Multi-stage production build
cloudbuild.yaml     # GCP Cloud Build configuration
```

## Documentation Philosophy

This documentation has been **optimized for clarity and conciseness**:

✅ **Included:**
- Current implementation architecture
- Technical specifications
- Configuration parameters
- Component structures
- Data flow descriptions
- ASCII architecture diagrams

❌ **Removed:**
- Code examples and snippets
- Sample JSON/documents
- Verbose step-by-step tutorials
- Example API requests/responses
- Implementation how-tos

**Focus:** "What is implemented" rather than "how to implement it"

## Support

- **Quick Reference**: [CLAUDE.md](./CLAUDE.md) - Developer quick start
- **Project Overview**: [01-PROJECT-OVERVIEW.md](./01-PROJECT-OVERVIEW.md) - Vision and features
- **Getting Started**: [02-GETTING-STARTED.md](./02-GETTING-STARTED.md) - Setup guide
- **External Docs**: [React](https://reactjs.org/) · [Express](https://expressjs.com/) · [MongoDB](https://www.mongodb.com/) · [Tailwind](https://tailwindcss.com/) · [Google Maps](https://developers.google.com/maps)

---

**New to the project?** → Start with [01-PROJECT-OVERVIEW.md](./01-PROJECT-OVERVIEW.md)

**Ready to code?** → Follow [02-GETTING-STARTED.md](./02-GETTING-STARTED.md)

**Need API reference?** → Check [05-BACKEND-API.md](./05-BACKEND-API.md)

**Setting up IoT?** → Follow [iot/ESP32_SETUP_GUIDE.md](./iot/ESP32_SETUP_GUIDE.md)
