import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSensorsByFarm, ISensor, getSensorStatus } from '../../services/sensorService';
import { getFarms } from '../../services/farmService';
import SensorCard from './components/SensorCard';
import SensorDetailModal from './components/SensorDetailModal';
import AddSensorModal from './components/AddSensorModal';
import MonitoringOverview from './components/MonitoringOverview';
import authService from '../../services/authService';
import socketService from '../../services/socketService';
import {
  Activity,
  Plus,
  AlertCircle,
  Loader,
  Wifi,
  WifiOff
} from 'lucide-react';

interface SensorDashboardProps {}

const SensorDashboard: React.FC<SensorDashboardProps> = () => {
  const navigate = useNavigate();

  const [sensors, setSensors] = useState<ISensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSensor, setSelectedSensor] = useState<ISensor | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [farmId, setFarmId] = useState<string | null>(null);
  const [farmName, setFarmName] = useState<string>('');
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  // Fetch user's farm on mount
  useEffect(() => {
    fetchUserFarm();
  }, []);

  // Fetch sensors when farmId changes
  useEffect(() => {
    if (farmId) {
      fetchSensors();
    }
  }, [farmId, refreshKey]);

  // Handle real-time sensor updates
  const handleSensorUpdate = useCallback((data: any) => {
    console.log('[Real-time] Sensor update received:', data);

    // Update the sensor in the list
    setSensors((prevSensors) =>
      prevSensors.map((sensor) =>
        sensor._id === data.sensorId
          ? { ...sensor, lastReading: data.lastReading }
          : sensor
      )
    );
  }, []);

  // Set up Socket.IO connection and listeners
  useEffect(() => {
    if (!farmId) return;

    // Connect to Socket.IO
    socketService.connect();
    socketService.joinFarm(farmId);
    setIsSocketConnected(socketService.isConnected());

    // Subscribe to sensor updates
    socketService.onSensorUpdate(handleSensorUpdate);

    // Cleanup on unmount
    return () => {
      socketService.offSensorUpdate(handleSensorUpdate);
      socketService.leaveFarm();
    };
  }, [farmId, handleSensorUpdate]);

  const fetchUserFarm = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser = authService.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        setError('Please log in to view sensors');
        setLoading(false);
        return;
      }

      // Fetch user's farm (one user = one farm)
      const farmsData = await getFarms();

      if (farmsData.length === 0) {
        setError('No farm found. Please create a farm first.');
        setLoading(false);
        return;
      }

      // Use the first (and only) farm
      setFarmId(farmsData[0]._id);
      setFarmName(farmsData[0].name);
    } catch (err: any) {
      console.error('Error fetching farm:', err);
      setError(err.response?.data?.error || 'Failed to load farm');
      setLoading(false);
    }
  };

  const fetchSensors = async () => {
    if (!farmId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getSensorsByFarm(farmId);
      setSensors(data);
    } catch (err: any) {
      console.error('Error fetching sensors:', err);
      setError(err.response?.data?.error || 'Failed to load sensors');
    } finally {
      setLoading(false);
    }
  };

  const handleSensorClick = (sensor: ISensor) => {
    setSelectedSensor(sensor);
  };

  const handleCloseModal = () => {
    setSelectedSensor(null);
  };

  const handleAddSensor = () => {
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };

  const handleSensorAdded = () => {
    setRefreshKey(prev => prev + 1);
    setShowAddModal(false);
  };

  const handleSensorUpdated = () => {
    setRefreshKey(prev => prev + 1);
    setSelectedSensor(null);
  };

  // Use consolidated service function for sensor status

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading sensors...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-600 font-medium mb-2">{error}</p>
          {error.includes('No farm found') ? (
            <div>
              <p className="text-gray-600 mb-4">Create your farm to start adding sensors</p>
              <button
                onClick={() => navigate('/farm/overview')}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Create Farm
              </button>
            </div>
          ) : (
            <button
              onClick={fetchUserFarm}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto flex flex-col bg-background">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 z-10">
        <div className="w-full px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-800">{farmName} - Sensor Management</h1>
              {/* Real-time connection indicator */}
              <div className="flex items-center space-x-1">
                {isSocketConnected ? (
                  <>
                    <Wifi className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">Live</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-400">Offline</span>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={handleAddSensor}
              disabled={!farmId}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Sensor
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">

      {sensors.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Sensors Found</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first soil sensor</p>
            <button
              onClick={handleAddSensor}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Add Your First Sensor
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Monitoring Overview Component */}
          <MonitoringOverview sensors={sensors} />

          {/* Sensor Grid */}
          <div className="mt-6 mb-2">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              All Sensors ({sensors.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sensors.map((sensor) => (
              <SensorCard
                key={sensor._id}
                sensor={sensor}
                status={getSensorStatus(sensor)}
                onClick={() => handleSensorClick(sensor)}
              />
            ))}
          </div>
        </>
      )}

      </div>

      {/* Modals */}
      {selectedSensor && (
        <SensorDetailModal
          sensor={selectedSensor}
          onClose={handleCloseModal}
          onUpdate={handleSensorUpdated}
        />
      )}

      {showAddModal && farmId && (
        <AddSensorModal
          farmId={farmId}
          onClose={handleCloseAddModal}
          onSuccess={handleSensorAdded}
        />
      )}
    </div>
  );
};

export default SensorDashboard;
