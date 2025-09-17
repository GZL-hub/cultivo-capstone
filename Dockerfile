# Multi-stage build for both frontend and backend

# Build frontend
FROM node:18 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install

# Copy the frontend code first
COPY frontend/ ./

# Then create .env file to override any committed .env file
ARG REACT_APP_GOOGLE_MAPS_API_KEY
# Debug - Print first few characters to verify key is passed
RUN echo "API Key starts with: ${REACT_APP_GOOGLE_MAPS_API_KEY:0:4}..."
RUN echo "REACT_APP_GOOGLE_MAPS_API_KEY=$REACT_APP_GOOGLE_MAPS_API_KEY" > .env
# Debug - Verify .env file was created with content
RUN cat .env

RUN npm run build

# Build backend
FROM node:18 AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
RUN npm run build

# Final image
FROM node:18-slim
WORKDIR /app

# Copy backend build
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/package*.json ./

# Install production dependencies only
RUN npm install --only=production

# Copy frontend build to be served by the backend
COPY --from=frontend-builder /app/frontend/build ./public

# Expose the port that Cloud Run will use
EXPOSE 8080

# Start the server
CMD ["node", "dist/index.js"]