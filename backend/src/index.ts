import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path'; // Add this import
import connectDB from './config/database';
import authRoutes from './routes/authRoutes';
import farmRoutes from './routes/farmRoutes';

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());

// Configure CORS - using a permissive configuration for development
app.use(cors({
  origin: '*', // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Connect to MongoDB
connectDB()
  .then(() => {
    console.log('MongoDB connection established');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

// API Routes - these must come BEFORE static file handling
app.use('/api/auth', authRoutes);
app.use('/api/farms', farmRoutes);

// IMPORTANT: Serve static frontend files from the build directory
app.use(express.static(path.join(__dirname, '../../frontend/build')));

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/build/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});