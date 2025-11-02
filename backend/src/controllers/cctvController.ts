import { Request, Response } from 'express';
import CCTV, { ICCTV } from '../models/CCTV';
import Farm from '../models/Farm';
import mongoose from 'mongoose';

// Get all CCTV devices for a specific farm
export const getCCTVs = async (req: Request, res: Response): Promise<void> => {
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

    // Get CCTVs with optional filtering
    const { status, search } = req.query;
    let query: any = { farmId };

    // Add status filter if provided
    if (status && ['online', 'offline'].includes(status as string)) {
      query.status = status;
    }

    // Add search functionality
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { name: searchRegex },
        { type: searchRegex }
      ];
    }

    const cctvs = await CCTV.find(query).sort({ name: 1 });
    res.status(200).json(cctvs);
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ message: 'Error fetching CCTV devices', error: err.message });
  }
};

// Get a single CCTV device by ID
export const getCCTVById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { farmId, cctvId } = req.params;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(farmId) || !mongoose.Types.ObjectId.isValid(cctvId)) {
      res.status(400).json({ message: 'Invalid ID format' });
      return;
    }

    // Find CCTV by ID and farmId for security
    const cctv = await CCTV.findOne({
      _id: cctvId,
      farmId: farmId
    });

    if (!cctv) {
      res.status(404).json({ message: 'CCTV device not found' });
      return;
    }

    res.status(200).json(cctv);
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ message: 'Error fetching CCTV device', error: err.message });
  }
};

// Create a new CCTV device
export const createCCTV = async (req: Request, res: Response): Promise<void> => {
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

    const { name, type, streamUrl, status } = req.body;

    // Basic validation
    if (!name || !type || !streamUrl) {
      res.status(400).json({ message: 'Name, type, and stream URL are required fields' });
      return;
    }

    const newCCTV = new CCTV({
      name,
      type,
      streamUrl,
      status: status || 'offline',
      farmId
    });

    const savedCCTV = await newCCTV.save();
    res.status(201).json(savedCCTV);
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ message: 'Error creating CCTV device', error: err.message });
  }
};

// Update an existing CCTV device
export const updateCCTV = async (req: Request, res: Response): Promise<void> => {
  try {
    const { farmId, cctvId } = req.params;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(farmId) || !mongoose.Types.ObjectId.isValid(cctvId)) {
      res.status(400).json({ message: 'Invalid ID format' });
      return;
    }

    const { name, type, streamUrl, status } = req.body;

    // Find and update CCTV
    const cctv = await CCTV.findOneAndUpdate(
      { _id: cctvId, farmId: farmId },
      { name, type, streamUrl, status },
      { new: true, runValidators: true }
    );

    if (!cctv) {
      res.status(404).json({ message: 'CCTV device not found' });
      return;
    }

    res.status(200).json(cctv);
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ message: 'Error updating CCTV device', error: err.message });
  }
};

// Delete a CCTV device
export const deleteCCTV = async (req: Request, res: Response): Promise<void> => {
  try {
    const { farmId, cctvId } = req.params;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(farmId) || !mongoose.Types.ObjectId.isValid(cctvId)) {
      res.status(400).json({ message: 'Invalid ID format' });
      return;
    }

    // Find and delete CCTV
    const cctv = await CCTV.findOneAndDelete({ _id: cctvId, farmId: farmId });

    if (!cctv) {
      res.status(404).json({ message: 'CCTV device not found' });
      return;
    }

    res.status(200).json({ message: 'CCTV device deleted successfully' });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ message: 'Error deleting CCTV device', error: err.message });
  }
};
