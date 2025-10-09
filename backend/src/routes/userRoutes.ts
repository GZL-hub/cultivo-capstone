import express from 'express';
import * as userController from '../controllers/userController';

const router = express.Router();

// Get user profile
router.get('/:id', userController.getUserById);

// Update user profile
router.put('/:id', userController.updateUser);

// Update user avatar
router.put('/:id/avatar', userController.updateAvatar);

// Change password
router.put('/:id/password', userController.changePassword);

// Delete user account
router.delete('/:id', userController.deleteUser);

export default router;