export interface Sensor {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline' | 'maintenance';
  battery: number;
  lastReading?: string;
  location: string;
  updateFrequency: string;
}

// Sample data - in a real app, you would fetch this from an API
export const sampleSensors: Sensor[] = [
  {
    id: 's1',
    name: 'Soil Moisture A1',
    type: 'Soil Moisture',
    status: 'online',
    battery: 87,
    lastReading: '32% moisture',
    location: 'North Field',
    updateFrequency: '15 minutes'
  },
  {
    id: 's2',
    name: 'Weather Station 1',
    type: 'Weather',
    status: 'online',
    battery: 92,
    lastReading: '29°C, 68% humidity',
    location: 'Central Hub',
    updateFrequency: '5 minutes'
  },
  {
    id: 's3',
    name: 'pH Sensor B2',
    type: 'pH Level',
    status: 'offline',
    battery: 12,
    lastReading: 'pH 6.8',
    location: 'South Field',
    updateFrequency: '30 minutes'
  },
  {
    id: 's4',
    name: 'Light Sensor C1',
    type: 'Light Intensity',
    status: 'online',
    battery: 65,
    lastReading: '85000 lux',
    location: 'Greenhouse',
    updateFrequency: '10 minutes'
  },
  {
    id: 's5',
    name: 'Water Flow Meter',
    type: 'Water Flow',
    status: 'maintenance',
    battery: 54,
    lastReading: '2.3 L/min',
    location: 'Irrigation System',
    updateFrequency: '5 minutes'
  }
];