import express from 'express';
import { getFarms, getFarmById } from '../controller/farmController';
const router = express.Router();

router.get('/', getFarms);
router.get('/:id', getFarmById);

export default router;