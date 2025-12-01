import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import User from '../models/User';

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token;

    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      res.status(401).json({ success: false, message: 'Not authorized to access this route' });
      return;
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      console.error('Token verification failed. Token preview:', token.substring(0, 20) + '...');
      res.status(401).json({ success: false, message: 'Invalid token' });
      return;
    }

    console.log('✓ Token verified successfully for user:', decoded.id);

    // Add user to request object
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    (req as any).user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};