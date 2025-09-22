import express from 'express';
import cors from 'cors';
import path from 'path';
import 'dotenv/config';
import { connectDB } from './mongo/db';
import farmRoutes from './routes/farmRoutes';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Connect to MongoDB before starting the server
connectDB();

// API routes
app.use('/api/farms', farmRoutes);

app.get('/api/message', (req, res) => {
  console.log('Message endpoint accessed');
  res.status(200).json({ message: 'ok', success: true });
});

app.use(express.static(path.join(__dirname, '../public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});