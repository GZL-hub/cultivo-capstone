import { Request, Response } from 'express';
import User, { IUser } from '../models/User';

/**
 * Get user profile by ID
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

/**
 * Update user profile
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const { name, email, phone, role } = req.body;
    
    // Make sure we don't allow password updates through this endpoint
    // Create an object with only the allowed fields
    const updateData: Partial<IUser> = {};
    
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (role) updateData.role = role;
    
    // Add updatedAt timestamp
    updateData.updatedAt = new Date();
    
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error in updateUser:', error);
    
    // Check for duplicate email error
    if ((error as any).code === 11000) {
      res.status(400).json({ success: false, error: 'Email already in use' });
      return;
    }
    
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

/**
 * Update user avatar
 */
export const updateAvatar = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const { avatarUrl } = req.body;
    
    if (!avatarUrl) {
      res.status(400).json({ success: false, error: 'Avatar URL is required' });
      return;
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { avatarUrl, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: { avatarUrl: user.avatarUrl },
      message: 'Avatar updated successfully'
    });
  } catch (error) {
    console.error('Error in updateAvatar:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

/**
 * Change password
 */
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      res.status(400).json({ 
        success: false, 
        error: 'Current password and new password are required' 
      });
      return;
    }
    
    // Find user with password field included
    const user = await User.findById(userId);
    
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      res.status(400).json({ success: false, error: 'Current password is incorrect' });
      return;
    }
    
    // Set new password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Error in changePassword:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

/**
 * Delete user account
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    
    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};