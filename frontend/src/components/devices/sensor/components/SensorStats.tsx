import React from 'react';
import { Sensor } from '../data/sensorData';

interface SensorStatsProps {
  sensors: Sensor[];
}

const SensorStats: React.FC<SensorStatsProps> = ({ sensors }) => {
  const onlineCount = sensors.filter(s => s.status === 'online').length;
  const offlineCount = sensors.filter(s => s.status === 'offline').length;
  const maintenanceCount = sensors.filter(s => s.status === 'maintenance').length;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <StatCard 
        title="Online Sensors" 
        count={onlineCount} 
        color="green" 
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        } 
      />
      
      <StatCard 
        title="Offline Sensors" 
        count={offlineCount} 
        color="red" 
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        } 
      />
      
      <StatCard 
        title="Maintenance Needed" 
        count={maintenanceCount} 
        color="yellow" 
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        } 
      />
    </div>
  );
};

interface StatCardProps {
  title: string;
  count: number;
  color: 'green' | 'red' | 'yellow';
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, count, color, icon }) => {
  const getBorderClass = () => {
    switch (color) {
      case 'green': return 'border-primary-500';
      case 'red': return 'border-red-500';
      case 'yellow': return 'border-yellow-500';
      default: return 'border-gray-500';
    }
  };
  
  const getBgClass = () => {
    switch (color) {
      case 'green': return 'bg-green-100';
      case 'red': return 'bg-red-100';
      case 'yellow': return 'bg-yellow-100';
      default: return 'bg-gray-100';
    }
  };
  
  return (
    <div className={`bg-white rounded-lg shadow p-4 border-l-4 ${getBorderClass()}`}>
      <div className="text-sm font-medium text-gray-500">{title}</div>
      <div className="flex items-center justify-between mt-2">
        <div className="text-2xl font-semibold text-gray-900">
          {count}
        </div>
        <div className={`${getBgClass()} rounded-full p-2`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default SensorStats;