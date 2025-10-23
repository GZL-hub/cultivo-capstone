import React, { useState } from 'react';
import CameraHeader from './components/CameraHeader';
import CameraTable from './components/CameraTable';
import AddCameraModal, { CameraData } from './components/AddCameraModal';
import { Camera, sampleCameras } from './data/cameraData';

const CameraDevices: React.FC = () => {
  const [cameras, setCameras] = useState<Camera[]>(sampleCameras);
  const [filter, setFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredCameras = filter === 'all' 
    ? cameras 
    : cameras.filter(camera => camera.status === filter);
    
  const handleAddCamera = (cameraData: CameraData) => {
    // Convert CameraData to Camera type with additional required fields
    const newCamera: Camera = {
      id: `camera-${Date.now()}`, // Generate a unique ID
      name: cameraData.name,
      type: cameraData.type,
      location: cameraData.location,
      resolution: cameraData.resolution,
      streamUrl: cameraData.streamUrl,
      status: 'online', // Default to online
      lastUpdated: new Date().toISOString(),
      thumbnail: '/images/camera-placeholder.jpg' // Use a placeholder image
    };
    
    // Add the new camera to the array
    setCameras([...cameras, newCamera]);
    
    // You might want to save this to your backend API here
    console.log('Added new camera:', newCamera);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-gray-50">
      <CameraHeader 
        filter={filter}
        setFilter={setFilter}
        onAddClick={() => setIsAddModalOpen(true)}
      />
      
      <div className="flex-1 overflow-auto p-4">
        <div className="w-full mx-auto">
          <CameraTable cameras={filteredCameras} />
        </div>
      </div>
      
      <AddCameraModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddCamera={handleAddCamera}
      />
    </div>
  );
};

export default CameraDevices;