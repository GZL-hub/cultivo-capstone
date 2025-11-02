import express from 'express';
import { getCCTVs, getCCTVById, createCCTV, updateCCTV, deleteCCTV } from '../controllers/cctvController';

const router = express.Router({ mergeParams: true });

// Get all CCTV devices for a farm
router.get('/', getCCTVs);

// Get a single CCTV device
router.get('/:cctvId', getCCTVById);

// Create a new CCTV device
router.post('/', createCCTV);

// Update a CCTV device
router.put('/:cctvId', updateCCTV);

// Delete a CCTV device
router.delete('/:cctvId', deleteCCTV);

export default router;
