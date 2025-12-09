import { Request, Response } from 'express';
import Farm, { IFarm } from '../models/Farm';
import mongoose from 'mongoose';

// Create a custom request type that includes the user property
interface AuthRequest extends Request {
  user?: {
    id: string;
    [key: string]: any;
  };
}

// Define the coordinate type
interface Coordinate {
  lat: number;
  lng: number;
}

// Get all farms
export const getAllFarms = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Only return farms owned by the authenticated user
    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    const filter: any = { owner: new mongoose.Types.ObjectId(req.user.id) };

    const farms = await Farm.find(filter);
    res.status(200).json({ success: true, data: farms });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Get single farm
export const getFarmById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    const farm = await Farm.findById(req.params.id);

    if (!farm) {
      res.status(404).json({ success: false, error: 'Farm not found' });
      return;
    }

    // Check if the user owns this farm
    if (farm.owner.toString() !== req.user.id) {
      res.status(403).json({ success: false, error: 'Not authorized to access this farm' });
      return;
    }

    res.status(200).json({ success: true, data: farm });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Create new farm
export const createFarm = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    // Remove farmBoundary and coordinates if they are empty/invalid
    const farmData = { ...req.body };

    // Set the owner to the authenticated user (ignore any owner field from request body)
    farmData.owner = req.user.id;

    // Don't include farmBoundary if it's empty or invalid
    if (farmData.farmBoundary) {
      if (!farmData.farmBoundary.coordinates ||
          farmData.farmBoundary.coordinates.length === 0 ||
          (Array.isArray(farmData.farmBoundary.coordinates[0]) && farmData.farmBoundary.coordinates[0].length === 0)) {
        delete farmData.farmBoundary;
      }
    }

    // Don't include coordinates if it's empty
    if (!farmData.coordinates || farmData.coordinates === '') {
      delete farmData.coordinates;
    }

    const farm = await Farm.create(farmData);
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
export const updateFarm = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    // First, check if the farm exists and user owns it
    const existingFarm = await Farm.findById(req.params.id);

    if (!existingFarm) {
      res.status(404).json({ success: false, error: 'Farm not found' });
      return;
    }

    // Check ownership
    if (existingFarm.owner.toString() !== req.user.id) {
      res.status(403).json({ success: false, error: 'Not authorized to update this farm' });
      return;
    }

    // Don't allow changing the owner
    if (req.body.owner) {
      delete req.body.owner;
    }

    // Validate the incoming data
    const { name, type, operationDate } = req.body;
    const updateData: Partial<IFarm> = {};

    // Only include fields that are provided in the request
    if (name !== undefined) updateData.name = name;
    if (type !== undefined) updateData.type = type;
    if (operationDate !== undefined) updateData.operationDate = operationDate;

    // Always update the updatedAt timestamp
    updateData.updatedAt = new Date();

    const farm = await Farm.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

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
export const deleteFarm = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    // First, check if the farm exists and user owns it
    const farm = await Farm.findById(req.params.id);

    if (!farm) {
      res.status(404).json({ success: false, error: 'Farm not found' });
      return;
    }

    // Check ownership
    if (farm.owner.toString() !== req.user.id) {
      res.status(403).json({ success: false, error: 'Not authorized to delete this farm' });
      return;
    }

    await Farm.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Get farm boundary polygon
export const getFarmBoundary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    const farm = await Farm.findById(req.params.id);

    if (!farm) {
      res.status(404).json({ success: false, error: 'Farm not found' });
      return;
    }

    // Check ownership
    if (farm.owner.toString() !== req.user.id) {
      res.status(403).json({ success: false, error: 'Not authorized to access this farm' });
      return;
    }

    res.status(200).json({ success: true, data: farm.farmBoundary });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Update farm boundary polygon
export const updateFarmBoundary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    // First, check if the farm exists and user owns it
    const existingFarm = await Farm.findById(req.params.id);

    if (!existingFarm) {
      res.status(404).json({ success: false, error: 'Farm not found' });
      return;
    }

    // Check ownership
    if (existingFarm.owner.toString() !== req.user.id) {
      res.status(403).json({ success: false, error: 'Not authorized to update this farm' });
      return;
    }

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

    res.status(200).json({ success: true, data: farm });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Server Error' });
    }
  }
};
