import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSensorsByFarm } from '../../services/sensorService';
import { ISensor } from '../../services/sensorService';
import { getFarms } from '../../services/farmService';
import SensorCard from './components/SensorCard';
import SensorDetailModal from './components/SensorDetailModal';
import AddSensorModal from './components/AddSensorModal';
import MonitoringOverview from './components/MonitoringOverview';
import {
  Activity,
  Plus,
  AlertCircle,
  Loader
} from 'lucide-react';

interface SensorDashboardProps {}

const SensorDashboard: React.FC<SensorDashboardProps> = () => {
  const { farmId } = useParams<{ farmId: string }>();
  const navigate = useNavigate();

  const [sensors, setSensors] = useState<ISensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSensor, setSelectedSensor] = useState<ISensor | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedFarmId, setSelectedFarmId] = useState<string | undefined>(farmId);
  const [farms, setFarms] = useState<any[]>([]);

  useEffect(() => {
    // If no farmId in URL, fetch farms for dropdown
    if (!farmId) {
      fetchFarms();
    }
  }, [farmId]);

  useEffect(() => {
    fetchSensors();
  }, [farmId, selectedFarmId, refreshKey]);

  const fetchFarms = async () => {
    try {
      const farmsData = await getFarms();
      setFarms(farmsData);
      // Auto-select first farm if available
      if (farmsData.length > 0 && !selectedFarmId) {
        setSelectedFarmId(farmsData[0]._id);
      }
    } catch (err) {
      console.error('Error fetching farms:', err);
    }
  };

  const fetchSensors = async () => {
    const activeFarmId = farmId || selectedFarmId;
    if (!activeFarmId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getSensorsByFarm(activeFarmId);
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

  const getStatusColor = (sensor: ISensor): 'normal' | 'warning' | 'alert' | 'offline' => {
    if (!sensor.isActive) return 'offline';
    if (!sensor.lastReading) return 'offline';

    const { moisture, ph, temperature } = sensor.lastReading;
    const { moistureThreshold, optimalPh, optimalTemperature } = sensor.settings;

    // Check for critical conditions
    if (moisture < moistureThreshold) return 'alert';
    if (ph < optimalPh.min - 0.5 || ph > optimalPh.max + 0.5) return 'alert';
    if (temperature < optimalTemperature.min - 5 || temperature > optimalTemperature.max + 5) return 'alert';

    // Check for warning conditions
    if (ph < optimalPh.min || ph > optimalPh.max) return 'warning';
    if (temperature < optimalTemperature.min || temperature > optimalTemperature.max) return 'warning';

    return 'normal';
  };

  // Show farm selector screen when no farm is selected
  if (!farmId && !selectedFarmId && !loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Select a Farm</h2>
          <p className="text-gray-600 mb-6">Choose a farm to view its sensor data</p>
          {farms.length > 0 ? (
            <select
              value={selectedFarmId || ''}
              onChange={(e) => setSelectedFarmId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-lg"
            >
              <option value="">Select a farm</option>
              {farms.map((farm) => (
                <option key={farm._id} value={farm._id}>
                  {farm.name}
                </option>
              ))}
            </select>
          ) : (
            <div>
              <p className="text-gray-500 mb-4">No farms available. Create a farm first.</p>
              <button
                onClick={() => navigate('/farm/overview')}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Go to Farm Management
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

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
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={fetchSensors}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto flex flex-col px-4 py-4 bg-background">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">Soil Sensor Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor your farm's soil conditions in real-time</p>
        </div>

        {/* Farm Selector (only show when no farmId in URL) */}
        {!farmId && farms.length > 0 && (
          <div className="mx-4">
            <select
              value={selectedFarmId || ''}
              onChange={(e) => setSelectedFarmId(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select a farm</option>
              {farms.map((farm) => (
                <option key={farm._id} value={farm._id}>
                  {farm.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={handleAddSensor}
          disabled={!farmId && !selectedFarmId}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Sensor
        </button>
      </div>

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
                status={getStatusColor(sensor)}
                onClick={() => handleSensorClick(sensor)}
              />
            ))}
          </div>
        </>
      )}

      {/* Modals */}
      {selectedSensor && (
        <SensorDetailModal
          sensor={selectedSensor}
          onClose={handleCloseModal}
          onUpdate={handleSensorUpdated}
        />
      )}

      {showAddModal && (farmId || selectedFarmId) && (
        <AddSensorModal
          farmId={farmId || selectedFarmId || ''}
          onClose={handleCloseAddModal}
          onSuccess={handleSensorAdded}
        />
      )}
    </div>
  );
};

export default SensorDashboard;
