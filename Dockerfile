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

# Debug - Use a safer approach to check if the key exists
RUN if [ -n "$REACT_APP_GOOGLE_MAPS_API_KEY" ]; then \
      echo "API Key is present (not showing for security)"; \
    else \
      echo "WARNING: API Key is NOT present"; \
    fi

# Create the .env file
RUN echo "REACT_APP_GOOGLE_MAPS_API_KEY=$REACT_APP_GOOGLE_MAPS_API_KEY" > .env

# Debug - Verify .env file was created without exposing the key
RUN grep -q "REACT_APP_GOOGLE_MAPS_API_KEY" .env && echo "API key is in .env file" || echo "API key is MISSING from .env file"

RUN npm run build

# Build backend
FROM node:18 AS backend-builder
WORKDIR /app/backend

# Add MongoDB URI as build argument
ARG MONGODB_URI
ENV MONGODB_URI=$MONGODB_URI

COPY backend/package*.json ./
RUN npm install
COPY backend/ ./

# Create .env file for backend with MongoDB URI
RUN echo "MONGODB_URI=$MONGODB_URI" > .env

# Debug - Verify MongoDB URI is set (safely)
RUN if grep -q "MONGODB_URI=" .env; then \
      echo "MongoDB URI is in .env file"; \
    else \
      echo "WARNING: MongoDB URI is MISSING from .env file"; \
    fi

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