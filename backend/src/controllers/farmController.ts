import { Request, Response } from 'express';
import Farm, { IFarm } from '../models/Farm';
import mongoose from 'mongoose';

// Define the coordinate type
interface Coordinate {
  lat: number;
  lng: number;
}

// Get all farms
export const getAllFarms = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if owner query parameter is provided
    const filter: any = {};
    if (req.query.owner) {
      // Convert string ID to MongoDB ObjectId
      try {
        filter.owner = new mongoose.Types.ObjectId(req.query.owner as string);
      } catch (err) {
        // If invalid ObjectId format, return empty result instead of crashing
        res.status(200).json({ success: true, data: [] });
        return;
      }
    }
    
    const farms = await Farm.find(filter);
    res.status(200).json({ success: true, data: farms });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Get single farm
export const getFarmById = async (req: Request, res: Response): Promise<void> => {
  try {
    const farm = await Farm.findById(req.params.id);
    
    if (!farm) {
      res.status(404).json({ success: false, error: 'Farm not found' });
      return;
    }
    
    res.status(200).json({ success: true, data: farm });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Create new farm
export const createFarm = async (req: Request, res: Response): Promise<void> => {
  try {
    // Ensure owner field is included in request body
    if (!req.body.owner) {
      res.status(400).json({ success: false, error: 'Owner ID is required' });
      return;
    }

    // Validate owner ID format
    if (!mongoose.Types.ObjectId.isValid(req.body.owner)) {
      res.status(400).json({ success: false, error: 'Invalid owner ID format' });
      return;
    }

    const farm = await Farm.create(req.body);
    res.status(201).json({ success: true, data: farm });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Server Error' });
    }
  }
};

// Update farm
export const updateFarm = async (req: Request, res: Response): Promise<void> => {
  try {
    // Don't allow changing the owner
    if (req.body.owner) {
      delete req.body.owner;
    }
    
    const farm = await Farm.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!farm) {
      res.status(404).json({ success: false, error: 'Farm not found' });
      return;
    }
    
    res.status(200).json({ success: true, data: farm });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Server Error' });
    }
  }
};

// Delete farm
export const deleteFarm = async (req: Request, res: Response): Promise<void> => {
  try {
    const farm = await Farm.findByIdAndDelete(req.params.id);
    
    if (!farm) {
      res.status(404).json({ success: false, error: 'Farm not found' });
      return;
    }
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Get farm boundary polygon
export const getFarmBoundary = async (req: Request, res: Response): Promise<void> => {
  try {
    const farm = await Farm.findById(req.params.id);
    
    if (!farm) {
      res.status(404).json({ success: false, error: 'Farm not found' });
      return;
    }
    
    res.status(200).json({ success: true, data: farm.farmBoundary });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Update farm boundary polygon
export const updateFarmBoundary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { coordinates, area, perimeter } = req.body;
    
    if (!coordinates) {
      res.status(400).json({ success: false, error: 'Coordinates are required' });
      return;
    }
    
    // Convert the flat array of coordinates to GeoJSON format
    const geoJsonCoordinates = [coordinates.map((coord: Coordinate) => [coord.lng, coord.lat])];
    
    // Make sure the polygon is closed
    if (geoJsonCoordinates[0].length > 0) {
      const firstPoint = geoJsonCoordinates[0][0];
      const lastPoint = geoJsonCoordinates[0][geoJsonCoordinates[0].length - 1];
      
      if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
        geoJsonCoordinates[0].push(firstPoint);
      }
    }
    
    const farm = await Farm.findByIdAndUpdate(
      req.params.id,
      {
        farmBoundary: {
          type: 'Polygon',
          coordinates: geoJsonCoordinates
        },
        areaSize: `${(area / 10000).toFixed(2)} hectares`, // Convert m² to hectares
        updatedAt: new Date()
      },
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!farm) {
      res.status(404).json({ success: false, error: 'Farm not found' });
      return;
    }
    
    res.status(200).json({ success: true, data: farm });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Server Error' });
    }
  }
};