# Multi-stage build for both frontend and backend

# Build frontend
FROM node:18 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install

# Copy the frontend code
COPY frontend/ ./

# Set API key as environment variable for build
ARG REACT_APP_GOOGLE_MAPS_API_KEY
ENV REACT_APP_GOOGLE_MAPS_API_KEY=$REACT_APP_GOOGLE_MAPS_API_KEY

# Verify API key is set before building
RUN if [ -z "$REACT_APP_GOOGLE_MAPS_API_KEY" ]; then \
      echo "❌ ERROR: REACT_APP_GOOGLE_MAPS_API_KEY is not set!"; \
      exit 1; \
    else \
      echo "✅ Building with API key (length: ${#REACT_APP_GOOGLE_MAPS_API_KEY})"; \
    fi

RUN npm run build

# Verify the API key was embedded in the build
RUN if grep -r "REACT_APP_GOOGLE_MAPS_API_KEY" build/ 2>/dev/null | grep -v "node_modules" | head -1; then \
      echo "⚠️ WARNING: Found literal env var name in build - API key may not be embedded!"; \
    fi

# Build backend
FROM node:18 AS backend-builder
WORKDIR /app/backend

# Add MongoDB URI as build argument
ARG MONGODB_URI
ENV MONGODB_URI=$MONGODB_URI

COPY backend/package*.json ./
RUN npm install
COPY backend/ ./

# Create .env file for backend
RUN echo "MONGODB_URI=$MONGODB_URI" > .env

RUN npm run build

# Final image
FROM node:18-slim
WORKDIR /app

# Pass the MongoDB URI to the final image
ARG MONGODB_URI
ENV MONGODB_URI=$MONGODB_URI

# Copy backend build
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/package*.json ./
COPY --from=backend-builder /app/backend/.env ./

# Install production dependencies only
RUN npm install --only=production

# Copy frontend build to be served by the backend
COPY --from=frontend-builder /app/frontend/build ./public

# Expose the port that Cloud Run will use
EXPOSE 8080

# Start the server
CMD ["node", "dist/index.js"]