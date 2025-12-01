import { Request, Response } from 'express';
import { Sensor, SensorReading, ISensor } from '../models/Sensor';
import mongoose from 'mongoose';

// Custom request type with user
interface AuthRequest extends Request {
  user?: {
    id: string;
    [key: string]: any;
  };
}

// Get all sensors for a farm
export const getSensorsByFarm = async (req: Request, res: Response): Promise<void> => {
  try {
    const { farmId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(farmId)) {
      res.status(400).json({ success: false, error: 'Invalid farm ID' });
      return;
    }

    const sensors = await Sensor.find({ farmId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: sensors });
  } catch (error) {
    console.error('Error fetching sensors:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Get single sensor by ID
export const getSensorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sensorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sensorId)) {
      res.status(400).json({ success: false, error: 'Invalid sensor ID' });
      return;
    }

    const sensor = await Sensor.findById(sensorId).populate('farmId', 'name');

    if (!sensor) {
      res.status(404).json({ success: false, error: 'Sensor not found' });
      return;
    }

    res.status(200).json({ success: true, data: sensor });
  } catch (error) {
    console.error('Error fetching sensor:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Create new sensor
export const createSensor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deviceId, deviceName, farmId, blynkTemplateId, blynkAuthToken, settings } = req.body;

    // Validation
    if (!deviceId || !deviceName || !farmId || !blynkTemplateId || !blynkAuthToken) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: deviceId, deviceName, farmId, blynkTemplateId, blynkAuthToken'
      });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(farmId)) {
      res.status(400).json({ success: false, error: 'Invalid farm ID' });
      return;
    }

    // Check if device ID already exists
    const existingSensor = await Sensor.findOne({ deviceId });
    if (existingSensor) {
      res.status(400).json({ success: false, error: 'Device ID already exists' });
      return;
    }

    const sensorData: any = {
      deviceId,
      deviceName,
      farmId,
      blynkTemplateId,
      blynkAuthToken
    };

    if (settings) {
      sensorData.settings = settings;
    }

    const sensor = await Sensor.create(sensorData);
    res.status(201).json({ success: true, data: sensor });
  } catch (error) {
    console.error('Error creating sensor:', error);
    if (error instanceof Error) {
      res.status(400).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Server Error' });
    }
  }
};

// Update sensor
export const updateSensor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sensorId } = req.params;
    const { deviceName, isActive, settings } = req.body;

    if (!mongoose.Types.ObjectId.isValid(sensorId)) {
      res.status(400).json({ success: false, error: 'Invalid sensor ID' });
      return;
    }

    const updateData: any = { updatedAt: new Date() };

    if (deviceName !== undefined) updateData.deviceName = deviceName;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (settings !== undefined) updateData.settings = settings;

    const sensor = await Sensor.findByIdAndUpdate(
      sensorId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!sensor) {
      res.status(404).json({ success: false, error: 'Sensor not found' });
      return;
    }

    res.status(200).json({ success: true, data: sensor });
  } catch (error) {
    console.error('Error updating sensor:', error);
    if (error instanceof Error) {
      res.status(400).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Server Error' });
    }
  }
};

// Delete sensor
export const deleteSensor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sensorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sensorId)) {
      res.status(400).json({ success: false, error: 'Invalid sensor ID' });
      return;
    }

    const sensor = await Sensor.findByIdAndDelete(sensorId);

    if (!sensor) {
      res.status(404).json({ success: false, error: 'Sensor not found' });
      return;
    }

    // Optionally delete all readings for this sensor
    await SensorReading.deleteMany({ sensorId });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Error deleting sensor:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Record sensor reading (called by IoT device or webhook)
export const recordReading = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sensorId } = req.params;
    const { moisture, temperature, ph, ec, nitrogen, phosphorus, potassium, pumpStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(sensorId)) {
      res.status(400).json({ success: false, error: 'Invalid sensor ID' });
      return;
    }

    // Validation
    if (
      moisture === undefined ||
      temperature === undefined ||
      ph === undefined ||
      ec === undefined ||
      nitrogen === undefined ||
      phosphorus === undefined ||
      potassium === undefined
    ) {
      res.status(400).json({
        success: false,
        error: 'Missing required sensor data'
      });
      return;
    }

    // Create reading record
    const reading = await SensorReading.create({
      sensorId,
      moisture,
      temperature,
      ph,
      ec,
      nitrogen,
      phosphorus,
      potassium,
      pumpStatus: pumpStatus || false,
      timestamp: new Date()
    });

    // Update sensor's last reading
    await Sensor.findByIdAndUpdate(sensorId, {
      lastReading: {
        timestamp: reading.timestamp,
        moisture,
        temperature,
        ph,
        ec,
        nitrogen,
        phosphorus,
        potassium,
        pumpStatus: pumpStatus || false
      },
      updatedAt: new Date()
    });

    res.status(201).json({ success: true, data: reading });
  } catch (error) {
    console.error('Error recording reading:', error);
    if (error instanceof Error) {
      res.status(400).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Server Error' });
    }
  }
};

// Get sensor readings with pagination and time filtering
export const getSensorReadings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sensorId } = req.params;
    const { startDate, endDate, limit = 100, page = 1 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(sensorId)) {
      res.status(400).json({ success: false, error: 'Invalid sensor ID' });
      return;
    }

    const query: any = { sensorId };

    // Add time filters if provided
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate as string);
      if (endDate) query.timestamp.$lte = new Date(endDate as string);
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const readings = await SensorReading.find(query)
      .sort({ timestamp: -1 })
      .limit(limitNum)
      .skip(skip);

    const total = await SensorReading.countDocuments(query);

    res.status(200).json({
      success: true,
      data: readings,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Error fetching readings:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Get latest reading for a sensor
export const getLatestReading = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sensorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sensorId)) {
      res.status(400).json({ success: false, error: 'Invalid sensor ID' });
      return;
    }

    const sensor = await Sensor.findById(sensorId);

    if (!sensor) {
      res.status(404).json({ success: false, error: 'Sensor not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: sensor.lastReading || null
    });
  } catch (error) {
    console.error('Error fetching latest reading:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Get sensor statistics for a time period
export const getSensorStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sensorId } = req.params;
    const { startDate, endDate } = req.query;

    if (!mongoose.Types.ObjectId.isValid(sensorId)) {
      res.status(400).json({ success: false, error: 'Invalid sensor ID' });
      return;
    }

    const matchQuery: any = {
      sensorId: new mongoose.Types.ObjectId(sensorId)
    };

    if (startDate || endDate) {
      matchQuery.timestamp = {};
      if (startDate) matchQuery.timestamp.$gte = new Date(startDate as string);
      if (endDate) matchQuery.timestamp.$lte = new Date(endDate as string);
    }

    const stats = await SensorReading.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          avgMoisture: { $avg: '$moisture' },
          avgTemperature: { $avg: '$temperature' },
          avgPh: { $avg: '$ph' },
          avgEc: { $avg: '$ec' },
          avgNitrogen: { $avg: '$nitrogen' },
          avgPhosphorus: { $avg: '$phosphorus' },
          avgPotassium: { $avg: '$potassium' },
          minMoisture: { $min: '$moisture' },
          maxMoisture: { $max: '$moisture' },
          minTemperature: { $min: '$temperature' },
          maxTemperature: { $max: '$temperature' },
          minPh: { $min: '$ph' },
          maxPh: { $max: '$ph' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats.length > 0 ? stats[0] : null
    });
  } catch (error) {
    console.error('Error fetching sensor stats:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Record sensor data from ESP32 device using deviceId (for IoT devices)
export const recordDataByDevice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { deviceId, moisture, temperature, ph, ec, nitrogen, phosphorus, potassium, pumpStatus } = req.body;

    // Validation
    if (!deviceId) {
      res.status(400).json({
        success: false,
        error: 'Missing required field: deviceId'
      });
      return;
    }

    if (
      moisture === undefined ||
      temperature === undefined ||
      ph === undefined ||
      ec === undefined ||
      nitrogen === undefined ||
      phosphorus === undefined ||
      potassium === undefined
    ) {
      res.status(400).json({
        success: false,
        error: 'Missing required sensor data fields'
      });
      return;
    }

    // Find sensor by deviceId
    const sensor = await Sensor.findOne({ deviceId });

    if (!sensor) {
      res.status(404).json({
        success: false,
        error: `Sensor with deviceId '${deviceId}' not found. Please register this device first.`
      });
      return;
    }

    // Check if sensor is active
    if (!sensor.isActive) {
      res.status(403).json({
        success: false,
        error: 'Sensor is not active'
      });
      return;
    }

    // Create reading record
    const reading = await SensorReading.create({
      sensorId: sensor._id,
      moisture,
      temperature,
      ph,
      ec,
      nitrogen,
      phosphorus,
      potassium,
      pumpStatus: pumpStatus || false,
      timestamp: new Date()
    });

    // Update sensor's last reading
    await Sensor.findByIdAndUpdate(sensor._id, {
      lastReading: {
        timestamp: reading.timestamp,
        moisture,
        temperature,
        ph,
        ec,
        nitrogen,
        phosphorus,
        potassium,
        pumpStatus: pumpStatus || false
      },
      updatedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Data recorded successfully',
      data: {
        readingId: reading._id,
        sensorId: sensor._id,
        deviceName: sensor.deviceName,
        timestamp: reading.timestamp
      }
    });
  } catch (error) {
    console.error('Error recording device data:', error);
    if (error instanceof Error) {
      res.status(400).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Server Error' });
    }
  }
};
