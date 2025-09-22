import { Request, Response } from 'express';
import Farm, { IFarm } from '../models/Farm';

// Get all farms
export const getFarms = async (req: Request, res: Response): Promise<void> => {
  try {
    const farms = await Farm.find();
    res.status(200).json({
      success: true,
      count: farms.length,
      data: farms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get single farm
export const getFarm = async (req: Request, res: Response): Promise<void> => {
  try {
    const farm = await Farm.findById(req.params.id);
    
    if (!farm) {
      res.status(404).json({
        success: false,
        error: 'Farm not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: farm
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Create new farm
export const createFarm = async (req: Request, res: Response): Promise<void> => {
  try {
    const farm = await Farm.create(req.body);
    
    res.status(201).json({
      success: true,
      data: farm
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'ValidationError') {
      const messages = Object.values((error as any).errors).map(val => (val as any).message);
      
      res.status(400).json({
        success: false,
        error: messages
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};

// Update farm
export const updateFarm = async (req: Request, res: Response): Promise<void> => {
  try {
    const farm = await Farm.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!farm) {
      res.status(404).json({
        success: false,
        error: 'Farm not found'
      });
      return;
    }
    
    res.status(200).json({
      success: true,
      data: farm
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Delete farm
export const deleteFarm = async (req: Request, res: Response): Promise<void> => {
  try {
    const farm = await Farm.findById(req.params.id);
    
    if (!farm) {
      res.status(404).json({
        success: false,
        error: 'Farm not found'
      });
      return;
    }
    
    await farm.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};