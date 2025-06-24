import mongoose from 'mongoose';

     export const connectDB = async () => {
       try {
         await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://sreehari:sreehari@cluster0.r62c4vt.mongodb.net/');
         console.log('MongoDB connected');
       } catch (error) {
         console.error('MongoDB connection error:', error);
         process.exit(1);
       }
     };