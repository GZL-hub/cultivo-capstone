import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSensorsByFarm, ISensor, getActiveSensors, calculateSensorAverages, getSensorHealthCounts } from '../../services/sensorService';
import { getFarms } from '../../services/farmService';
import authService from '../../services/authService';
import { Activity, AlertCircle, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState, { MapPin } from '../common/EmptyState';

// Import metric cards
import MoistureCard from './cards/MoistureCard';
import TemperatureCard from './cards/TemperatureCard';
import PhCard from './cards/PhCard';
import NPKCard from './cards/NPKCard';
import ECCard from './cards/ECCard';

const SensorMonitoringDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [sensors, setSensors] = useState<ISensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [farmId, setFarmId] = useState<string | null>(null);
  const [farmName, setFarmName] = useState<string>('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch user's farm on mount
  useEffect(() => {
    fetchUserFarm();
  }, []);

  // Fetch sensors when farmId changes
  useEffect(() => {
    if (farmId) {
      fetchSensors();
    }
  }, [farmId]);

  // Auto-refresh sensors every 1 minute
  useEffect(() => {
    if (!farmId) return;

    const intervalId = setInterval(() => {
      fetchSensors(true);
    }, 60000);

    return () => clearInterval(intervalId);
  }, [farmId]);

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

      const farmsData = await getFarms();

      if (farmsData.length === 0) {
        setError('No farm found. Please create a farm first.');
        setLoading(false);
        return;
      }

      setFarmId(farmsData[0]._id);
      setFarmName(farmsData[0].name);
    } catch (err: any) {
      console.error('Error fetching farm:', err);
      setError(err.response?.data?.error || 'Failed to load farm');
      setLoading(false);
    }
  };

  const fetchSensors = async (isBackgroundRefresh = false) => {
    if (!farmId) return;

    try {
      if (!isBackgroundRefresh) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);
      const data = await getSensorsByFarm(farmId);
      setSensors(data);
      setLastRefresh(new Date());
    } catch (err: any) {
      console.error('Error fetching sensors:', err);
      setError(err.response?.data?.error || 'Failed to load sensors');
    } finally {
      if (!isBackgroundRefresh) {
        setLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  };

  const handleManualRefresh = () => {
    fetchSensors(true);
  };

  const formatLastRefresh = () => {
    const now = new Date();
    const diffMs = now.getTime() - lastRefresh.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 60) return `${diffSecs}s ago`;
    const diffMins = Math.floor(diffSecs / 60);
    return `${diffMins}m ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner size="lg" text="Loading sensors..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        {error.includes('No farm found') ? (
          <EmptyState
            icon={MapPin}
            title="No Farm Found"
            description="Create your farm to start monitoring sensors"
            actionLabel="Create Farm"
            onAction={() => navigate('/farm/overview')}
            variant="warning"
          />
        ) : (
          <div className="text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-red-600 font-medium mb-2">{error}</p>
            <button
              onClick={fetchUserFarm}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    );
  }

  // Calculate metrics
  const activeSensors = getActiveSensors(sensors);
  const averages = calculateSensorAverages(sensors);
  const health = getSensorHealthCounts(sensors);

  return (
    <div className="w-full h-full overflow-auto flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 z-10">
        <div className="w-full px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-bold text-gray-800">Farm Monitoring Overview ({farmName})</h1>
              
              {/* Sensor Status Indicator - Straight Row */}
              <div className="flex items-center space-x-4 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="relative flex items-center">
                    <div className={`w-2.5 h-2.5 rounded-full ${activeSensors.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    <div className={`absolute w-2.5 h-2.5 rounded-full ${activeSensors.length > 0 ? 'bg-green-500 animate-ping' : ''}`}></div>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">
                    Online: {activeSensors.length}/{sensors.length}
                  </p>
                </div>
                
                <div className="h-6 w-px bg-gray-300"></div>
                
                <div className="flex items-center space-x-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${sensors.length - activeSensors.length > 0 ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                  <p className="text-sm font-semibold text-gray-700">
                    Offline: {sensors.length - activeSensors.length}/{sensors.length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <p className="text-xs text-gray-500">
                Last updated: {formatLastRefresh()}
              </p>
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {sensors.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No Sensors Found"
            description="Add sensors from the Sensor Management page"
            actionLabel="Go to Sensor Management"
            onAction={() => navigate('/device-settings/sensors')}
          />
        ) : (
          <div className="space-y-6">
            {/* Primary Metrics - Top Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <MoistureCard
                moisture={averages.moisture}
                activeSensorCount={activeSensors.length}
              />
              <TemperatureCard
                temperature={averages.temperature}
                activeSensorCount={activeSensors.length}
              />
              <PhCard
                ph={averages.ph}
                activeSensorCount={activeSensors.length}
              />
            </div>

            {/* Secondary Metrics - Bottom Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ECCard
                ec={averages.ec}
                activeSensorCount={activeSensors.length}
              />
              <NPKCard
                nitrogen={sensors.reduce((sum, s) => sum + (s.lastReading?.nitrogen || 0), 0) / (activeSensors.length || 1)}
                phosphorus={sensors.reduce((sum, s) => sum + (s.lastReading?.phosphorus || 0), 0) / (activeSensors.length || 1)}
                potassium={sensors.reduce((sum, s) => sum + (s.lastReading?.potassium || 0), 0) / (activeSensors.length || 1)}
                activeSensorCount={activeSensors.length}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SensorMonitoringDashboard;