# Multi-stage build for both frontend and backend

# Build frontend
FROM node:20 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm install

# Copy the frontend code
COPY frontend/ ./

# Set API key as environment variable for build
ARG REACT_APP_GOOGLE_MAPS_API_KEY
ENV REACT_APP_GOOGLE_MAPS_API_KEY=$REACT_APP_GOOGLE_MAPS_API_KEY

RUN npm run build

# Build backend
FROM node:20 AS backend-builder
WORKDIR /app/backend

# Add MongoDB URI as build argument
ARG MONGODB_URI
ENV MONGODB_URI=$MONGODB_URI

COPY backend/package*.json ./
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm install
COPY backend/ ./

# Create .env file for backend
RUN echo "MONGODB_URI=$MONGODB_URI" > .env

RUN npm run build

# Final image
FROM node:20-slim
WORKDIR /app

# Pass the MongoDB URI to the final image
ARG MONGODB_URI
ENV MONGODB_URI=$MONGODB_URI

# Copy backend build
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/package*.json ./
COPY --from=backend-builder /app/backend/.env ./

# Install production dependencies only with retry logic
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm install --only=production

# Copy frontend build to be served by the backend
COPY --from=frontend-builder /app/frontend/build ./public

# Expose the port that Cloud Run will use
EXPOSE 8080

# Start the server
CMD ["node", "dist/index.js"]