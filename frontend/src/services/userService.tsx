import axios from 'axios';

const API_URL = '/api/users';

/**
 * User interface representing user data from the API
 */
export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get user profile by ID
 * @param userId User ID
 * @returns Promise with user data
 */
export const getUserById = async (userId: string): Promise<IUser> => {
  try {
    const response = await axios.get(`${API_URL}/${userId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

/**
 * Update user profile information
 * @param userId User ID
 * @param userData User data to update
 * @returns Promise with updated user data
 */
export const updateUserProfile = async (
  userId: string, 
  userData: { name?: string; email?: string; phone?: string; role?: string }
): Promise<IUser> => {
  try {
    const response = await axios.put(`${API_URL}/${userId}`, userData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Update user avatar
 * @param userId User ID
 * @param avatarUrl New avatar URL
 * @returns Promise with updated avatar URL
 */
export const updateUserAvatar = async (userId: string, avatarUrl: string): Promise<{ avatarUrl: string }> => {
  try {
    const response = await axios.put(`${API_URL}/${userId}/avatar`, { avatarUrl });
    return response.data.data;
  } catch (error) {
    console.error('Error updating avatar:', error);
    throw error;
  }
};

/**
 * Change user password
 * @param userId User ID
 * @param passwords Object containing current and new password
 * @returns Promise with success message
 */
export const changePassword = async (
  userId: string, 
  passwords: { currentPassword: string; newPassword: string }
): Promise<{ message: string }> => {
  try {
    const response = await axios.put(`${API_URL}/${userId}/password`, passwords);
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

/**
 * Delete user account
 * @param userId User ID
 * @returns Promise with success message
 */
export const deleteAccount = async (userId: string): Promise<{ message: string }> => {
  try {
    const response = await axios.delete(`${API_URL}/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting account:', error);
    throw error;
  }
};

/**
 * Get all users (admin function)
 * @returns Promise with array of users
 */
export const getAllUsers = async (): Promise<IUser[]> => {
  try {
    const response = await axios.get(API_URL);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};