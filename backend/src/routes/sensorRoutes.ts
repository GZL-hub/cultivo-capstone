import express from 'express';
import {
  getSensorsByFarm,
  getSensorById,
  createSensor,
  updateSensor,
  deleteSensor,
  recordReading,
  getSensorReadings,
  getLatestReading,
  getSensorStats,
  recordDataByDevice
} from '../controllers/sensorController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Farm-level routes (get all sensors for a farm)
router.get('/farms/:farmId/sensors', protect, getSensorsByFarm);
router.post('/farms/:farmId/sensors', protect, createSensor);

// Sensor-level routes
router.get('/sensors/:sensorId', protect, getSensorById);
router.put('/sensors/:sensorId', protect, updateSensor);
router.delete('/sensors/:sensorId', protect, deleteSensor);

// Sensor readings routes
router.post('/sensors/:sensorId/readings', recordReading); // No auth for IoT devices
router.get('/sensors/:sensorId/readings', protect, getSensorReadings);
router.get('/sensors/:sensorId/readings/latest', protect, getLatestReading);
router.get('/sensors/:sensorId/stats', protect, getSensorStats);

// IoT device data ingestion (using deviceId instead of sensorId)
router.post('/sensors/record-data', recordDataByDevice); // No auth - for ESP32 devices
router.post('/sensors/data', recordDataByDevice); // Alias for backward compatibility

export default router;
