import React from 'react';
import { Sensor } from '../data/sensorData';
import BatteryIndicator from './BatteryIndicator';

interface SensorTableProps {
  sensors: Sensor[];
}

const SensorTable: React.FC<SensorTableProps> = ({ sensors }) => {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sensor
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Battery
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Reading
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Update Frequency
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sensors.map((sensor) => (
              <SensorRow key={sensor.id} sensor={sensor} />
            ))}
          </tbody>
        </table>
      </div>
      
      {sensors.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No sensors found matching your filter criteria
        </div>
      )}
    </div>
  );
};

interface SensorRowProps {
  sensor: Sensor;
}

const SensorRow: React.FC<SensorRowProps> = ({ sensor }) => {
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <tr key={sensor.id} className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{sensor.name}</div>
        <div className="text-xs text-gray-500">{sensor.type}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(sensor.status)}`}>
          {sensor.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <BatteryIndicator level={sensor.battery} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {sensor.lastReading || 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {sensor.location}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {sensor.updateFrequency}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button className="text-green-600 hover:text-green-900 mr-3">Edit</button>
        <button className="text-red-600 hover:text-red-900">Remove</button>
      </td>
    </tr>
  );
};

export default SensorTable;