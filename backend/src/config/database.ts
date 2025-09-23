import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Export the MongoDB URI for use in other files
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cultivo';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
};

export default connectDB;