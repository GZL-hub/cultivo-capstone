import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import farmRoutes from './routes/farmRoutes';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import workerRoutes from './routes/workerRoutes';
import cctvRoutes from './routes/cctvRoutes';
import sensorRoutes from './routes/sensorRoutes';

// Load environment variables
dotenv.config();

// Initialize express
const app = express();
// Create HTTP server
const httpServer = createServer(app);
// Use the PORT environment variable that Cloud Run provides (defaults to 8080)
const PORT = process.env.PORT || 8080;

// Initialize Socket.IO
export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/farms', farmRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/cctvs', cctvRoutes);
app.use('/api', sensorRoutes);

// Basic route for testing
app.get('/api/message', (req, res) => {
  console.log('Message endpoint accessed');
  res.status(200).json({ message: 'ok', success: true });
});

// IMPORTANT: Serve static frontend files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // Join room for specific farm
  socket.on('join-farm', (farmId: string) => {
    socket.join(`farm-${farmId}`);
    console.log(`[Socket.IO] Socket ${socket.id} joined farm-${farmId}`);
    console.log(`[Socket.IO] Clients in farm-${farmId}:`, io.sockets.adapter.rooms.get(`farm-${farmId}`)?.size || 0);
  });

  // Leave farm room
  socket.on('leave-farm', (farmId: string) => {
    socket.leave(`farm-${farmId}`);
    console.log(`[Socket.IO] Socket ${socket.id} left farm-${farmId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Start server with Socket.IO support
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO enabled for real-time updates`);
});