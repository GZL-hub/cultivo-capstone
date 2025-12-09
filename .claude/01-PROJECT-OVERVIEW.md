# Project Overview

## What is Cultivo?

Cultivo is a full-stack farm management platform that integrates IoT sensors, WebRTC CCTV streaming, Google Maps visualization, and worker management into a centralized web dashboard for modern farm operations.

## Project Vision

Bridge traditional farming with modern IoT technology by enabling farmers to:
- Monitor farms remotely through maps, sensors, and cameras
- Manage workers efficiently across multiple farms
- Make data-driven decisions using sensor analytics
- Ensure security through low-latency CCTV streaming
- Automate irrigation based on soil conditions

## Project Type

**Category:** Full-Stack Web Application (Farm Management SaaS)

**Deployment Model:** Cloud-native hybrid architecture
- Frontend & Backend: Google Cloud Run (serverless containers)
- Database: MongoDB Atlas (cloud NoSQL)
- Media Server: Google Compute Engine (MediaMTX on VM)
- IoT Platform: Blynk IoT + Custom API endpoints

## Technology Stack

### Frontend
- React 19.1.1 with TypeScript 4.9.5
- Tailwind CSS 3.4.17
- Google Maps API 2.20.7
- ApexCharts 5.3.5 + Recharts 3.2.1
- Framer Motion 12.23.21
- Lucide React 0.544.0
- Axios 1.12.2
- React Hot Toast 2.6.0

### Backend
- Node.js 18
- Express.js 4.18.2 with TypeScript 5.0.4
- MongoDB 8.18.2 (Mongoose ODM)
- JWT 9.0.2
- bcrypt 6.0.0

### Infrastructure
- Docker (multi-stage builds)
- Google Cloud Run (asia-southeast1)
- Compute Engine (MediaMTX server)
- Artifact Registry
- Cloud Build + GitHub Actions

### Streaming & IoT
- MediaMTX (WebRTC/RTSP/HLS server)
- FFmpeg (H.265 to H.264 transcoding)
- WebRTC (WHEP protocol, ~0.5-1.5s latency)
- ESP32 DevKit with 7-in-1 NPK soil sensors
- Blynk IoT platform (real-time monitoring)

## Architecture Overview

**Monorepo Structure:**
- `frontend/` - React SPA with feature-based components
- `backend/` - Express API with Mongoose models
- `.claude/` - Project documentation
- `Dockerfile` - Multi-stage production build
- `cloudbuild.yaml` - GCP deployment config

## Key Features

### Farm Management
- Interactive Google Maps with polygon boundary drawing
- GeoJSON storage for precise farm boundaries
- Multiple farm support per user account
- Farm metadata: type, area size, operation date, coordinates

### Worker Management
- Full CRUD operations with nested routes under farms
- Worker details: ID, name, role, email, phone, join date
- Status tracking (active/inactive)
- Search and filter by name, role, status
- Unique worker IDs per farm (compound index)

### CCTV Monitoring
- Ultra-low latency WebRTC streaming (~0.5-1.5s)
- Shared stream architecture (1 connection for 16 cameras)
- Grid layouts: 2x2, 3x3, 4x4
- Fullscreen mode per camera
- Auto-reconnect with exponential backoff
- Real-time connection status indicators

### IoT Sensor System
- Dual reporting: Blynk (2s real-time) + Cloud Run API (5min historical)
- Soil metrics: moisture, temperature, pH, EC
- NPK nutrients: nitrogen, phosphorus, potassium
- Automated irrigation with pump control
- Color-coded alerts: green (normal), yellow (warning), red (critical), gray (offline)
- Historical data visualization with 24h, 7d, 30d views

### Analytics & Weather
- Farm performance metrics visualization
- 5-day weather forecasting
- Sensor data trends and statistics
- NPK nutrient analysis with optimal ranges

### Authentication & Security
- JWT-based authentication (30-day expiration)
- bcrypt password hashing (10 salt rounds)
- Protected routes with middleware
- Role-based access (User/Admin)

### User Management
- Profile management with avatar support
- Account settings customization
- Multi-farm ownership

## Development Philosophy

### Code Organization
- Feature-based component structure
- Service layer pattern for API calls
- TypeScript throughout for type safety
- Separation of concerns (UI, logic, data)
- Reusable components and utilities

### Design Patterns
- MVC-like architecture (Controllers, Models, Views)
- Middleware pattern (Auth, error handling)
- Repository pattern (Mongoose models)
- Service pattern (Frontend API clients)
- Provider pattern (React Context for shared state)
- HOC pattern (Layout wrapper for auth routes)

## Performance Optimizations

- WebRTC shared streams: 16x bandwidth reduction
- Multi-stage Docker builds: 3x smaller images
- Database compound indexes on frequently queried fields
- Code splitting for route-based lazy loading (planned)
- Environment-based configuration

## Browser & Platform Support

- Modern browsers with WebRTC support (Chrome, Firefox, Safari, Edge)
- HTTPS required for WebRTC streaming
- Self-signed certificates in development
- Responsive design via Tailwind CSS
- Mobile-friendly UI

## Current Limitations

- Single MediaMTX instance (single point of failure)
- No API rate limiting
- Self-signed certificates require manual acceptance
- No WebSocket support (polling for updates)
- Limited role-based access control

## Planned Enhancements

- WebSocket for real-time updates
- SMS/Email alerts for critical conditions
- Mobile app (React Native)
- ML-based anomaly detection for sensors
- Multi-farm correlation analysis
- Automated fertilizer recommendations
- Weather API integration
- Over-the-air (OTA) firmware updates for ESP32
