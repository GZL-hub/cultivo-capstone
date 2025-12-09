import React, { useState, useEffect, useRef } from 'react';
import CameraHeader from './components/CameraHeader';
import CameraTable from './components/CameraTable';
import AddCameraModal, { CameraData } from './components/AddCameraModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import { getCCTVs, createCCTV, updateCCTV, deleteCCTV, CCTV, checkAndUpdateCameraStatuses, checkCameraStatus } from '../../../services/cctvService';
import { getFarms } from '../../../services/farmService';
import authService from '../../../services/authService';
import LoadingSpinner from '../../common/LoadingSpinner';

const CameraDevices: React.FC = () => {
  const [cameras, setCameras] = useState<CCTV[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<CCTV | null>(null);
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
  const [farms, setFarms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(false);
  const statusCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const userId = authService.getCurrentUser()?.id || '';

  // Fetch available farms when component mounts
  useEffect(() => {
    const fetchUserFarms = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const userFarms = await getFarms(userId);
        setFarms(userFarms);

        // Set first farm as selected if available
        if (userFarms.length > 0) {
          setSelectedFarmId(userFarms[0]._id);
        }
      } catch (error) {
        console.error('Error loading farms:', error);
        setError('Failed to load farms. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserFarms();
  }, [userId]);

  // Function to check camera statuses
  const checkCameraStatuses = async () => {
    if (!selectedFarmId || cameras.length === 0) return;

    try {
      setIsCheckingStatus(true);
      const updatedCameras = await checkAndUpdateCameraStatuses(selectedFarmId, cameras);
      setCameras(updatedCameras);
    } catch (error) {
      console.error('Error checking camera statuses:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Fetch cameras when farm is selected
  useEffect(() => {
    const fetchCameras = async () => {
      if (!selectedFarmId) return;

      try {
        setIsLoading(true);
        setError(null);
        const cctvData = await getCCTVs(selectedFarmId);
        setCameras(cctvData);

        // Automatically check camera statuses after loading
        if (cctvData.length > 0) {
          const updatedCameras = await checkAndUpdateCameraStatuses(selectedFarmId, cctvData);
          setCameras(updatedCameras);
        }
      } catch (error) {
        console.error('Error loading cameras:', error);
        setError('Failed to load cameras.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCameras();
  }, [selectedFarmId]);

  // Set up periodic status checking (every 30 seconds)
  useEffect(() => {
    if (cameras.length === 0 || !selectedFarmId) return;

    // Clear any existing interval
    if (statusCheckIntervalRef.current) {
      clearInterval(statusCheckIntervalRef.current);
    }

    // Set up new interval for status checking
    statusCheckIntervalRef.current = setInterval(() => {
      checkCameraStatuses();
    }, 30000); // Check every 30 seconds

    // Cleanup on unmount
    return () => {
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
      }
    };
  }, [cameras.length, selectedFarmId]);

  const filteredCameras = filter === 'all'
    ? cameras
    : cameras.filter(camera => camera.status === filter);

  const handleAddCamera = async (cameraData: CameraData) => {
    if (!selectedFarmId) {
      setError('No farm selected');
      return;
    }

    try {
      const newCCTV = await createCCTV(selectedFarmId, {
        name: cameraData.name,
        type: cameraData.type,
        streamUrl: cameraData.streamUrl,
        status: 'offline'
      });

      // Check the status of the new camera immediately
      const newStatus = await checkCameraStatus(cameraData.streamUrl);
      newCCTV.status = newStatus;

      setCameras([...cameras, newCCTV]);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error creating camera:', error);
      setError('Failed to create camera.');
    }
  };

  const handleOpenEditModal = (camera: CCTV) => {
    setSelectedCamera(camera);
    setIsEditModalOpen(true);
  };

  const handleEditCamera = async (cameraData: CameraData) => {
    if (!selectedFarmId || !selectedCamera?._id) return;

    try {
      await updateCCTV(selectedFarmId, selectedCamera._id, {
        name: cameraData.name,
        type: cameraData.type,
        streamUrl: cameraData.streamUrl
      });

      // Check the status of the updated camera immediately
      const newStatus = await checkCameraStatus(cameraData.streamUrl);

      // Update local state with new data and status
      const updatedCameras = cameras.map(cam =>
        cam._id === selectedCamera._id
          ? { ...cam, name: cameraData.name, type: cameraData.type, streamUrl: cameraData.streamUrl, status: newStatus }
          : cam
      );
      setCameras(updatedCameras);

      setIsEditModalOpen(false);
      setSelectedCamera(null);
    } catch (error) {
      console.error('Error updating camera:', error);
      setError('Failed to update camera.');
    }
  };

  const handleOpenDeleteModal = (camera: CCTV) => {
    setSelectedCamera(camera);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCamera = async () => {
    if (!selectedFarmId || !selectedCamera?._id) return;

    try {
      await deleteCCTV(selectedFarmId, selectedCamera._id);
      setCameras(cameras.filter(cam => cam._id !== selectedCamera._id));
      setIsDeleteModalOpen(false);
      setSelectedCamera(null);
    } catch (error) {
      console.error('Error deleting camera:', error);
      setError('Failed to delete camera.');
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-background">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md m-4 border border-red-200">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="font-medium">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <CameraHeader
        filter={filter}
        setFilter={setFilter}
        onAddClick={() => setIsAddModalOpen(true)}
        onRefreshStatus={checkCameraStatuses}
        isCheckingStatus={isCheckingStatus}
      />

      {/* Loading Display */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64 m-4">
          <LoadingSpinner size="lg" text="Loading cameras..." />
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-4">
          <div className="w-full mx-auto">
            <CameraTable
              cameras={filteredCameras}
              onEdit={handleOpenEditModal}
              onDelete={handleOpenDeleteModal}
            />
          </div>
        </div>
      )}

      {/* Add Camera Modal */}
      <AddCameraModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddCamera={handleAddCamera}
      />

      {/* Edit Camera Modal */}
      <AddCameraModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCamera(null);
        }}
        onAddCamera={handleAddCamera}
        onEditCamera={handleEditCamera}
        editMode={true}
        initialData={selectedCamera ? {
          _id: selectedCamera._id,
          name: selectedCamera.name,
          type: selectedCamera.type,
          streamUrl: selectedCamera.streamUrl
        } : undefined}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedCamera(null);
        }}
        onConfirm={handleDeleteCamera}
        cameraName={selectedCamera?.name || ''}
      />
    </div>
  );
};

export default CameraDevices;