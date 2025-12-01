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
  }
): Promise<PaginatedReadings> => {
  try {
    const params = new URLSearchParams();
    if (options?.startDate) params.append('startDate', options.startDate);
    if (options?.endDate) params.append('endDate', options.endDate);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.page) params.append('page', options.page.toString());

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
