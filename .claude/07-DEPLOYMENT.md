# Deployment Guide

## Deployment Overview

Cultivo uses a **containerized deployment** strategy with Google Cloud Platform (GCP) services. The application is deployed as a Docker container to Cloud Run, with separate infrastructure for the WebRTC media server.

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
---

## Docker Multi-Stage Build

### Dockerfile Structure

**File:** `/Dockerfile`

The Dockerfile uses a **3-stage build** to optimize image size and build time:

```dockerfile
# Stage 1: Build Frontend (React)
FROM node:18 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
ARG REACT_APP_GOOGLE_MAPS_API_KEY
RUN echo "REACT_APP_GOOGLE_MAPS_API_KEY=$REACT_APP_GOOGLE_MAPS_API_KEY" > .env
RUN npm run build
# Output: /app/frontend/build

# Stage 2: Build Backend (TypeScript)
FROM node:18 AS backend-builder
WORKDIR /app/backend
ARG MONGODB_URI
ENV MONGODB_URI=$MONGODB_URI
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
RUN echo "MONGODB_URI=$MONGODB_URI" > .env
RUN npm run build
# Output: /app/backend/dist

# Stage 3: Final Production Image
FROM node:18-slim
WORKDIR /app
ARG MONGODB_URI
ENV MONGODB_URI=$MONGODB_URI

# Copy backend build
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/package*.json ./
COPY --from=backend-builder /app/backend/.env ./

# Install production dependencies only
RUN npm install --only=production

# Copy frontend build to be served by backend
COPY --from=frontend-builder /app/frontend/build ./public

EXPOSE 8080
CMD ["node", "dist/index.js"]
```

### Why Multi-Stage Build?

**Benefits:**
1. **Smaller Image Size**: Final image only contains production code, not build tools
2. **Faster Builds**: Layers are cached, subsequent builds are faster
3. **Security**: No dev dependencies or source code in production image
4. **Single Container**: Backend serves both API and frontend static files

**Image Size Comparison:**
- Single-stage build: ~1.2 GB
- Multi-stage build: ~450 MB (3x smaller)

---

## Local Docker Build & Test

### Build Docker Image Locally

```bash
# From project root directory
docker build \
  --build-arg REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key \
  --build-arg MONGODB_URI=your_mongodb_uri \
  -t cultivo:latest \
  .
```

**Build Arguments:**
- `REACT_APP_GOOGLE_MAPS_API_KEY`: Required for Google Maps
- `MONGODB_URI`: Required for database connection

**Build Time:** ~3-5 minutes (first build), ~1-2 minutes (cached builds)

### Run Docker Container Locally

```bash
docker run -p 8080:8080 \
  -e MONGODB_URI=your_mongodb_uri \
  -e JWT_SECRET=your_jwt_secret \
  cultivo:latest
```

**Environment Variables:**
- `-p 8080:8080`: Map container port 8080 to host port 8080
- `-e MONGODB_URI`: Database connection string
- `-e JWT_SECRET`: JWT signing secret (optional)

### Test the Container

```bash
# Access the application
open http://localhost:8080

# Test API endpoint
curl http://localhost:8080/api/message

# Expected response:
# {"message":"ok","success":true}
```

---

## Google Cloud Platform Setup

### 1. Create GCP Project

```bash
# Create new project
gcloud projects create cultivo-project --name="Cultivo"

# Set as active project
gcloud config set project cultivo-project

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

### 2. Create Artifact Registry

```bash
# Create Docker repository
gcloud artifacts repositories create cloud-run-source-deploy \
  --repository-format=docker \
  --location=asia-southeast1 \
  --description="Docker images for Cultivo"

# Configure Docker authentication
gcloud auth configure-docker asia-southeast1-docker.pkg.dev
```

### 3. Set Up Cloud Build

**File:** `/cloudbuild.yaml`

```yaml
steps:
  # Build the container image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build',
       '--build-arg', 'REACT_APP_GOOGLE_MAPS_API_KEY=${_REACT_APP_GOOGLE_MAPS_API_KEY}',
       '--build-arg', 'MONGODB_URI=${_MONGODB_URI}',
       '-t', '${_AR_HOSTNAME}/${PROJECT_ID}/${_AR_REPOSITORY}/${_SERVICE_NAME}:latest',
       '.']

  # Push the container image to Artifact Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', '${_AR_HOSTNAME}/${PROJECT_ID}/${_AR_REPOSITORY}/${_SERVICE_NAME}:latest']

substitutions:
  _AR_HOSTNAME: asia-southeast1-docker.pkg.dev
  _AR_REPOSITORY: cloud-run-source-deploy
  _SERVICE_NAME: cultivo-capstone
  _MONGODB_URI: ${_MONGODB_URI}
  _REACT_APP_GOOGLE_MAPS_API_KEY: ""

images:
  - '${_AR_HOSTNAME}/${PROJECT_ID}/${_AR_REPOSITORY}/${_SERVICE_NAME}:latest'
```

---

## Manual Deployment to Cloud Run

### Deploy Using Cloud Build

```bash
# Build and push image
gcloud builds submit \
  --config cloudbuild.yaml \
  --substitutions _MONGODB_URI="your_mongodb_uri",_REACT_APP_GOOGLE_MAPS_API_KEY="your_api_key"

# Deploy to Cloud Run
gcloud run deploy cultivo-capstone \
  --image asia-southeast1-docker.pkg.dev/PROJECT_ID/cloud-run-source-deploy/cultivo-capstone:latest \
  --region asia-southeast1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars MONGODB_URI="your_mongodb_uri",JWT_SECRET="your_jwt_secret"
```

**Deployment Options:**
- `--region asia-southeast1`: Server location
- `--platform managed`: Fully managed Cloud Run
- `--allow-unauthenticated`: Public access (no auth required)
- `--port 8080`: Container port
- `--set-env-vars`: Runtime environment variables

### Deploy Using gcloud run deploy (One Command)

```bash
gcloud run deploy cultivo-capstone \
  --source . \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-env-vars MONGODB_URI="your_mongodb_uri" \
  --set-build-env-vars REACT_APP_GOOGLE_MAPS_API_KEY="your_api_key"
```

**This command:**
1. Builds Docker image from source
2. Pushes to Artifact Registry
3. Deploys to Cloud Run
4. Provisions HTTPS endpoint

---

## Automated CI/CD Pipeline

### GitHub Actions Workflow

**File:** `.github/workflows/deploy.yml` (example)

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Authenticate to Google Cloud
        uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v1

      - name: Build and Deploy
        run: |
          gcloud builds submit \
            --config cloudbuild.yaml \
            --substitutions _MONGODB_URI="${{ secrets.MONGODB_URI }}",_REACT_APP_GOOGLE_MAPS_API_KEY="${{ secrets.GOOGLE_MAPS_API_KEY }}"

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy cultivo-capstone \
            --image asia-southeast1-docker.pkg.dev/${{ secrets.GCP_PROJECT_ID }}/cloud-run-source-deploy/cultivo-capstone:latest \
            --region asia-southeast1 \
            --platform managed \
            --allow-unauthenticated \
            --set-env-vars MONGODB_URI="${{ secrets.MONGODB_URI }}"
```

### GitHub Secrets Setup

Navigate to GitHub repository → Settings → Secrets and Variables → Actions

**Required Secrets:**
1. `GCP_SA_KEY` - GCP Service Account JSON key
2. `MONGODB_URI` - MongoDB connection string
3. `GOOGLE_MAPS_API_KEY` - Google Maps API key
4. `GCP_PROJECT_ID` - GCP project ID
5. `JWT_SECRET` - JWT signing secret

### Create Service Account for CI/CD

```bash
# Create service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions"

# Grant required roles
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:github-actions@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:github-actions@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudbuild.builds.editor"

gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:github-actions@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

# Create and download key
gcloud iam service-accounts keys create key.json \
  --iam-account=github-actions@PROJECT_ID.iam.gserviceaccount.com

# Copy key.json content to GCP_SA_KEY secret in GitHub
cat key.json
```

---

## MediaMTX Server Deployment (GCE)

The WebRTC streaming server runs on a **separate Compute Engine VM** (not Cloud Run).

### 1. Create Compute Engine Instance

```bash
gcloud compute instances create mediamtx-server \
  --zone=us-central1-a \
  --machine-type=e2-micro \
  --image-family=debian-12 \
  --image-project=debian-cloud \
  --boot-disk-size=10GB \
  --tags=ssh-access,rtsp-push,webrtc-server
```

### 2. Configure Firewall Rules

```bash
# Allow SSH
gcloud compute firewall-rules create allow-ssh \
  --allow=tcp:22 \
  --target-tags=ssh-access

# Allow RTSP push (from your local IP)
gcloud compute firewall-rules create allow-rtsp-push \
  --allow=tcp:8554 \
  --source-ranges=YOUR_PUBLIC_IP/32 \
  --target-tags=rtsp-push

# Allow WebRTC (HTTPS + Media)
gcloud compute firewall-rules create allow-webrtc \
  --allow=tcp:8889,udp:8000-8001 \
  --target-tags=webrtc-server

# Allow HLS (optional)
gcloud compute firewall-rules create allow-hls \
  --allow=tcp:8888 \
  --target-tags=webrtc-server
```

### 3. Install MediaMTX

```bash
# SSH into the instance
gcloud compute ssh mediamtx-server --zone=us-central1-a

# Download MediaMTX
wget https://github.com/bluenviron/mediamtx/releases/download/v1.0.0/mediamtx_v1.0.0_linux_amd64.tar.gz

# Extract
tar -xzf mediamtx_v1.0.0_linux_amd64.tar.gz

# Generate self-signed certificates
openssl req -x509 -newkey rsa:2048 -keyout server.key -out server.crt \
  -sha256 -days 3650 -nodes -subj "/CN=EXTERNAL_IP"
```

### 4. Configure MediaMTX

**File:** `mediamtx.yml`

```yaml
hls: yes
hlsAllowOrigin: '*'

webrtc: yes
webrtcAllowOrigin: '*'
webrtcICEServers:
  - "stun:stun.l.google.com:19302"
webrtcEncryption: yes
webrtcServerKey: server.key
webrtcServerCert: server.crt

paths:
  livefeed:
    # Empty block registers the path
```

### 5. Run MediaMTX as Service

```bash
# Create systemd service
sudo nano /etc/systemd/system/mediamtx.service
```

**Service File:**

```ini
[Unit]
Description=MediaMTX Server
After=network.target

[Service]
Type=simple
User=your_username
WorkingDirectory=/home/your_username
ExecStart=/home/your_username/mediamtx
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable mediamtx
sudo systemctl start mediamtx

# Check status
sudo systemctl status mediamtx
```

---

## Environment Variables Management

### Production Environment Variables

**Cloud Run Environment Variables:**

```bash
# Set environment variables
gcloud run services update cultivo-capstone \
  --region asia-southeast1 \
  --set-env-vars \
    MONGODB_URI="mongodb+srv://...",\
    JWT_SECRET="your_secret_key",\
    NODE_ENV="production"

# View current environment variables
gcloud run services describe cultivo-capstone \
  --region asia-southeast1 \
  --format="value(spec.template.spec.containers[0].env)"
```

### Secret Management (Best Practice)

**Use Secret Manager for sensitive data:**

```bash
# Create secret
echo -n "your_mongodb_uri" | gcloud secrets create mongodb-uri --data-file=-

# Grant Cloud Run access
gcloud secrets add-iam-policy-binding mongodb-uri \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Update Cloud Run to use secret
gcloud run services update cultivo-capstone \
  --region asia-southeast1 \
  --set-secrets=MONGODB_URI=mongodb-uri:latest
```

---

## Monitoring & Logging

### Cloud Run Metrics

Access metrics in GCP Console:
1. Navigate to Cloud Run
2. Select `cultivo-capstone` service
3. Click "Metrics" tab

**Key Metrics:**
- **Request count**: Number of API requests
- **Request latency**: Response time
- **Container instances**: Auto-scaling instances
- **Memory utilization**: RAM usage
- **CPU utilization**: CPU usage

---

## Cost Optimization

### Cloud Run Pricing

**Free Tier (per month):**
- 2 million requests
- 360,000 GB-seconds memory
- 180,000 vCPU-seconds

**Estimated Costs (Low Traffic):**
- Cloud Run: $0-5/month (within free tier)
- Artifact Registry: $0.10/GB storage (~$0.50/month)
- Cloud Build: 120 free builds/day (~$0/month)

**Optimization Tips:**
1. **Set minimum instances to 0**: Scale to zero when idle
2. **Use e2-micro for MediaMTX**: $7/month (cheapest VM)
3. **Use MongoDB Atlas Free Tier**: M0 Sandbox (512 MB)
4. **Set request timeout**: Lower timeout reduces idle time

```bash
# Configure Cloud Run for cost optimization
gcloud run services update cultivo-capstone \
  --region asia-southeast1 \
  --min-instances=0 \
  --max-instances=3 \
  --cpu=1 \
  --memory=512Mi \
  --timeout=60s
```

---

## Troubleshooting

### Common Issues

**1. Build Fails: Missing Build Args**

```
Error: REACT_APP_GOOGLE_MAPS_API_KEY is not set
```

**Solution:** Ensure build args are passed:

```bash
--build-arg REACT_APP_GOOGLE_MAPS_API_KEY=your_key
```

**2. Cloud Run: Service Unavailable (503)**

**Check:**
- Container logs for errors
- MONGODB_URI is set correctly
- Application is listening on port 8080

```bash
gcloud run services logs read cultivo-capstone --region asia-southeast1
```

**3. WebRTC Connection Fails**

**Check:**
- MediaMTX firewall rules (UDP 8000-8001, TCP 8889)
- Self-signed certificate accepted in browser
- FFmpeg is pushing stream to MediaMTX

**4. MongoDB Connection Timeout**

**Check:**
- MongoDB Atlas Network Access: Add `0.0.0.0/0` (or specific Cloud Run IPs)
- Connection string format: `mongodb+srv://username:password@cluster.mongodb.net/cultivo`

---

## Next Steps

- **[Features Guide](./8-FEATURES-GUIDE.md)** - Feature implementation details
