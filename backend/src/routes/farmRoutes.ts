import express from 'express';
import {
  getAllFarms,
  getFarmById,
  createFarm,
  updateFarm,
  deleteFarm,
  getFarmBoundary,
  updateFarmBoundary,
} from '../controllers/farmController';
import workerRoutes from './workerRoutes';
import cctvRoutes from './cctvRoutes';
import { protect } from '../middleware/auth';

const router = express.Router();

// All farm routes require authentication
router.route('/')
  .get(protect, getAllFarms)
  .post(protect, createFarm);

router.route('/:id')
  .get(protect, getFarmById)
  .put(protect, updateFarm)
  .delete(protect, deleteFarm);

// Farm boundary specific routes
router.route('/:id/boundary')
  .get(protect, getFarmBoundary)
  .put(protect, updateFarmBoundary);

// Nested routes for workers (protect middleware applied)
router.use('/:farmId/workers', protect, workerRoutes);

// Nested routes for CCTV devices (protect middleware applied)
router.use('/:farmId/cctvs', protect, cctvRoutes);


export default router;