import React from 'react';
import GoogleMap from '../../googlemap/GoogleMap';
import { User, Users, Wifi, WifiOff, CloudSun, Thermometer, Wind } from 'lucide-react';

interface Farm {
  name: string;
  type: string;
  operationSince: string;
  areaSize: string;
  coordinates: { lat: number; lng: number };
  coordinatesText: string;
  activeDevices: number;
  inactiveDevices: number;
  lastActivity: string;
}

interface Worker {
  name: string;
  role: string;
}

interface Weather {
  temperature: number; // Celsius
  humidity: number; // %
  windSpeed: number; // m/s
  weatherDescription: string;
  icon: string; // e.g. "01d"
}

interface FarmOverviewProps {
  farm: Farm;
  workers: Worker[];
  weather?: Weather;
}

const WeatherCard: React.FC<{ weather?: Weather }> = ({ weather }) => (
  <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center h-full">
    <div className="flex items-center mb-2">
      <CloudSun className="text-blue-500 mr-2" size={28} />
      <h3 className="text-lg font-semibold">Weather</h3>
    </div>
    {weather ? (
      <>
        <div className="flex items-center gap-2 mb-2">
          <img
            src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
            alt={weather.weatherDescription}
            className="w-12 h-12"
          />
          <span className="text-3xl font-bold">{weather.temperature}°C</span>
        </div>
        <div className="capitalize text-gray-600 mb-2">{weather.weatherDescription}</div>
        <div className="flex flex-col gap-1 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Thermometer size={16} /> Humidity: <span className="font-medium">{weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Wind size={16} /> Wind: <span className="font-medium">{weather.windSpeed} m/s</span>
          </div>
        </div>
      </>
    ) : (
      <div className="text-gray-400">No weather data</div>
    )}
  </div>
);

const ActionsCard: React.FC = () => (
  <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center justify-center h-full">
    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
    <div className="flex flex-col gap-3 w-full">
      <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded w-full">Edit Farm</button>
      <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-4 rounded w-full">Add Zone</button>
    </div>
  </div>
);

const WorkerCard: React.FC<{ workers: Worker[] }> = ({ workers }) => (
  <div className="bg-white rounded-lg shadow p-6 flex flex-col h-full">
    <div className="flex items-center mb-4">
      <Users className="text-green-700 mr-2" />
      <h3 className="text-lg font-semibold">Workers</h3>
    </div>
    <ul className="space-y-3">
      {workers.map((worker, idx) => (
        <li key={idx} className="flex items-center gap-3">
          <User className="text-gray-400" size={20} />
          <div>
            <div className="font-medium">{worker.name}</div>
            <div className="text-xs text-gray-500">{worker.role}</div>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

const FarmOverview: React.FC<FarmOverviewProps> = ({ farm, workers, weather }) => (
  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
    {/* Center Map and Farm Info */}
    <div className="xl:col-span-2 flex flex-col gap-6 h-full">
      <div className="bg-white rounded-lg shadow p-0 flex flex-col overflow-hidden h-96">
        <div className="h-full w-full">
          <GoogleMap center={farm.coordinates} zoom={17} />
        </div>
        <div className="p-4 text-xs text-gray-500 text-center border-t">
          Farm Location Map
        </div>
      </div>
      {/* Farm Info + Devices Card */}
      <div className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">{farm.name}</h2>
          <div className="mb-1 text-gray-600">{farm.type}</div>
          <div className="mb-1 text-sm">Operation Since: <span className="font-medium">{farm.operationSince}</span></div>
          <div className="mb-1 text-sm">Area Size: <span className="font-medium">{farm.areaSize}</span></div>
          <div className="mb-1 text-sm">Coordinates: <span className="font-mono">{farm.coordinatesText}</span></div>
          <div className="flex gap-2 mt-3">
            <span className="inline-flex items-center bg-green-100 text-green-700 px-3 py-1 rounded text-sm">
              <Wifi className="mr-1" size={16} /> {farm.activeDevices} Active
            </span>
            <span className="inline-flex items-center bg-red-100 text-red-700 px-3 py-1 rounded text-sm">
              <WifiOff className="mr-1" size={16} /> {farm.inactiveDevices} Inactive
            </span>
          </div>
          <div className="text-xs text-gray-400 mt-2">Last activity: {farm.lastActivity}</div>
        </div>
      </div>
    </div>

    {/* Side Cards: Weather, Actions, Workers */}
    <div className="flex flex-col gap-6 h-full">
      <WeatherCard weather={weather} />
      <ActionsCard />
      <WorkerCard workers={workers} />
    </div>
  </div>
);

export default FarmOverview;