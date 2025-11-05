# Cultivo Documentation

Welcome to the comprehensive documentation for Cultivo, a full-stack farm management platform.

## Table of Contents

### Getting Started

1. **[Project Overview](./01-PROJECT-OVERVIEW.md)**
   - What is Cultivo?
   - Technology stack
   - Architecture overview
   - Key features

2. **[Getting Started Guide](./02-GETTING-STARTED.md)**
   - Prerequisites and setup
   - Environment configuration
   - Running locally (development mode)
   - First-time setup

### Architecture & Design

3. **[System Architecture](./03-ARCHITECTURE.md)**
   - Three-tier architecture
   - Deployment infrastructure
   - Data flow patterns
   - Design patterns
   - Security architecture

4. **[Frontend Development Guide](./04-FRONTEND-GUIDE.md)**
   - React architecture
   - Component organization
   - Service layer pattern
   - Routing structure
   - State management
   - Styling with Tailwind CSS

5. **[Backend API Reference](./05-BACKEND-API.md)**
   - API overview and conventions
   - Authentication endpoints
   - Farm management endpoints
   - Worker management (nested routes)
   - CCTV endpoints
   - Error handling

6. **[Database Models & Schema](./06-DATABASE-MODELS.md)**
   - User model
   - Farm model (with GeoJSON)
   - Worker model (compound unique index)
   - CCTV model
   - Relationships & indexes
   - Query patterns

### Deployment & Operations

7. **[Deployment Guide](./07-DEPLOYMENT.md)**
   - Docker multi-stage builds
   - Google Cloud Platform setup
   - Cloud Run deployment
   - MediaMTX server (GCE)
   - CI/CD pipeline
   - Environment management
   - Monitoring & logging

### Development

8. **[Development Workflow](./08-DEVELOPMENT-WORKFLOW.md)**
   - Git workflow and branching
   - Commit message conventions
   - Code review guidelines
   - Testing strategy
   - Code quality tools
   - Pre-commit hooks
   - Continuous Integration

9. **[Features Implementation Guide](./09-FEATURES-GUIDE.md)**
   - Authentication system
   - Farm management
   - Interactive maps with polygons
   - Worker management
   - CCTV live streaming (WebRTC)
   - Device management
   - Analytics & weather

---

## Quick Links

### Common Tasks

- **Run the app locally**: [Getting Started → Running the Application](./02-GETTING-STARTED.md#running-the-application)
- **Deploy to production**: [Deployment Guide → Google Cloud Platform](./07-DEPLOYMENT.md#google-cloud-platform-setup)
- **Add a new API endpoint**: [Backend API → Adding Endpoints](./05-BACKEND-API.md) + [Development Workflow](./08-DEVELOPMENT-WORKFLOW.md)
- **Create a new component**: [Frontend Guide → Component Design](./04-FRONTEND-GUIDE.md#component-organization-principles)
- **Understand WebRTC streaming**: See `.claude/WebRTC.md` (detailed WebRTC implementation)

### Reference Guides

- **API Endpoints**: [Backend API Reference](./05-BACKEND-API.md)
- **Database Schema**: [Database Models](./06-DATABASE-MODELS.md)
- **TypeScript Types**: `frontend/src/types/index.ts`
- **Environment Variables**: [Getting Started → Environment Configuration](./02-GETTING-STARTED.md#environment-configuration)

---

## Documentation Structure

```
docs/
├── README.md                        # This file (documentation index)
├── 01-PROJECT-OVERVIEW.md           # High-level project introduction
├── 02-GETTING-STARTED.md            # Setup and local development
├── 03-ARCHITECTURE.md               # System design and architecture
├── 04-FRONTEND-GUIDE.md             # Frontend development guide
├── 05-BACKEND-API.md                # API endpoint reference
├── 06-DATABASE-MODELS.md            # Database schema documentation
├── 07-DEPLOYMENT.md                 # Production deployment guide
├── 08-DEVELOPMENT-WORKFLOW.md       # Git, testing, CI/CD
└── 09-FEATURES-GUIDE.md             # Feature implementation details
```

---

## For New Developers

If you're new to the Cultivo project, follow this learning path:

### Phase 1: Understanding (Day 1)

1. **Read** [Project Overview](./01-PROJECT-OVERVIEW.md) to understand what Cultivo does
2. **Review** [Architecture](./03-ARCHITECTURE.md) to understand how it's built
3. **Skim** [Frontend Guide](./04-FRONTEND-GUIDE.md) and [Backend API](./05-BACKEND-API.md) to see the codebase structure

### Phase 2: Setup (Day 1-2)

1. **Follow** [Getting Started Guide](./02-GETTING-STARTED.md) to set up your local environment
2. **Run** the application locally (backend + frontend)
3. **Create** a test account and explore the UI
4. **Test** API endpoints using Postman or Thunder Client

### Phase 3: First Contribution (Week 1)

1. **Read** [Development Workflow](./08-DEVELOPMENT-WORKFLOW.md) to understand Git workflow
2. **Pick** a "good first issue" from GitHub Issues
3. **Create** a feature branch and make your changes
4. **Submit** a pull request following PR guidelines

### Phase 4: Deep Dive (Week 2+)

1. **Study** [Features Guide](./09-FEATURES-GUIDE.md) to understand feature implementations
2. **Review** [Database Models](./06-DATABASE-MODELS.md) to understand data structure
3. **Explore** the codebase with your newfound knowledge
4. **Contribute** more significant features or refactoring

---

## For Experienced Developers

### Quick Start

```bash
# Clone repo
git clone https://github.com/your-org/cultivo-capstone.git
cd cultivo-capstone

# Backend setup
cd backend
npm install
echo "MONGODB_URI=mongodb://localhost:27017/cultivo" > .env
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
echo "REACT_APP_GOOGLE_MAPS_API_KEY=your_key" > .env
npm start

# Access: http://localhost:3000
```

### Key Files to Review

- **Backend Entry**: `backend/src/index.ts`
- **Frontend Entry**: `frontend/src/App.tsx`
- **API Routes**: `backend/src/routes/*Routes.ts`
- **Database Models**: `backend/src/models/*.ts`
- **Service Layer**: `frontend/src/services/*Service.tsx`
- **Docker Build**: `Dockerfile`
- **Deployment Config**: `cloudbuild.yaml`

---

## Technology Stack Summary

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19.1, TypeScript, Tailwind CSS, Google Maps |
| **Backend** | Node.js 18, Express.js, TypeScript, Mongoose |
| **Database** | MongoDB (Atlas or local) |
| **Authentication** | JWT (jsonwebtoken), bcrypt |
| **Streaming** | WebRTC (MediaMTX server), FFmpeg |
| **Deployment** | Docker, Google Cloud Run, GCP Compute Engine |
| **CI/CD** | GitHub Actions, Cloud Build |
| **Build Tools** | Create React App, TypeScript Compiler |

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
│  React SPA + Google Maps + WebRTC                                │
│  - Client-side routing (React Router)                            │
│  - JWT in localStorage                                           │
│  - Axios with interceptors                                       │
└───────────────────────────┬──────────────────────────────────────┘
                            │ HTTPS/REST API
                            │
┌───────────────────────────▼──────────────────────────────────────┐
│                    CLOUD RUN (Asia SE 1)                         │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Docker Container (Port 8080)                                │ │
│  │ ├── Express.js Backend (API endpoints: /api/*)              │ │
│  │ └── React Frontend (Static files served from /public)       │ │
│  └─────────────────────────────────────────────────────────────┘ │
└───────────────────────────┬──────────────────────────────────────┘
                            │ MongoDB Protocol
                            │
┌───────────────────────────▼──────────────────────────────────────┐
│                     MONGODB ATLAS (Cloud)                        │
│  Collections: users, farms, workers, cctvs                       │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                   COMPUTE ENGINE VM (us-central1)                │
│  MediaMTX Server (WebRTC/RTSP/HLS)                               │
│  ◄─── FFmpeg Bridge (Local Network)                              │
│       ◄─── Hikvision Camera (RTSP)                               │
└──────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Example: Creating a Farm

```
1. User fills form in FarmOverview.tsx
   ↓
2. onClick → farmService.createFarm(farmData)
   ↓
3. Axios POST /api/farms with JWT token in header
   ↓
4. Express receives request → routes/farmRoutes.ts
   ↓
5. Middleware checks JWT (protect middleware)
   ↓
6. Controller: controllers/farmController.ts → createFarm()
   ↓
7. Mongoose: Farm.create({ ...farmData })
   ↓
8. MongoDB: Insert document into farms collection
   ↓
9. Response: { success: true, data: farm }
   ↓
10. Frontend updates state → UI refreshes
```

---

## Key Features

### 1. Farm Management
- Create, read, update, delete farms
- Draw farm boundaries with Google Maps polygon tools
- GeoJSON storage for precise boundaries
- Farm ownership tied to user accounts

### 2. Worker Management
- Full CRUD operations for workers
- Unique worker IDs per farm (compound index)
- Status tracking (active/inactive)
- Search and filter capabilities
- Nested resource pattern: `/api/farms/:farmId/workers`

### 3. CCTV Streaming
- Ultra-low latency WebRTC streaming (~0.5-1.5s)
- Shared stream architecture (1 connection for 16 cameras)
- Auto-reconnect with exponential backoff
- Fullscreen mode for individual cameras
- 2x2, 3x3, 4x4 grid layouts

### 4. Authentication
- JWT-based stateless authentication
- bcrypt password hashing (10 salt rounds)
- Axios interceptors for automatic token injection
- Protected routes with middleware

### 5. Interactive Maps
- Google Maps integration
- Polygon drawing tools for farm boundaries
- Satellite view for better farm visualization
- Multiple farms support on single map

---

## Common Issues & Solutions

### Issue: MongoDB Connection Error

**Symptom:**
```
MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
1. Verify MongoDB is running: `brew services list` (macOS)
2. Check `MONGODB_URI` in `backend/.env`
3. For Atlas: Ensure IP is whitelisted in Network Access

### Issue: Google Maps Not Loading

**Symptom:**
```
Error loading maps
```

**Solution:**
1. Verify `REACT_APP_GOOGLE_MAPS_API_KEY` in `frontend/.env`
2. Enable "Maps JavaScript API" in Google Cloud Console
3. Restart frontend dev server after changing `.env`

### Issue: WebRTC Connection Fails

**Symptom:** Camera shows "Connecting..." indefinitely

**Solution:**
1. Check MediaMTX server is running
2. Verify firewall rules (UDP 8000-8001, TCP 8889)
3. Accept self-signed certificate in browser (visit HTTPS URL)
4. Check FFmpeg is pushing stream to MediaMTX

---

## Contributing

### Reporting Issues

1. Check existing issues on GitHub
2. Create new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)
   - Environment details (OS, browser, Node version)

### Submitting Pull Requests

1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Make changes following code style guidelines
4. Write tests for new functionality
5. Update documentation if needed
6. Commit with descriptive messages (see [Development Workflow](./08-DEVELOPMENT-WORKFLOW.md))
7. Push and create pull request
8. Respond to code review feedback

### Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier (run `npm run format`)
- **Linting**: ESLint (run `npm run lint`)
- **Components**: PascalCase (e.g., `FarmMap.tsx`)
- **Services**: camelCase with suffix (e.g., `farmService.tsx`)
- **Commit Messages**: Conventional Commits format

---

## Support & Resources

### Documentation

- **This Documentation**: `/docs` directory
- **Claude Code Guide**: `.claude/CLAUDE.md` (quick reference)
- **WebRTC Deep Dive**: `.claude/WebRTC.md` (streaming implementation)
- **README**: `frontend/README.md` (Create React App docs)

### External Resources

- **React**: [reactjs.org](https://reactjs.org/)
- **TypeScript**: [typescriptlang.org](https://www.typescriptlang.org/)
- **Express**: [expressjs.com](https://expressjs.com/)
- **Mongoose**: [mongoosejs.com](https://mongoosejs.com/)
- **Tailwind CSS**: [tailwindcss.com](https://tailwindcss.com/)
- **Google Maps API**: [developers.google.com/maps](https://developers.google.com/maps)

### Community

- **GitHub Issues**: Report bugs and request features
- **Pull Requests**: Review and discuss code changes
- **Discussions**: (If enabled) General questions and ideas

---

## License

[Specify license - e.g., MIT, Apache 2.0, etc.]

---

## Changelog

See [CHANGELOG.md](../CHANGELOG.md) for release history (if exists).

---

## Credits

**Developed by:** [Your Name/Team]

**Special Thanks:**
- Google Cloud Platform for hosting
- MongoDB Atlas for database hosting
- MediaMTX for WebRTC streaming
- Open source community for libraries and tools

---

## Next Steps

👉 **New to the project?** Start with [Project Overview](./01-PROJECT-OVERVIEW.md)

👉 **Ready to code?** Follow [Getting Started Guide](./02-GETTING-STARTED.md)

👉 **Need API reference?** Check [Backend API Documentation](./05-BACKEND-API.md)

👉 **Deploying to production?** See [Deployment Guide](./07-DEPLOYMENT.md)

---

**Last Updated:** November 2025

**Documentation Version:** 1.0.0
