# Deployment Guide

## Deployment Overview

Containerized deployment strategy with Google Cloud Platform (GCP) services. Application deployed as Docker container to Cloud Run, with separate infrastructure for WebRTC media server.

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT PIPELINE                          │
│                                                                 │
│  GitHub Repo                                                    │
│      │                                                          │
│      │ Push to main branch                                      │
│      ▼                                                          │
│  GitHub Actions                                                 │
│      │                                                          │
│      │ Trigger Cloud Build                                      │
│      ▼                                                          │
│  Google Cloud Build                                             │
│      │                                                          │
│      ├─► Build Docker image (multi-stage)                       │
│      ├─► Push to Artifact Registry                              │
│      └─► Deploy to Cloud Run                                    │
│           │                                                     │
│           ▼                                                     │
│  Cloud Run Service (cultivo-capstone)                           │
│      ├─► Express.js Backend (API endpoints)                     │
│      └─► React Frontend (Static files)                          │
└─────────────────────────────────────────────────────────────────┘
```

## Docker Multi-Stage Build

### Dockerfile Structure

**File:** `/Dockerfile`

**3-Stage Build:**

**Stage 1: Build Frontend (React)**
- Install dependencies
- Create production build
- Output: `/app/frontend/build`

**Stage 2: Build Backend (TypeScript)**
- Install dependencies
- Compile TypeScript to JavaScript
- Output: `/app/backend/dist`

**Stage 3: Final Production Image**
- Copy backend compiled code
- Install production dependencies only
- Copy frontend build to `/public`
- Single container serves both API and static files

### Why Multi-Stage Build?

**Benefits:**
1. Smaller image size (~450 MB vs ~1.2 GB)
2. Faster builds with layer caching
3. No dev dependencies in production
4. Single container for both frontend and backend

## Local Docker Build & Test

### Build Image
Build with `--build-arg` for:
- `REACT_APP_GOOGLE_MAPS_API_KEY`
- `MONGODB_URI`

Build time: ~3-5 minutes (first), ~1-2 minutes (cached)

### Run Container
Map port 8080, pass environment variables:
- `MONGODB_URI`
- `JWT_SECRET`

### Test Container
Access at `http://localhost:8080`, test API endpoint `/api/message`

## Google Cloud Platform Setup

### 1. Create GCP Project
- Create project
- Set as active project
- Enable required APIs:
  - Cloud Run API
  - Cloud Build API
  - Artifact Registry API

### 2. Create Artifact Registry
- Create Docker repository
- Configure Docker authentication
- Location: asia-southeast1

### 3. Set Up Cloud Build

**File:** `/cloudbuild.yaml`

**Steps:**
1. Build Docker image with build args
2. Push to Artifact Registry
3. Tag as latest

**Substitutions:**
- `_AR_HOSTNAME`: asia-southeast1-docker.pkg.dev
- `_AR_REPOSITORY`: cloud-run-source-deploy
- `_SERVICE_NAME`: cultivo-capstone
- `_MONGODB_URI`: MongoDB connection string
- `_REACT_APP_GOOGLE_MAPS_API_KEY`: Google Maps API key

## Manual Deployment to Cloud Run

### Deploy Using Cloud Build
Submit build with substitutions for MongoDB URI and Google Maps API key.

### Deploy to Cloud Run
Configure:
- Region: asia-southeast1
- Platform: managed
- Access: allow-unauthenticated (public)
- Port: 8080
- Environment variables: MONGODB_URI, JWT_SECRET

### One-Command Deploy
Deploy from source using `gcloud run deploy` with:
- Build environment variables (API keys)
- Runtime environment variables (secrets)

## Automated CI/CD Pipeline

### GitHub Actions Workflow

**Trigger:** Push to main branch

**Steps:**
1. Checkout code
2. Authenticate to GCP
3. Set up Cloud SDK
4. Build and push image via Cloud Build
5. Deploy to Cloud Run

### GitHub Secrets Setup

**Required Secrets:**
1. `GCP_SA_KEY` - Service account JSON key
2. `MONGODB_URI` - MongoDB connection string
3. `GOOGLE_MAPS_API_KEY` - Google Maps API key
4. `GCP_PROJECT_ID` - GCP project ID
5. `JWT_SECRET` - JWT signing secret

### Create Service Account

Create service account with roles:
- `roles/run.admin`
- `roles/cloudbuild.builds.editor`
- `roles/artifactregistry.writer`

Generate and download key, add to GitHub secrets.

## MediaMTX Server Deployment (GCE)

WebRTC streaming server runs on separate Compute Engine VM.

### 1. Create Compute Engine Instance
- Machine type: e2-micro
- Image: debian-12
- Boot disk: 10GB
- Network tags: ssh-access, rtsp-push, webrtc-server

### 2. Configure Firewall Rules
- Allow SSH (port 22)
- Allow RTSP push (port 8554, from specific IP)
- Allow WebRTC (TCP 8889, UDP 8000-8001)
- Allow HLS (port 8888, optional)

### 3. Install MediaMTX
- Download MediaMTX release
- Extract archive
- Generate self-signed TLS certificates

### 4. Configure MediaMTX

**File:** `mediamtx.yml`

**Configuration:**
- Enable HLS with CORS
- Enable WebRTC with CORS
- Configure ICE servers (STUN)
- Set TLS certificates
- Register stream paths

### 5. Run MediaMTX as Service

Create systemd service:
- Service type: simple
- Auto-restart enabled
- Working directory configured

Enable and start service, monitor with systemctl status.

## Environment Variables Management

### Production Environment Variables

**Cloud Run:**
Set environment variables using `gcloud run services update`:
- `MONGODB_URI`
- `JWT_SECRET`
- `NODE_ENV`

View current variables using `gcloud run services describe`.

### Secret Management (Best Practice)

**Use Secret Manager:**
1. Create secrets for sensitive data
2. Grant Cloud Run service account access
3. Mount secrets as environment variables

Benefits: Better security, version control, audit logging.

## Monitoring & Logging

### Cloud Run Metrics

Access in GCP Console under service metrics:

**Key Metrics:**
- Request count
- Request latency
- Container instances (auto-scaling)
- Memory utilization
- CPU utilization

## Cost Optimization

### Cloud Run Pricing

**Free Tier (per month):**
- 2 million requests
- 360,000 GB-seconds memory
- 180,000 vCPU-seconds

**Estimated Costs (Low Traffic):**
- Cloud Run: $0-5/month (within free tier)
- Artifact Registry: ~$0.50/month
- Cloud Build: Free (120 builds/day)

**Optimization Tips:**
1. Set minimum instances to 0 (scale to zero)
2. Use e2-micro for MediaMTX ($7/month)
3. Use MongoDB Atlas Free Tier (M0 Sandbox)
4. Set lower request timeout

Configure with `gcloud run services update`:
- Min instances: 0
- Max instances: 3
- CPU: 1
- Memory: 512Mi
- Timeout: 60s

## Troubleshooting

### Common Issues

**1. Build Fails: Missing Build Args**
Ensure all build args are passed (REACT_APP_GOOGLE_MAPS_API_KEY, MONGODB_URI).

**2. Cloud Run: Service Unavailable (503)**
Check:
- Container logs for errors
- MONGODB_URI is correct
- Application listens on port 8080

**3. WebRTC Connection Fails**
Check:
- MediaMTX firewall rules
- Self-signed certificate accepted
- FFmpeg pushing stream

**4. MongoDB Connection Timeout**
Check:
- Network access in MongoDB Atlas (add 0.0.0.0/0 or Cloud Run IPs)
- Connection string format
