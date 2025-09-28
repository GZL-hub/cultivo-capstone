import express from 'express';
import { 
  getAllFarms, 
  getFarmById, 
  createFarm, 
  updateFarm, 
  deleteFarm,
  getFarmBoundary,
  updateFarmBoundary
} from '../controllers/farmController';

const router = express.Router();

// Protect all routes
// router.use(protect);

// Farm CRUD routes
router.route('/')
  .get(getAllFarms)
  .post(createFarm);

router.route('/:id')
  .get(getFarmById)
  .put(updateFarm)
  .delete(deleteFarm);

// Farm boundary polygon routes
router.route('/:id/boundary')
  .get(getFarmBoundary)
  .put(updateFarmBoundary);

export default router;