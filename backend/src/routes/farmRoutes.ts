import express from 'express';
import {
  getFarms,
  getFarm,
  createFarm,
  updateFarm,
  deleteFarm
} from '../controllers/farmController';

const router = express.Router();

router.route('/')
  .get(getFarms)
  .post(createFarm);

router.route('/:id')
  .get(getFarm)
  .put(updateFarm)
  .delete(deleteFarm);

export default router;