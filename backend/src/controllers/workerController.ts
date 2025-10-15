import { Request, Response } from 'express';
import Worker, { IWorker } from '../models/Worker';
import Farm from '../models/Farm';
import mongoose from 'mongoose';

// Type for MongoDB errors with code property
interface MongoError extends Error {
  code?: number;
}

// Get all workers for a specific farm
export const getWorkers = async (req: Request, res: Response): Promise<void> => {
  try {
    const farmId = req.params.farmId;
    
    // Validate farmId
    if (!mongoose.Types.ObjectId.isValid(farmId)) {
      res.status(400).json({ message: 'Invalid farm ID format' });
      return;
    }
    
    // Check if farm exists
    const farmExists = await Farm.findById(farmId);
    if (!farmExists) {
      res.status(404).json({ message: 'Farm not found' });
      return;
    }
    
    // Get workers with optional filtering
    const { status, search } = req.query;
    let query: any = { farmId };
    
    // Add status filter if provided
    if (status && ['active', 'inactive'].includes(status as string)) {
      query.status = status;
    }
    
    // Add search functionality
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { name: searchRegex },
        { role: searchRegex },
        { email: searchRegex }
      ];
    }
    
    const workers = await Worker.find(query).sort({ name: 1 });
    res.status(200).json(workers);
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ message: 'Error fetching workers', error: err.message });
  }
};

// Get a single worker by ID
export const getWorkerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { farmId, workerId } = req.params;
    
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(farmId)) {
      res.status(400).json({ message: 'Invalid farm ID format' });
      return;
    }
    
    // Find worker by ID and farmId for security
    const worker = await Worker.findOne({ 
      id: workerId, 
      farmId: farmId 
    });
    
    if (!worker) {
      res.status(404).json({ message: 'Worker not found' });
      return;
    }
    
    res.status(200).json(worker);
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ message: 'Error fetching worker', error: err.message });
  }
};

// Create a new worker
export const createWorker = async (req: Request, res: Response): Promise<void> => {
  try {
    const farmId = req.params.farmId;
    
    // Validate farmId
    if (!mongoose.Types.ObjectId.isValid(farmId)) {
      res.status(400).json({ message: 'Invalid farm ID format' });
      return;
    }
    
    // Check if farm exists
    const farmExists = await Farm.findById(farmId);
    if (!farmExists) {
      res.status(404).json({ message: 'Farm not found' });
      return;
    }
    
    const { name, role, email, phone, joinDate, status } = req.body;
    
    // Basic validation
    if (!name || !role) {
      res.status(400).json({ message: 'Name and role are required fields' });
      return;
    }
    
    // Generate a unique ID for the worker
    const id = new mongoose.Types.ObjectId().toString().substring(0, 8);
    
    const newWorker = new Worker({
      id,
      name,
      role,
      email,
      phone,
      joinDate: joinDate || new Date().toISOString().split('T')[0],
      status: status || 'active',
      farmId
    });
    
    const savedWorker = await newWorker.save();
    res.status(201).json(savedWorker);
  } catch (error: unknown) {
    const err = error as MongoError;
    if (err.code === 11000) {
      res.status(400).json({ message: 'Worker with this ID already exists for this farm' });
      return;
    }
    res.status(500).json({ message: 'Error creating worker', error: err.message });
  }
};

// Update an existing worker
export const updateWorker = async (req: Request, res: Response): Promise<void> => {
  try {
    const { farmId, workerId } = req.params;
    
    // Validate farmId
    if (!mongoose.Types.ObjectId.isValid(farmId)) {
      res.status(400).json({ message: 'Invalid farm ID format' });
      return;
    }
    
    const { name, role, email, phone, joinDate, status } = req.body;
    
    // Find and update worker
    const worker = await Worker.findOneAndUpdate(
      { id: workerId, farmId: farmId },
      { name, role, email, phone, joinDate, status },
      { new: true, runValidators: true }
    );
    
    if (!worker) {
      res.status(404).json({ message: 'Worker not found' });
      return;
    }
    
    res.status(200).json(worker);
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ message: 'Error updating worker', error: err.message });
  }
};

// Delete a worker
export const deleteWorker = async (req: Request, res: Response): Promise<void> => {
  try {
    const { farmId, workerId } = req.params;
    
    // Validate farmId
    if (!mongoose.Types.ObjectId.isValid(farmId)) {
      res.status(400).json({ message: 'Invalid farm ID format' });
      return;
    }
    
    // Find and delete worker
    const worker = await Worker.findOneAndDelete({ id: workerId, farmId: farmId });
    
    if (!worker) {
      res.status(404).json({ message: 'Worker not found' });
      return;
    }
    
    res.status(200).json({ message: 'Worker deleted successfully' });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ message: 'Error deleting worker', error: err.message });
  }
};