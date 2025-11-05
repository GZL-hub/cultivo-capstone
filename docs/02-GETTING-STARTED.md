# Getting Started Guide

## Prerequisites

Before you begin, ensure you have the following installed on your development machine:

### Required Software

| Software | Minimum Version | Download Link | Purpose |
|----------|----------------|---------------|---------|
| **Node.js** | 16.x or higher | [nodejs.org](https://nodejs.org/) | JavaScript runtime |
| **npm** | 8.x or higher | Included with Node.js | Package manager |
| **Git** | 2.x or higher | [git-scm.com](https://git-scm.com/) | Version control |
| **MongoDB** | 5.x or higher | [mongodb.com](https://www.mongodb.com/try/download/community) | Database (or use Atlas) |

### Optional Tools

- **Docker**: For containerized development and deployment
- **MongoDB Compass**: GUI for MongoDB database management
- **Postman/Thunder Client**: API testing tools
- **VS Code**: Recommended IDE with TypeScript support

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

### Obtaining Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API (optional)
4. Create credentials (API Key)
5. Add API key restrictions (HTTP referrers for production)
6. Copy the API key to your `.env` file

### MongoDB Setup

#### Option 1: Local MongoDB

```bash
# Install MongoDB Community Edition
# On macOS with Homebrew:
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Verify MongoDB is running
mongosh
```

#### Option 2: MongoDB Atlas (Cloud)

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

**Expected Output:**
```
Compiled successfully!

You can now view frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.x:3000
```

The frontend will:
- Run on `http://localhost:3000`
- Auto-reload on code changes (hot module replacement)
- Proxy API requests to `http://localhost:8080` (configured in package.json)

#### Terminal 3: Tailwind CSS Watch (Optional)

```bash
cd frontend
npm run tailwind
```

**Expected Output:**
```
Rebuilding...
Done in 45ms.
```

This watches for CSS changes and recompiles Tailwind classes. Only needed if modifying styles.

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

## Common Issues & Troubleshooting

### Issue: MongoDB Connection Error

**Error:**
```
MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
- Verify MongoDB is running: `brew services list` (macOS) or `systemctl status mongod` (Linux)
- Check `MONGODB_URI` in `backend/.env`
- Try connecting with MongoDB Compass to verify connection string

### Issue: Google Maps Not Loading

**Error:**
```
Error loading maps. Please check the API key and network connection.
```

**Solution:**
- Verify `REACT_APP_GOOGLE_MAPS_API_KEY` is set in `frontend/.env`
- Ensure Maps JavaScript API is enabled in Google Cloud Console
- Restart the frontend dev server after adding/changing `.env`

### Issue: API Requests Failing

**Error:**
```
Network Error / CORS Error
```

**Solution:**
- Verify backend is running on port 8080
- Check `proxy` setting in `frontend/package.json` (should be `"http://localhost:8080"`)
- Clear browser cache and restart dev servers

### Issue: Port Already in Use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::8080
```

**Solution:**
```bash
# Find process using the port
lsof -i :8080        # macOS/Linux
netstat -ano | findstr :8080   # Windows

# Kill the process
kill -9 <PID>        # macOS/Linux
taskkill /PID <PID> /F   # Windows

# Or change port in backend/.env
PORT=8081
```

### Issue: TypeScript Compilation Errors

**Error:**
```
Error: Cannot find module '@types/...'
```

**Solution:**
```bash
# Reinstall dependencies
cd backend  # or frontend
rm -rf node_modules package-lock.json
npm install
```

## Development Workflow

### Making Changes

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** in the appropriate directory (frontend or backend)

3. **Test your changes:**
   ```bash
   # Run frontend tests
   cd frontend
   npm test
   ```

4. **Commit your changes:**
   ```bash
   git add .
   git commit -m "feat: description of your changes"
   ```

5. **Push and create a pull request:**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Style

- **TypeScript**: Follow TSConfig settings (strict mode enabled)
- **Formatting**: Prettier recommended (install ESLint + Prettier extensions in VS Code)
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
