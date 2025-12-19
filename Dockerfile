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

RUN npm run build

# Build backend
FROM node:18 AS backend-builder
WORKDIR /app/backend

# Add MongoDB URI and JWT_SECRET as build arguments
ARG MONGODB_URI
ARG JWT_SECRET
ENV MONGODB_URI=$MONGODB_URI
ENV JWT_SECRET=$JWT_SECRET

COPY backend/package*.json ./
RUN npm install
COPY backend/ ./

# Create .env file for backend
RUN echo "MONGODB_URI=$MONGODB_URI" > .env && \
    echo "JWT_SECRET=$JWT_SECRET" >> .env && \
    echo "PORT=8080" >> .env

RUN npm run build

# Final image
FROM node:18-slim
WORKDIR /app

# Pass the MongoDB URI and JWT_SECRET to the final image
ARG MONGODB_URI
ARG JWT_SECRET
ENV MONGODB_URI=$MONGODB_URI
ENV JWT_SECRET=$JWT_SECRET
ENV PORT=8080

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