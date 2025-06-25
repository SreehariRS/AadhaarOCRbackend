import express from 'express';
import cors from 'cors';
import ocrRoutes from './routes/ocrRoutes';
import { connectDB } from './config/db';
import dotenv from 'dotenv';


const app = express();
dotenv.config()

app.use(cors({
    origin:process.env.ORIGIN_URI,
    credentials:true
}));
app.use(express.json());
app.use('/api/ocr', ocrRoutes);

connectDB();

export default app;