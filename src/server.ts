import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import ocrRoutes from './routes/ocrRoutes';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGO_URI || 'mongodb+srv://sreehari:sreehari@cluster0.r62c4vt.mongodb.net/';

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory:', uploadsDir);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend server is running', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/ocr', ocrRoutes);

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('🛑 Global error handler:', error);
  res.status(500).json({
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Start server and connect MongoDB
if (process.env.SKIP_MONGODB === 'true') {
  console.warn('⚠️  Skipping MongoDB connection');
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} (without MongoDB)`);
  });
} else {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('✅ Connected to MongoDB');
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error('❌ MongoDB connection error:', error);
      console.warn('⚠️  Starting server without MongoDB...');
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT} (MongoDB connection failed)`);
      });
    });
}

export default app;
