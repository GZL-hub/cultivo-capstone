import React, { useState } from 'react';
import SensorHeader from './components/SensorHeader';
import SensorStats from './components/SensorStats';
import SensorTable from './components/SensorTable';
import AddSensorModal from './components/AddSensorModal';
import { Sensor, sampleSensors } from './data/sensorData';

const SensorDevices: React.FC = () => {
  const [sensors] = useState<Sensor[]>(sampleSensors);
  const [filter, setFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredSensors = filter === 'all' 
    ? sensors 
    : sensors.filter(sensor => sensor.status === filter);

  return (
    <div className="relative w-full h-full flex flex-col bg-background">
      <SensorHeader 
        filter={filter}
        setFilter={setFilter}
        onAddClick={() => setIsAddModalOpen(true)}
      />
      
      <div className="flex-1 overflow-auto p-4">
        <div className="w-full mx-auto">
          <SensorStats sensors={sensors} />
          <SensorTable sensors={filteredSensors} />
        </div>
      </div>
      
      <AddSensorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};

export default SensorDevices;