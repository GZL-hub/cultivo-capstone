import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSensorsByFarm, ISensor, deleteSensor } from '../../services/sensorService';
import { getFarms } from '../../services/farmService';
import SensorTable from './components/SensorTable';
import SensorDetailModal from './components/SensorDetailModal';
import AddSensorModal from './components/AddSensorModal';
import EditSensorModal from './components/EditSensorModal';
import DeleteSensorModal from './components/DeleteSensorModal';
import authService from '../../services/authService';
import {
  Plus,
  AlertCircle,
  Loader
} from 'lucide-react';

interface SensorDashboardProps {}

const SensorDashboard: React.FC<SensorDashboardProps> = () => {
  const navigate = useNavigate();

  const [sensors, setSensors] = useState<ISensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSensor, setSelectedSensor] = useState<ISensor | null>(null);
  const [sensorToEdit, setSensorToEdit] = useState<ISensor | null>(null);
  const [sensorToDelete, setSensorToDelete] = useState<ISensor | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [farmId, setFarmId] = useState<string | null>(null);
  const [farmName, setFarmName] = useState<string>('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Fetch user's farm on mount
  useEffect(() => {
    fetchUserFarm();
  }, []);

  // Fetch sensors when farmId changes or refresh is triggered
  useEffect(() => {
    if (farmId) {
      fetchSensors();
    }
  }, [farmId, refreshKey]);

  // Auto-refresh sensors every 1 minute
  useEffect(() => {
    if (!farmId) return;

    const intervalId = setInterval(() => {
      fetchSensors(true); // Pass true to indicate background refresh
    }, 60000); // 1 minute

    // Cleanup interval on unmount
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

  const fetchSensors = async (isBackgroundRefresh = false) => {
    if (!farmId) return;

    try {
      // Only show loading spinner on initial load, not on auto-refresh
      if (!isBackgroundRefresh) {
        setLoading(true);
      }
      setError(null);
      const data = await getSensorsByFarm(farmId);
      setSensors(data);
    } catch (err: any) {
      console.error('Error fetching sensors:', err);
      setError(err.response?.data?.error || 'Failed to load sensors');
    } finally {
      if (!isBackgroundRefresh) {
        setLoading(false);
      }
      setIsInitialLoad(false);
    }
  };

  const handleViewHistory = (sensor: ISensor) => {
    setSelectedSensor(sensor);
  };

  const handleEdit = (sensor: ISensor) => {
    setSensorToEdit(sensor);
  };

  const handleDelete = (sensor: ISensor) => {
    setSensorToDelete(sensor);
  };

  const handleConfirmDelete = async () => {
    if (!sensorToDelete) return;

    try {
      await deleteSensor(sensorToDelete._id);
      setRefreshKey(prev => prev + 1);
      setSensorToDelete(null);
    } catch (error) {
      console.error('Error deleting sensor:', error);
      throw error; // Let the modal handle the error display
    }
  };

  const handleCloseModal = () => {
    setSelectedSensor(null);
  };

  const handleCloseEditModal = () => {
    setSensorToEdit(null);
  };

  const handleCloseDeleteModal = () => {
    setSensorToDelete(null);
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

  const handleEditSensorUpdated = () => {
    setRefreshKey(prev => prev + 1);
    setSensorToEdit(null);
  };

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
              <h1 className="text-xl font-bold text-gray-800">
                All Sensors ({sensors.length})
              </h1>
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
            <div className="text-center bg-white rounded-lg shadow-md p-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
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
          <div className="space-y-4">
            <SensorTable
              sensors={sensors}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewHistory={handleViewHistory}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      {/* History/Detail Modal */}
      {selectedSensor && (
        <SensorDetailModal
          sensor={selectedSensor}
          onClose={handleCloseModal}
          onUpdate={handleSensorUpdated}
        />
      )}

      {/* Edit Modal */}
      {sensorToEdit && (
        <EditSensorModal
          sensor={sensorToEdit}
          onClose={handleCloseEditModal}
          onUpdate={handleEditSensorUpdated}
        />
      )}

      {/* Delete Confirmation Modal */}
      {sensorToDelete && (
        <DeleteSensorModal
          sensor={sensorToDelete}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
        />
      )}

      {/* Add Sensor Modal */}
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
