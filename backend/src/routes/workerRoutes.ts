import express from 'express';
import { getWorkers, getWorkerById, createWorker, updateWorker, deleteWorker } from '../controllers/workerController';

const router = express.Router({ mergeParams: true });

// Get all workers for a farm
router.get('/', getWorkers);

// Get a single worker
router.get('/:workerId', getWorkerById);

// Create a new worker
router.post('/', createWorker);

// Update a worker
router.put('/:workerId', updateWorker);

// Delete a worker
router.delete('/:workerId', deleteWorker);

export default router;