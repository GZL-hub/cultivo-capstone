import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DeviceStatistics from './cards/DeviceStatistics';
import WeatherCard from './cards/WeatherCard';
import SensorAlerts from './cards/SensorAlerts';
import SensorCard from './cards/SensorCard';
import FarmMapCard from './cards/FarmMapCard';
import axios from 'axios';
import authService from '../../services/authService';
import {
  getSensorsByFarm,
  ISensor,
  getActiveSensors,
  calculateSensorAverages,
  calculatePlantHealth,
  getSensorStatus
} from '../../services/sensorService';
import { getCCTVs, CCTV } from '../../services/cctvService';
// Import icons
import {
  FaSeedling,
  FaVideo,
  FaVial,
  FaTint
} from 'react-icons/fa';

// API URL
const API_URL = '/api';

// Farm interface
interface Farm {
  _id: string;
  name: string;
  type: string;
  operationDate: string;
  areaSize: string;
  farmBoundary: {
    type: string;
    coordinates: number[][][];
  };
}

interface DashboardProps {
  isLoaded: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ isLoaded }) => {
  const navigate = useNavigate();

  // Add state for farm data
  const [farmInfo, setFarmInfo] = useState({
    name: "Loading...",
    type: "Loading...",
    operationDate: "Loading...",
    areaSize: "Loading...",
    farmBoundary: {
      type: "Polygon",
      coordinates: [[[0, 0], [0, 0], [0, 0], [0, 0]]]
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
  const [sensors, setSensors] = useState<ISensor[]>([]);
  const [cameras, setCameras] = useState<CCTV[]>([]);


  // Use consolidated service functions
  const activeSensors = getActiveSensors(sensors);

  // Fetch farm data on component mount
  useEffect(() => {
    const fetchFarmData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get current user
        const currentUser = authService.getCurrentUser();
        if (!currentUser || !currentUser.id) {
          setError('Please log in to view your farm');
          return;
        }

        // Fetch farms for the current user only
        const response = await axios.get(`${API_URL}/farms?owner=${currentUser.id}`);
        const farms = response.data.data;

        if (farms && farms.length > 0) {
          setFarmInfo({
            name: farms[0].name,
            type: farms[0].type,
            operationDate: farms[0].operationDate,
            areaSize: farms[0].areaSize,
            farmBoundary: farms[0].farmBoundary || {
              type: "Polygon",
              coordinates: [[[0, 0], [0, 0], [0, 0], [0, 0]]]
            }
          });
          // Store the farm ID for use with FarmMapCard
          setSelectedFarmId(farms[0]._id);

          // Fetch sensors and cameras for this farm
          try {
            const sensorsData = await getSensorsByFarm(farms[0]._id);
            setSensors(sensorsData);
          } catch (sensorErr) {
            console.error('Error fetching sensors:', sensorErr);
          }

          try {
            const camerasData = await getCCTVs(farms[0]._id);
            setCameras(camerasData);
          } catch (cameraErr) {
            console.error('Error fetching cameras:', cameraErr);
          }
        } else {
          setSelectedFarmId(null);
        }
      } catch (err: any) {
        console.error('Error fetching farm data:', err);
        setError(err.response?.data?.error || 'Failed to load farm data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFarmData();
  }, []);

  // Calculate deviceStats from actual sensor data
  const deviceStats = {
    totalRegistered: sensors.length,
    totalOnline: activeSensors.length
  };


  // Transform sensors and cameras into device format for FarmMapCard
  const devices = [
    // Add cameras
    ...cameras.map(camera => ({
      id: camera._id || camera.name,
      name: camera.name,
      type: camera.type,
      status: camera.status as 'online' | 'offline' | 'low_battery'
    })),
    // Add sensors
    ...sensors.map(sensor => {
      const sensorStatus = getSensorStatus(sensor);
      // Map sensor status to device status
      const deviceStatus: 'online' | 'offline' | 'low_battery' =
        sensorStatus === 'offline' ? 'offline' :
        sensorStatus === 'alert' ? 'low_battery' :
        'online';

      return {
        id: sensor._id,
        name: sensor.deviceName,
        type: 'Soil Sensor',
        status: deviceStatus
      };
    })
  ];

  // Calculate sensor data using service functions
  const sensorAverages = calculateSensorAverages(sensors);
  const plantHealth = calculatePlantHealth(sensors);

  // Get status for sensor cards
  const getMoistureStatus = (): 'normal' | 'warning' | 'alert' => {
    if (sensorAverages.moisture < 30) return 'alert';
    if (sensorAverages.moisture < 50) return 'warning';
    return 'normal';
  };

  const getPhStatus = (): 'normal' | 'warning' | 'alert' => {
    if (sensorAverages.ph < 5.5 || sensorAverages.ph > 8.0) return 'alert';
    if (sensorAverages.ph < 6.0 || sensorAverages.ph > 7.5) return 'warning';
    return 'normal';
  };

  // Sensor card click handlers
  const handleSensorClick = (sensorName: string) => {
    console.log(`${sensorName} sensor clicked`);
    if (sensorName === 'Plant Health' || sensorName === 'pH Level' || sensorName === 'Soil Moisture') {
      navigate('/device-settings/sensors');
    }
  };

  // View full map handler
  const handleViewFullMap = () => {
    navigate('/farm/map');
  };

  return (
    <div className="w-full h-full overflow-auto flex flex-col px-4 py-4 bg-background">    
      {/* Top row - devices stats and weather */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Device Statistics Component */}
        <DeviceStatistics 
          totalRegistered={deviceStats.totalRegistered} 
          totalOnline={deviceStats.totalOnline} 
        />
      
        {/* Weather Card Component */}
        <WeatherCard />
      </div>
      
      {/* Main content area - flex-grow to take remaining height */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-grow">
        {/* Left column - Sensor Alerts and Sensor Dashboard */}
        <div className="md:col-span-4 flex flex-col space-y-4">
          {/* Sensor Alerts */}
          <div className="bg-white p-4 rounded-lg shadow-md flex-[2]">
            <SensorAlerts
              sensors={sensors}
              cameras={cameras}
              onAlertClick={(type) => {
                if (type === 'alert' || type === 'warning') {
                  navigate('/device-settings/sensors');
                }
              }}
            />
          </div>
          
          {/* Sensor Dashboard */}
          <div className="bg-white p-4 rounded-lg shadow-md flex-[3]">
            <div className="grid grid-cols-2 gap-3 h-[calc(100%-1rem)]">
              {/* Plant Health Sensor - with green gradient background and white text */}
              <SensorCard
                title="Plant Health"
                icon={FaSeedling}
                status={plantHealth >= 70 ? "normal" : plantHealth >= 40 ? "warning" : "alert"}
                onClick={() => handleSensorClick('Plant Health')}
                className="bg-gradient-to-br from-green-400 to-green-700 border-0 shadow-md"
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-white">
                      {activeSensors.length > 0 ? `${plantHealth}%` : '—'}
                    </span>
                  </div>
                  <span className="text-xs text-white mt-1">
                    {activeSensors.length > 0
                      ? (plantHealth >= 70 ? 'Healthy' : plantHealth >= 40 ? 'Fair' : 'Poor')
                      : 'No Data'}
                  </span>
                </div>
              </SensorCard>
              
              {/* Camera Sensor */}
              <SensorCard
                title="Camera"
                icon={FaVideo}
                status={cameras.filter(c => c.status === 'online').length > 0 ? "online" : "inactive"}
                onClick={() => navigate('/device-settings/cameras')}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="flex items-center">
                    <span className="text-3xl font-bold text-blue-600">
                      {cameras.filter(c => c.status === 'online').length}
                    </span>
                    <span className="text-lg text-gray-500 ml-2">/</span>
                    <span className="text-lg text-gray-400 ml-1">{cameras.length}</span>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {cameras.length > 0 ? 'Cameras Online' : 'No Cameras'}
                  </span>
                </div>
              </SensorCard>
              
              {/* pH Level Sensor */}
              <SensorCard
                title="pH Level"
                icon={FaVial}
                status={activeSensors.length > 0 ? getPhStatus() : "inactive"}
                onClick={() => handleSensorClick('pH Level')}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="flex items-center">
                    <span className={`text-2xl font-bold ${
                      activeSensors.length === 0 ? 'text-gray-400' :
                      getPhStatus() === 'alert' ? 'text-red-600' :
                      getPhStatus() === 'warning' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {activeSensors.length > 0 ? sensorAverages.ph.toFixed(1) : '—'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {activeSensors.length > 0
                      ? (sensorAverages.ph < 6.5 ? 'Acidic' : sensorAverages.ph > 7.5 ? 'Alkaline' : 'Neutral')
                      : 'No Data'}
                  </span>
                </div>
              </SensorCard>
              
              {/* Soil Moisture Sensor */}
              <SensorCard
                title="Soil Moisture"
                icon={FaTint}
                status={activeSensors.length > 0 ? getMoistureStatus() : "inactive"}
                onClick={() => handleSensorClick('Soil Moisture')}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="flex items-center">
                    <span className={`text-2xl font-bold ${
                      activeSensors.length === 0 ? 'text-gray-400' :
                      getMoistureStatus() === 'alert' ? 'text-red-600' :
                      getMoistureStatus() === 'warning' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {activeSensors.length > 0 ? `${sensorAverages.moisture.toFixed(0)}%` : '—'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">
                    {activeSensors.length > 0
                      ? (getMoistureStatus() === 'alert' ? 'Low moisture' : getMoistureStatus() === 'warning' ? 'Moderate' : 'Good')
                      : 'No Data'}
                  </span>
                </div>
              </SensorCard>
            </div>
          </div>
        </div>
        
        {/* Right column - Farm Map with Farm Info and Active Devices */}
        <div className="md:col-span-8 flex">
          {isLoading ? (
            <div className="bg-white p-4 rounded-lg shadow-md w-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <FarmMapCard 
              farmId={selectedFarmId || undefined}
              devices={devices}
              onViewFullMap={handleViewFullMap}
              isLoaded={isLoaded}
            />
          )}
          {error && (
            <div className="absolute top-2 right-2 bg-red-100 text-red-700 px-4 py-2 rounded">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;