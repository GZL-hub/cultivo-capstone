import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import farmRoutes from './routes/farmRoutes';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';

// Load environment variables
dotenv.config();

// Initialize express
const app = express();
const PORT = process.env.PORT || 5000;

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
app.use('/api/users', userRoutes); // Add this

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Cultivo API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});