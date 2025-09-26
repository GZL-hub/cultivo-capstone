// Use this script to reset the password (REMOVE DURING PRODUCTION)
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import connectDB from '../config/database';

dotenv.config();

const resetUserPassword = async () => {
  try {
    await connectDB();
    
    // Check if connection is established and db is available
    if (!mongoose.connection || !mongoose.connection.db) {
      console.error('Database connection not established');
      process.exit(1);
    }
    
    // Connect to the users collection directly
    const db = mongoose.connection.db;
    console.log(`Connected to database: ${db.databaseName}`);
    const usersCollection = db.collection('users');
    
    // New password to set
    const newPassword = 'password123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update the user with email user@farm.com
    const result = await usersCollection.updateOne(
      { email: 'user@farm.com' },
      { $set: { password: hashedPassword } }
    );
    
    if (result.modifiedCount > 0) {
      console.log('Password updated successfully');
      console.log('Email: user@farm.com');
      console.log('New password: password123');
      console.log('New hash:', hashedPassword);
    } else {
      console.log('User not found or password not updated');
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error resetting password:', error);
  }
};

resetUserPassword();