import React from 'react';

export const CardSkeleton: React.FC = () => (
  <div className="bg-white p-4 rounded-lg shadow-md animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded w-full"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
    </div>
  </div>
);

export const SensorCardSkeleton: React.FC = () => (
  <div className="bg-white p-4 rounded-lg border border-gray-200 animate-pulse">
    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
    <div className="flex flex-col items-center justify-center">
      <div className="h-8 w-20 bg-gray-200 rounded mb-2"></div>
      <div className="h-3 w-16 bg-gray-200 rounded"></div>
    </div>
  </div>
);

export const DeviceStatsSkeleton: React.FC = () => (
  <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
    <div className="flex justify-between items-start mb-6">
      <div>
        <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-48"></div>
      </div>
      <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
    </div>
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 rounded w-16"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 rounded w-16"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
    <div className="h-10 bg-gray-200 rounded w-full"></div>
  </div>
);

export const MapCardSkeleton: React.FC = () => (
  <div className="bg-white p-4 rounded-lg shadow-md w-full animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
    <div className="w-full h-96 bg-gray-200 rounded"></div>
  </div>
);

export const SensorAlertsSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="h-6 bg-gray-200 rounded w-32"></div>
      <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
    </div>
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className="h-10 w-10 bg-gray-200 rounded-full flex-shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const SensorDashboardSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 gap-3 h-full">
    {[1, 2, 3, 4].map((i) => (
      <SensorCardSkeleton key={i} />
    ))}
  </div>
);
