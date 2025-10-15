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

const router = express.Router();

// Make these routes public for development
router.route('/')
  .get(getAllFarms)
  .post(createFarm);

router.route('/:id')
  .get(getFarmById)
  .put(updateFarm)
  .delete(deleteFarm);

// Farm boundary specific routes
router.route('/:id/boundary')
  .get(getFarmBoundary)
  .put(updateFarmBoundary);

// Nested routes for workers 
router.use('/:farmId/workers', workerRoutes);


export default router;