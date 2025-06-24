import express from 'express';
import cors from 'cors';
import ocrRoutes from './routes/ocrRoutes';
import { connectDB } from './config/db';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/ocr', ocrRoutes);

connectDB();

export default app;