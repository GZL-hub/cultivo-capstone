import express from 'express';
import {
  getAlertsByFarm,
  getAlertById,
  createAlert,
  markAlertAsRead,
  markAlertsAsRead,
  resolveAlert,
  deleteAlert,
  getAlertStats
} from '../controllers/alertController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Farm-level routes (get all alerts for a farm)
router.get('/farms/:farmId/alerts', protect, getAlertsByFarm);
router.post('/farms/:farmId/alerts', protect, createAlert);
router.post('/farms/:farmId/alerts/mark-read', protect, markAlertsAsRead);
router.get('/farms/:farmId/alerts/stats', protect, getAlertStats);

// Alert-level routes
router.get('/alerts/:alertId', protect, getAlertById);
router.patch('/alerts/:alertId/read', protect, markAlertAsRead);
router.patch('/alerts/:alertId/resolve', protect, resolveAlert);
router.delete('/alerts/:alertId', protect, deleteAlert);

export default router;
