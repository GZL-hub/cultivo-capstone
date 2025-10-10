import React, { useState } from 'react';
import CameraHeader from './components/CameraHeader';
import CameraTable from './components/CameraTable';
import AddCameraModal from './components/AddCameraModal';
import { Camera, sampleCameras } from './data/cameraData';

const CameraDevices: React.FC = () => {
  const [cameras] = useState<Camera[]>(sampleCameras);
  const [filter, setFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredCameras = filter === 'all' 
    ? cameras 
    : cameras.filter(camera => camera.status === filter);

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
      />
    </div>
  );
};

export default CameraDevices;