import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import connectDB from './config/database';
import farmRoutes from './routes/farmRoutes';
import authRoutes from './routes/authRoutes'; // Add this import

// Load environment variables
dotenv.config();

const app = express();
// Use the PORT environment variable that Cloud Run provides (defaults to 8080)
const PORT = process.env.PORT || 8080;

// Connect to MongoDB
connectDB();

// CORS setup
app.use(cors());

// JSON middleware
app.use(express.json());

// API routes
app.use('/api/farms', farmRoutes);
app.use('/api/auth', authRoutes); // Add this line for authentication routes

app.get('/api/message', (req, res) => {
  console.log('Message endpoint accessed');
  res.status(200).json({ message: 'ok', success: true });
});

// IMPORTANT: Serve static frontend files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/public/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});