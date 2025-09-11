import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001; // Try a different port

// Very permissive CORS setup
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Debug every request
app.use((req, res, next) => {
  console.log(`REQUEST: ${req.method} ${req.path}`);
  console.log(`Headers:`, req.headers);
  next();
});

// Simple API route with no restrictions
app.get('/api/message', (req, res) => {
  console.log('Message endpoint accessed');
  res.status(200).json({ message: 'ok', success: true });
});

// Root route
app.get('/', (req, res) => {
  res.send('API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});