import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI as string;

export const connectDb = async (): Promise<void> => {
    await mongoose.connect(MONGO_URI);
    console.log('Database connected successfully');
}