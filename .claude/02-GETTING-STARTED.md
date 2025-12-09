# Getting Started Guide

## Prerequisites

| Software | Minimum Version | Purpose |
|----------|----------------|---------|
| **Node.js** | 16.x or higher | JavaScript runtime |
| **npm** | 8.x or higher | Package manager |
| **Git** | 2.x or higher | Version control |
| **MongoDB** | 5.x or higher | Database (or use Atlas) |

### Optional Tools
- Docker (containerized development)
- MongoDB Compass (database GUI)
- Postman/Thunder Client (API testing)

## Project Setup

### 1. Clone Repository
Clone and navigate to project directory.

### 2. Install Dependencies
Install for both backend and frontend directories using `npm install`.

## Environment Configuration

### Backend Environment Variables
Create `.env` in `/backend` directory:

```env
MONGODB_URI=mongodb://localhost:27017/cultivo
PORT=8080
JWT_SECRET=your_secret_key
NODE_ENV=development
```

For MongoDB Atlas, use `mongodb+srv://` connection string format.

### Frontend Environment Variables
Create `.env` in `/frontend` directory:

```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
REACT_APP_API_URL=http://localhost:8080
```

### MongoDB Setup
- **Local:** Install and run MongoDB locally
- **Atlas:** Create M0 cluster, configure network access (0.0.0.0/0 for development), create database user, copy connection string

## Running the Application

### Development Mode
Run three terminal windows:

**Terminal 1 - Backend:**
- Navigate to `backend/`
- Run `npm run dev`
- Server runs on port 8080
- Auto-reload with nodemon

**Terminal 2 - Frontend:**
- Navigate to `frontend/`
- Run `npm start`
- Opens browser to `http://localhost:3000`

**Terminal 3 - Tailwind (optional):**
- Navigate to `frontend/`
- Run `npm run tailwind`

## Production Build

### Build Commands
- **Backend:** `npm run build` (outputs to `dist/`)
- **Frontend:** `npm run build` (outputs to `build/`)

### Run Production
- Backend: `npm start` (runs compiled code)
- Frontend: Use `serve` package or web server

## Docker Development

### Build Image
Build with required build args for Google Maps API key and MongoDB URI.

### Run Container
Expose port 8080, pass environment variables for MongoDB URI and JWT secret.

## Useful Commands

### Backend
- `npm run dev` - Development with auto-reload
- `npm run build` - Compile TypeScript
- `npm start` - Run production build

### Frontend
- `npm start` - Development server (port 3000)
- `npm run build` - Production build
- `npm run tailwind` - Watch Tailwind CSS

## Code Style
- **TypeScript:** Strict mode enabled
- **Components:** PascalCase (e.g., `FarmMap.tsx`)
- **Services:** camelCase with Service suffix (e.g., `farmService.tsx`)
- **Routes:** kebab-case (e.g., `/farm-management`)
- **API endpoints:** kebab-case with plurals (e.g., `/api/farms`)
