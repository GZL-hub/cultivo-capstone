# Backend Dockerfile
FROM node:18

WORKDIR /app

# Define the MongoDB URI build arg
ARG MONGODB_URI
ENV MONGODB_URI=$MONGODB_URI

COPY package*.json ./
RUN npm install
COPY . ./

# Create or update .env file with MongoDB URI
RUN echo "MONGODB_URI=$MONGODB_URI" > .env

RUN npm run build

EXPOSE 3001
CMD ["node", "dist/index.js"]