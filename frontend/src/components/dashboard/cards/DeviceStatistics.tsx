import React from 'react';
import { Smartphone } from 'lucide-react';
import EmptyStateCard from './EmptyStateCard';

// Device Statistics Component
interface DeviceStatProps {
  totalRegistered: number;
  totalOnline: number;
  onAddDevices?: () => void;
}

const DeviceStatistics: React.FC<DeviceStatProps> = ({ totalRegistered, totalOnline, onAddDevices }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
      <h2 className="text-lg font-semibold text-gray-700 mb-2">Device Statistics</h2>

      {totalRegistered === 0 ? (
        // Empty State
        <div className="py-4">
          <EmptyStateCard
            icon={Smartphone}
            title="No Devices Registered"
            description="Start monitoring your farm by adding sensors and cameras"
            ctaText={onAddDevices ? "Add Devices" : undefined}
            onCtaClick={onAddDevices}
            variant="compact"
          />
        </div>
      ) : (
        // Statistics Display
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-6">
          <div className="flex-1">
            <p className="text-sm text-gray-500">Total Registered</p>
            <div className="h-12 flex items-center">
              <span className="text-2xl font-bold text-blue-600">{totalRegistered}</span>
              <span className="text-xs ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Devices</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500">Online</p>
            <div className="h-12 flex items-center">
              <span className="text-2xl font-bold text-green-600">{totalOnline}</span>
              <span className="text-xs ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded">Devices</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceStatistics;