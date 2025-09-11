import express from 'express';
import cors from 'cors';
import path from 'path';

const app = express();
// Use the PORT environment variable that Cloud Run provides (defaults to 8080)
const PORT = process.env.PORT || 8080;

// CORS setup
app.use(cors());

// JSON middleware
app.use(express.json());

// API routes
app.get('/api/message', (req, res) => {
  console.log('Message endpoint accessed');
  res.status(200).json({ message: 'ok', success: true });
});

// Serve static frontend files (if this is a combined service)
app.use(express.static(path.join(__dirname, '../public')));

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});