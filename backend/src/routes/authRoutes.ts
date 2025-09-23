import { Router } from 'express';
import { login, register, getMe } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', protect, getMe);

export default router;