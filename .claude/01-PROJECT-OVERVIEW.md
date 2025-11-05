# Project Overview

## What is Cultivo?

Cultivo is a full-stack farm management platform designed to help farmers with modern technology for efficient farm operations. The platform provides a centralized dashboard for monitoring farms through interactive maps and sensors, managing workers, tracking equipment (sensors/cameras), analyzing weather data, and monitoring live CCTV feeds via WebRTC streaming.

## Project Vision

The platform aims to bridge the gap between traditional farming practices and modern IoT technology, enabling farmers to:

- **Monitor Farms Remotely**: View farm boundaries, sensor locations, and camera feeds from anywhere
- **Manage Workers Efficiently**: Track worker information, roles, and status across multiple farms
- **Make Data-Driven Decisions**: Analyze weather patterns, sensor data, and farm analytics
- **Ensure Security**: Monitor farm activities through low-latency CCTV streaming
- **Scale Operations**: Support multiple farms and equipment from a single dashboard

## Project Type

**Category**: Full-Stack Web Application (SaaS Platform)

**Deployment Model**: Cloud-native application with hybrid architecture
- **Frontend & Backend**: Google Cloud Run (serverless containers)
- **Database**: MongoDB Atlas (cloud-hosted NoSQL database)
- **Media Server**: Google Compute Engine (dedicated VM for WebRTC streaming)
- **Local Bridge**: FFmpeg on local network (for camera streaming)

## Technology Stack

### Frontend Technologies

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | React | 19.1.1 | UI component library |
| **Language** | TypeScript | 4.9.5 | Type-safe JavaScript |
| **Styling** | Tailwind CSS | 3.4.17 | Utility-first CSS framework |
| **Build Tool** | Create React App | 5.0.1 | Development server & build tooling |
| **Routing** | React Router DOM | 7.9.1 | Client-side routing |
| **State Management** | React Context API | - | Global state management |
| **Maps** | Google Maps API | 2.20.7 | Interactive farm maps |
| **Charts** | ApexCharts + Recharts | 5.3.5 / 3.2.1 | Data visualization |
| **Animations** | Framer Motion | 12.23.21 | UI animations |
| **Icons** | Lucide React | 0.544.0 | Icon library |
| **HTTP Client** | Axios | 1.12.2 | API requests with interceptors |
| **Notifications** | React Hot Toast | 2.6.0 | User notifications |

### Backend Technologies

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Runtime** | Node.js | 18 | JavaScript runtime |
| **Framework** | Express.js | 4.18.2 | Web application framework |
| **Language** | TypeScript | 5.0.4 | Type-safe server code |
| **Database** | MongoDB | 8.18.2 (Mongoose) | NoSQL database with ODM |
| **Authentication** | JWT | 9.0.2 | Token-based authentication |
| **Password Hashing** | bcrypt | 6.0.0 | Secure password encryption |
| **CORS** | cors | 2.8.5 | Cross-origin resource sharing |
| **Environment** | dotenv | 17.2.2 | Environment variable management |

### Infrastructure & DevOps

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Containerization** | Docker | Multi-stage builds for production |
| **Cloud Platform** | Google Cloud Platform (GCP) | Hosting and deployment |
| **Compute** | Cloud Run | Serverless container hosting (Asia Southeast 1) |
| **VM** | Compute Engine | Media server hosting (MediaMTX) |
| **Container Registry** | Artifact Registry | Docker image storage |
| **Build Pipeline** | Cloud Build | Automated image building |
| **Version Control** | Git + GitHub | Source code management |
| **CI/CD** | GitHub Actions + Cloud Build | Automated deployment |

### Streaming & Media

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Media Server** | MediaMTX | WebRTC/RTSP/HLS streaming server |
| **Protocol** | WebRTC (WHEP) | Ultra-low latency video streaming |
| **Transcoding** | FFmpeg | H.265 to H.264 video conversion |
| **Camera** | Hikvision RTSP | IP camera integration |

## Architecture Overview

Cultivo follows a modern **monorepo structure** with clear separation of concerns:

```
cultivo-capstone/
├── frontend/          # React SPA (Create React App)
│   ├── public/        # Static assets
│   └── src/
│       ├── components/   # Feature-based React components
│       ├── services/     # API client modules
│       ├── types/        # TypeScript type definitions
│       └── App.tsx       # Main application with routing
│
├── backend/           # Express API server
│   └── src/
│       ├── models/       # Mongoose schemas (User, Farm, Worker, CCTV)
│       ├── controllers/  # Business logic handlers
│       ├── routes/       # API endpoint definitions
│       ├── middleware/   # Authentication & request processing
│       ├── config/       # Database configuration
│       ├── utils/        # Helper functions (JWT, etc.)
│       └── index.ts      # Express server setup
│
├── .claude/           # Claude Code project documentation
├── .github/           # GitHub Actions workflows
├── docs/              # Comprehensive project documentation
├── Dockerfile         # Multi-stage production build
└── cloudbuild.yaml    # GCP Cloud Build configuration
```

## Key Features

### 1. Farm Management
- **Interactive Maps**: Draw and visualize farm boundaries using Google Maps polygon tools
- **Multiple Farm Support**: Manage multiple farms from a single account
- **Farm Details**: Track farm type, area size, operation date, and coordinates
- **GeoJSON Storage**: Store farm boundaries as GeoJSON polygons for precise mapping

### 2. Worker Management
- **CRUD Operations**: Create, read, update, and delete worker records
- **Farm Association**: Workers are nested resources under specific farms
- **Status Tracking**: Monitor worker status (active/inactive)
- **Contact Management**: Store worker email, phone, and role information
- **Search & Filter**: Find workers by name, role, or status

### 3. CCTV Monitoring
- **WebRTC Streaming**: Ultra-low latency video streaming (~0.5-1.5 seconds)
- **Shared Stream Architecture**: Single WebRTC connection supports multiple viewers
- **Grid Layouts**: 2x2, 3x3, 4x4 camera grids
- **Fullscreen Mode**: Expand individual camera feeds to fullscreen
- **Auto-Reconnect**: Exponential backoff retry logic for connection failures
- **Status Indicators**: Real-time connection status for each camera

### 4. Device Management
- **Sensor Tracking**: Monitor sensor locations and data
- **Camera Registry**: Track CCTV cameras associated with farms
- **Equipment Status**: Online/offline status monitoring

### 5. Analytics & Weather
- **Farm Analytics**: Visualize farm performance metrics
- **Weather Forecasting**: 5-day weather predictions with detailed metrics
- **Data Visualization**: Charts and graphs using ApexCharts/Recharts

### 6. Authentication & Security
- **JWT-Based Auth**: Secure token-based authentication
- **Password Encryption**: bcrypt hashing for user passwords
- **Protected Routes**: Middleware-based route protection
- **Role-Based Access**: User role management (future enhancement)

### 7. User Management
- **Profile Management**: Update user information and avatars
- **Account Settings**: Customize user preferences
- **Farm Ownership**: Users own and manage their farms


## Development Philosophy

### Code Organization Principles

1. **Feature-Based Structure**: Components organized by feature rather than type
2. **Service Layer Pattern**: All API calls abstracted into dedicated service modules
3. **Type Safety**: TypeScript used throughout for compile-time error detection
4. **Separation of Concerns**: Clear boundaries between UI, business logic, and data access
5. **Reusability**: Shared components and utilities extracted for DRY principle

### Design Patterns

- **MVC-like Architecture**: Controllers handle business logic, models define data schemas
- **Middleware Pattern**: Authentication, error handling, and request processing
- **Repository Pattern**: Mongoose models act as data access layer
- **Service Pattern**: Frontend services encapsulate API communication
- **Provider Pattern**: React Context for shared state (auth, WebRTC streams)
- **HOC Pattern**: Layout wrapper for authenticated routes

## Performance Optimizations

1. **WebRTC Shared Streams**: 16 cameras share 1 connection (16x bandwidth reduction)
2. **Code Splitting**: React lazy loading for route-based code splitting
3. **Image Optimization**: CDN-hosted avatars and optimized assets
4. **Database Indexing**: Compound indexes on Worker (id, farmId)
5. **Environment-Based Configuration**: Different configs for dev/production

## Browser & Platform Support

- **Browsers**: Modern browsers with WebRTC support (Chrome, Firefox, Safari, Edge)
- **HTTPS Required**: WebRTC streaming requires secure context
- **Self-Signed Certs**: Development setup uses self-signed certificates (requires manual acceptance)
- **Responsive Design**: Tailwind CSS ensures mobile-friendly UI

## Next Steps

To get started with development, proceed to:
- **[Getting Started Guide](./02-GETTING-STARTED.md)** - Setup and local development
- **[Architecture Guide](./03-ARCHITECTURE.md)** - System architecture deep dive
- **[API Documentation](./05-BACKEND-API.md)** - API endpoint reference
