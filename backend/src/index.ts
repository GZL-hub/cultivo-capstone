import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database';
import farmRoutes from './routes/farmRoutes';

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

app.get('/api/message', (req, res) => {
  console.log('Message endpoint accessed');
  res.status(200).json({ message: 'ok', success: true });
});

// API fallback route
app.use('*', (req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'API endpoint not found' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});