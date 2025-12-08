import { ISensor } from './sensorService';
import { CCTV } from './cctvService';
import { IFarm } from './farmService';

export interface SearchResult {
  id: string;
  type: 'farm' | 'sensor' | 'camera' | 'worker' | 'alert';
  title: string;
  subtitle?: string;
  description?: string;
  path: string;
  data?: any;
}

export interface SearchResults {
  farms: SearchResult[];
  sensors: SearchResult[];
  cameras: SearchResult[];
  workers: SearchResult[];
  alerts: SearchResult[];
  total: number;
}

/**
 * Search across all entities in the application
 * This is a client-side search that filters cached data
 * For production, consider implementing server-side search
 */
export const performSearch = (
  query: string,
  data: {
    farms?: IFarm[];
    sensors?: ISensor[];
    cameras?: CCTV[];
    workers?: any[];
    alerts?: any[];
  }
): SearchResults => {
  const searchTerm = query.toLowerCase().trim();

  const results: SearchResults = {
    farms: [],
    sensors: [],
    cameras: [],
    workers: [],
    alerts: [],
    total: 0
  };

  if (!searchTerm) return results;

  // Search farms
  if (data.farms) {
    results.farms = data.farms
      .filter(farm =>
        farm.name.toLowerCase().includes(searchTerm) ||
        farm.type.toLowerCase().includes(searchTerm)
      )
      .map(farm => ({
        id: farm._id,
        type: 'farm' as const,
        title: farm.name,
        subtitle: farm.type,
        description: `${farm.areaSize} area`,
        path: '/farm-management',
        data: farm
      }));
  }

  // Search sensors
  if (data.sensors) {
    results.sensors = data.sensors
      .filter(sensor =>
        sensor.deviceName.toLowerCase().includes(searchTerm) ||
        sensor.deviceId.toLowerCase().includes(searchTerm)
      )
      .map(sensor => ({
        id: sensor._id,
        type: 'sensor' as const,
        title: sensor.deviceName,
        subtitle: `ID: ${sensor.deviceId}`,
        description: sensor.isActive ? 'Active' : 'Inactive',
        path: '/sensor-management',
        data: sensor
      }));
  }

  // Search cameras
  if (data.cameras) {
    results.cameras = data.cameras
      .filter(camera =>
        camera.name.toLowerCase().includes(searchTerm) ||
        camera.streamUrl?.toLowerCase().includes(searchTerm) ||
        camera.type?.toLowerCase().includes(searchTerm)
      )
      .map(camera => ({
        id: camera._id || '',
        type: 'camera' as const,
        title: camera.name,
        subtitle: camera.type || 'Camera',
        description: camera.status,
        path: '/devices/camera',
        data: camera
      }));
  }

  // Search workers
  if (data.workers) {
    results.workers = data.workers
      .filter(worker =>
        worker.name?.toLowerCase().includes(searchTerm) ||
        worker.workerId?.toLowerCase().includes(searchTerm) ||
        worker.role?.toLowerCase().includes(searchTerm)
      )
      .map(worker => ({
        id: worker._id || worker.workerId,
        type: 'worker' as const,
        title: worker.name || 'Unnamed Worker',
        subtitle: worker.role || 'No role',
        description: `ID: ${worker.workerId}`,
        path: '/farm-management',
        data: worker
      }));
  }

  // Search alerts
  if (data.alerts) {
    results.alerts = data.alerts
      .filter(alert =>
        alert.title?.toLowerCase().includes(searchTerm) ||
        alert.message?.toLowerCase().includes(searchTerm) ||
        alert.sourceName?.toLowerCase().includes(searchTerm)
      )
      .map(alert => ({
        id: alert._id,
        type: 'alert' as const,
        title: alert.title,
        subtitle: alert.sourceName || alert.type,
        description: alert.message,
        path: '/alerts',
        data: alert
      }));
  }

  // Calculate total
  results.total =
    results.farms.length +
    results.sensors.length +
    results.cameras.length +
    results.workers.length +
    results.alerts.length;

  return results;
};

/**
 * Get search suggestions based on query
 */
export const getSearchSuggestions = (query: string): string[] => {
  const suggestions = [
    'temperature sensor',
    'moisture sensor',
    'camera feed',
    'workers',
    'critical alerts',
    'farm overview',
    'sensor readings',
    'offline devices'
  ];

  const searchTerm = query.toLowerCase().trim();
  if (!searchTerm) return suggestions.slice(0, 5);

  return suggestions
    .filter(s => s.toLowerCase().includes(searchTerm))
    .slice(0, 5);
};
