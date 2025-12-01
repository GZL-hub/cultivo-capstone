import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

export const generateToken = (user: IUser): string => {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email,
      name: user.name 
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      console.error('❌ JWT Error: Token expired at', error.expiredAt);
    } else if (error.name === 'JsonWebTokenError') {
      console.error('❌ JWT Error: Invalid token -', error.message);
    } else {
      console.error('❌ JWT Error:', error.message);
    }
    return null;
  }
};