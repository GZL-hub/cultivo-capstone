import api from './api';

export interface ISensorReading {
  timestamp: Date | string;
  moisture: number;
  temperature: number;
  ph: number;
  ec: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  pumpStatus: boolean;
}

export interface ISensor {
  _id: string;
  deviceId: string;
  deviceName: string;
  farmId: string;
  blynkTemplateId: string;
  blynkAuthToken: string;
  isActive: boolean;
  lastReading?: ISensorReading;
  settings: {
    moistureThreshold: number;
    optimalPh: { min: number; max: number };
    optimalTemperature: { min: number; max: number };
  };
  createdAt: string;
  updatedAt: string;
}

export interface ISensorReadingDocument extends ISensorReading {
  _id: string;
  sensorId: string;
}

export interface SensorStats {
  avgMoisture: number;
  avgTemperature: number;
  avgPh: number;
  avgEc: number;
  avgNitrogen: number;
  avgPhosphorus: number;
  avgPotassium: number;
  minMoisture: number;
  maxMoisture: number;
  minTemperature: number;
  maxTemperature: number;
  minPh: number;
  maxPh: number;
  count: number;
}

export interface PaginatedReadings {
  data: ISensorReadingDocument[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

export type SensorStatus = 'normal' | 'warning' | 'alert' | 'offline';

export interface SensorAverages {
  moisture: number;
  temperature: number;
  ph: number;
  ec: number;
}

export interface SensorHealthCounts {
  normal: number;
  warning: number;
  alert: number;
  offline: number;
}

// ============================================
// SENSOR STATUS & HEALTH HELPER FUNCTIONS
// ============================================

/**
 * Check if a sensor is online based on last update time
 * @param sensor - The sensor to check
 * @param thresholdMinutes - Minutes threshold (default: 5)
 * @returns true if sensor is online, false otherwise
 */
export const isSensorOnline = (sensor: ISensor, thresholdMinutes: number = 5): boolean => {
  if (!sensor.isActive) return false;
  if (!sensor.lastReading?.timestamp) return false;

  const lastUpdate = new Date(sensor.lastReading.timestamp);
  const now = new Date();
  const minutesAgo = (now.getTime() - lastUpdate.getTime()) / 60000;

  return minutesAgo < thresholdMinutes;
};

/**
 * Get the status color/level for a sensor based on its readings
 * @param sensor - The sensor to evaluate
 * @returns Status: 'normal', 'warning', 'alert', or 'offline'
 */
export const getSensorStatus = (sensor: ISensor): SensorStatus => {
  // First check if sensor is online (5 minute threshold to match ESP32 polling rate)
  const isOnline = isSensorOnline(sensor, 5);
  if (!isOnline) return 'offline';

  // TypeScript safety check
  if (!sensor.lastReading) return 'offline';

  const { moisture, ph, temperature } = sensor.lastReading;
  const { moistureThreshold, optimalPh, optimalTemperature } = sensor.settings;

  // Check for critical conditions (alert)
  if (moisture < moistureThreshold) return 'alert';
  if (ph < optimalPh.min - 0.5 || ph > optimalPh.max + 0.5) return 'alert';
  if (temperature < optimalTemperature.min - 5 || temperature > optimalTemperature.max + 5) return 'alert';

  // Check for warning conditions
  if (ph < optimalPh.min || ph > optimalPh.max) return 'warning';
  if (temperature < optimalTemperature.min || temperature > optimalTemperature.max) return 'warning';

  return 'normal';
};

/**
 * Calculate average sensor readings from multiple sensors
 * @param sensors - Array of sensors
 * @returns Average values for moisture, temperature, ph, and ec
 */
export const calculateSensorAverages = (sensors: ISensor[]): SensorAverages => {
  const activeSensors = sensors.filter(s => s.lastReading && isSensorOnline(s));

  if (activeSensors.length === 0) {
    return { moisture: 0, temperature: 0, ph: 0, ec: 0 };
  }

  return {
    moisture: activeSensors.reduce((acc, s) => acc + s.lastReading!.moisture, 0) / activeSensors.length,
    temperature: activeSensors.reduce((acc, s) => acc + s.lastReading!.temperature, 0) / activeSensors.length,
    ph: activeSensors.reduce((acc, s) => acc + s.lastReading!.ph, 0) / activeSensors.length,
    ec: activeSensors.reduce((acc, s) => acc + s.lastReading!.ec, 0) / activeSensors.length
  };
};

/**
 * Get health status counts for multiple sensors
 * @param sensors - Array of sensors
 * @returns Counts for normal, warning, alert, and offline sensors
 */
export const getSensorHealthCounts = (sensors: ISensor[]): SensorHealthCounts => {
  const normal = sensors.filter(s => {
    if (!isSensorOnline(s)) return false;
    const { moisture, ph, temperature } = s.lastReading!;
    const { moistureThreshold, optimalPh, optimalTemperature } = s.settings;

    return moisture >= moistureThreshold &&
           ph >= optimalPh.min && ph <= optimalPh.max &&
           temperature >= optimalTemperature.min && temperature <= optimalTemperature.max;
  }).length;

  const warning = sensors.filter(s => {
    if (!isSensorOnline(s)) return false;
    const { moisture, ph, temperature } = s.lastReading!;
    const { moistureThreshold, optimalPh, optimalTemperature } = s.settings;

    return (ph < optimalPh.min || ph > optimalPh.max) ||
           (temperature < optimalTemperature.min || temperature > optimalTemperature.max);
  }).length;

  const alert = sensors.filter(s => {
    if (!isSensorOnline(s)) return false;
    const { moisture, ph, temperature } = s.lastReading!;
    const { moistureThreshold, optimalPh, optimalTemperature } = s.settings;

    return moisture < moistureThreshold ||
           ph < optimalPh.min - 0.5 || ph > optimalPh.max + 0.5 ||
           temperature < optimalTemperature.min - 5 || temperature > optimalTemperature.max + 5;
  }).length;

  const offline = sensors.filter(s => !isSensorOnline(s)).length;

  return { normal, warning, alert, offline };
};

/**
 * Get active (online) sensors from a list
 * @param sensors - Array of sensors
 * @returns Array of sensors that are online
 */
export const getActiveSensors = (sensors: ISensor[]): ISensor[] => {
  return sensors.filter(s => s.lastReading && isSensorOnline(s));
};

/**
 * Calculate overall plant health percentage
 * @param sensors - Array of sensors
 * @returns Health percentage (0-100)
 */
export const calculatePlantHealth = (sensors: ISensor[]): number => {
  const activeSensors = getActiveSensors(sensors);
  if (activeSensors.length === 0) return 0;

  const normalSensors = activeSensors.filter(s => {
    const { moisture, ph, temperature } = s.lastReading!;
    const { moistureThreshold, optimalPh, optimalTemperature } = s.settings;

    return moisture >= moistureThreshold &&
           ph >= optimalPh.min && ph <= optimalPh.max &&
           temperature >= optimalTemperature.min && temperature <= optimalTemperature.max;
  }).length;

  return Math.round((normalSensors / activeSensors.length) * 100);
};

// Get all sensors for a farm
export const getSensorsByFarm = async (farmId: string): Promise<ISensor[]> => {
  try {
    const response = await api.get(`/farms/${farmId}/sensors`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching sensors:', error);
    throw error;
  }
};

// Get single sensor by ID
export const getSensor = async (sensorId: string): Promise<ISensor> => {
  try {
    const response = await api.get(`/sensors/${sensorId}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching sensor ${sensorId}:`, error);
    throw error;
  }
};

// Create new sensor
export const createSensor = async (
  farmId: string,
  sensorData: Omit<ISensor, '_id' | 'createdAt' | 'updatedAt' | 'lastReading'>
): Promise<ISensor> => {
  try {
    const response = await api.post(`/farms/${farmId}/sensors`, {
      ...sensorData,
      farmId
    });
    return response.data.data;
  } catch (error) {
    console.error('Error creating sensor:', error);
    throw error;
  }
};

// Update sensor
export const updateSensor = async (
  sensorId: string,
  sensorData: Partial<ISensor>
): Promise<ISensor> => {
  try {
    const response = await api.put(`/sensors/${sensorId}`, sensorData);
    return response.data.data;
  } catch (error) {
    console.error(`Error updating sensor ${sensorId}:`, error);
    throw error;
  }
};

// Delete sensor
export const deleteSensor = async (sensorId: string): Promise<void> => {
  try {
    await api.delete(`/sensors/${sensorId}`);
  } catch (error) {
    console.error(`Error deleting sensor ${sensorId}:`, error);
    throw error;
  }
};

// Record sensor reading (for testing - normally called by IoT device)
export const recordReading = async (
  sensorId: string,
  reading: Omit<ISensorReading, 'timestamp'>
): Promise<ISensorReadingDocument> => {
  try {
    const response = await api.post(`/sensors/${sensorId}/readings`, reading);
    return response.data.data;
  } catch (error) {
    console.error(`Error recording reading for sensor ${sensorId}:`, error);
    throw error;
  }
};

// Get sensor readings with pagination
export const getSensorReadings = async (
  sensorId: string,
  options?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
    page?: number;
    aggregation?: string;
  }
): Promise<PaginatedReadings> => {
  try {
    const params = new URLSearchParams();
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.page) params.append('page', options.page.toString());
    if (options?.aggregation) params.append('aggregation', options.aggregation);

    const response = await api.get(
      `/sensors/${sensorId}/readings?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching readings for sensor ${sensorId}:`, error);
    throw error;
  }
};

// Get latest reading
export const getLatestReading = async (sensorId: string): Promise<ISensorReading | null> => {
  try {
    const response = await api.get(`/sensors/${sensorId}/readings/latest`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching latest reading for sensor ${sensorId}:`, error);
    throw error;
  }
};

// Get sensor statistics
export const getSensorStats = async (
  sensorId: string,
  startDate?: string,
  endDate?: string
): Promise<SensorStats | null> => {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(
      `/sensors/${sensorId}/stats?${params.toString()}`
    );
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching stats for sensor ${sensorId}:`, error);
    throw error;
  }
};
