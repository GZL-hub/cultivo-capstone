# Getting Started Guide

## Prerequisites
### Required Software

| Software | Minimum Version | Purpose |
|----------|----------------|---------------|---------|
| **Node.js** | 16.x or higher | JavaScript runtime |
| **npm** | 8.x or higher | Package manager |
| **Git** | 2.x or higher | Version control |
| **MongoDB** | 5.x or higher | Database (or use Atlas) |

### Optional Tools

- **Docker**: For containerized development and deployment
- **MongoDB Compass**: GUI for MongoDB database management
- **Postman/Thunder Client**: API testing tools

## Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/cultivo-capstone.git
cd cultivo-capstone
```

### 2. Install Dependencies

The project uses a monorepo structure. Install dependencies for both frontend and backend:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `/backend` directory:

```bash
# Navigate to backend directory
cd backend

# Create .env file
touch .env
```

Add the following configuration:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/cultivo
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cultivo?retryWrites=true&w=majority

# Server Configuration
PORT=8080                    # Optional, defaults to 8080

# Authentication
JWT_SECRET=your_secret_key   # Generate a strong random string
# Example: openssl rand -base64 32

# Node Environment
NODE_ENV=development
```

### Frontend Environment Variables

Create a `.env` file in the `/frontend` directory:

```bash
# Navigate to frontend directory
cd frontend

# Create .env file
touch .env
```

Add the following configuration:

```env
# Google Maps API Key (Required for map features)
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# API Proxy (handled by package.json proxy, but useful for production)
REACT_APP_API_URL=http://localhost:8080
```

### MongoDB Setup
#### MongoDB Atlas (Cloud)

1. Create account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free cluster (M0 Sandbox)
3. Configure network access (add your IP or 0.0.0.0/0 for development)
4. Create database user with read/write permissions
5. Get connection string from "Connect" button
6. Replace `<username>`, `<password>`, and `<cluster>` in connection string
7. Add connection string to `backend/.env` as `MONGODB_URI`

## Running the Application

### Development Mode

You'll need three terminal windows to run the full application:

#### Terminal 1: Backend Server

```bash
cd backend
npm run dev
```

**Expected Output:**
```
[nodemon] starting `ts-node src/index.ts`
Server running on port 8080
MongoDB Connected
```

The backend server will:
- Run on `http://localhost:8080`
- Auto-reload on code changes (nodemon)
- Expose API endpoints at `/api/*`

#### Terminal 2: Frontend Development Server

```bash
cd frontend
npm start
```

### Access the Application

1. Open your browser to `http://localhost:3000`
2. You should see the Cultivo login page
3. Register a new account or use existing credentials

## First-Time Setup

### 1. Create Your Account

1. Navigate to the login page
2. Click "Sign Up" or "Register"
3. Fill in:
   - Name
   - Email
   - Password (minimum 6 characters)
4. Click "Register"

### 2. Create Your First Farm

1. After login, navigate to "Farm Management" > "Overview"
2. Click "+ Add New Farm" or similar button
3. Fill in farm details:
   - Farm Name
   - Farm Type (e.g., Crop Farm, Livestock, Mixed)
   - Operation Date
   - Area Size
4. Save the farm

### 3. Draw Farm Boundary (Optional)

1. Navigate to "Farm Management" > "Map"
2. Select your farm from the dropdown
3. Click the polygon drawing tool
4. Click on the map to create boundary points
5. Complete the polygon by clicking the first point
6. Save the boundary

### 4. Add Workers (Optional)

1. Navigate to "Farm Management" > "Workers" or "Overview"
2. Click "+ Add Worker"
3. Fill in worker details:
   - Worker ID (unique per farm)
   - Name
   - Role
   - Email (optional)
   - Phone (optional)
   - Status (Active/Inactive)
4. Save the worker

## Production Build

### Build Both Applications

```bash
# Build backend
cd backend
npm run build
# Output: dist/ directory with compiled JavaScript

# Build frontend
cd frontend
npm run build
# Output: build/ directory with optimized static files
```

### Run Production Build Locally

```bash
# Start backend in production mode
cd backend
npm start

# Serve frontend build (requires serve package)
cd frontend
npx serve -s build -l 3000
```

## Docker Development

### Build Docker Image

```bash
# From project root
docker build \
  --build-arg REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key \
  --build-arg MONGODB_URI=your_mongodb_uri \
  -t cultivo:latest \
  .
```

### Run Docker Container

```bash
docker run -p 8080:8080 \
  -e MONGODB_URI=your_mongodb_uri \
  -e JWT_SECRET=your_jwt_secret \
  cultivo:latest
```

Access the application at `http://localhost:8080`

 origin feature/your-feature-name

### Code Style

- **TypeScript**: Follow TSConfig settings (strict mode enabled)
- **Naming Conventions**:
  - Components: PascalCase (e.g., `FarmMap.tsx`)
  - Services: camelCase with Service suffix (e.g., `farmService.tsx`)
  - Routes: kebab-case (e.g., `/farm-management`)
  - API endpoints: kebab-case with plurals (e.g., `/api/farms`)

## Useful Commands Reference

### Backend Commands

```bash
npm run dev          # Start development server with auto-reload
npm run build        # Compile TypeScript to JavaScript (dist/)
npm start            # Run compiled production build
npm test             # Run tests (placeholder)
```

### Frontend Commands

```bash
npm start            # Start development server (port 3000)
npm run build        # Create production build
npm test             # Run Jest tests
npm run tailwind     # Watch and compile Tailwind CSS
npm run eject        # Eject from Create React App (not recommended)
```

## Next Steps

Now that your development environment is set up, explore:

- **[Architecture Guide](./03-ARCHITECTURE.md)** - Understand system design
- **[Frontend Guide](./04-FRONTEND-GUIDE.md)** - Frontend development
- **[Backend API](./05-BACKEND-API.md)** - API endpoint reference
- **[Deployment Guide](./07-DEPLOYMENT.md)** - Deploy to production

## Getting Help

- **Check Documentation**: Review the `/docs` directory for detailed guides
- **Read Claude.md**: See `.claude/CLAUDE.md` for quick reference
- **GitHub Issues**: Report bugs or request features
- **Community**: Join the project community (if applicable)
