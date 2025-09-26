import React from 'react';
import { GoogleMap } from '@react-google-maps/api';

// Define device status type
type DeviceStatus = 'online' | 'offline' | 'low_battery';

// Define device interface
interface Device {
  id: string;
  name: string;
  type: string;
  status: DeviceStatus;
}

// Define farm info interface
interface FarmInfo {
  name: string;
  type: string;
  operationDate: string;
  areaSize: string;
  coordinates: string;
}

interface FarmMapCardProps {
  farmInfo: FarmInfo;
  devices: Device[];
  isLoaded: boolean; // Add isLoaded to the props interface
  onViewFullMap?: () => void;
}

const FarmMapCard: React.FC<FarmMapCardProps> = ({
  farmInfo,
  devices,
  isLoaded, // Destructure isLoaded from props
  onViewFullMap
}) => {
  // Helper function to get status styles
  const getStatusStyles = (status: DeviceStatus) => {
    switch (status) {
      case 'online':
        return {
          border: 'border-green-500',
          badge: 'bg-green-100 text-green-800',
          text: 'Online'
        };
      case 'offline':
        return {
          border: 'border-gray-400',
          badge: 'bg-gray-100 text-gray-600',
          text: 'Offline'
        };
      case 'low_battery':
        return {
          border: 'border-yellow-500',
          badge: 'bg-yellow-100 text-yellow-800',
          text: 'Low Battery'
        };
      default:
        return {
          border: 'border-gray-300',
          badge: 'bg-gray-100 text-gray-600',
          text: 'Unknown'
        };
    }
  };

  // Parse coordinates from string (assuming format is "lat,lng")
  const getMapCenter = () => {
    try {
      const [lat, lng] = farmInfo.coordinates.split(',').map(coord => parseFloat(coord.trim()));
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    } catch (error) {
      console.error("Error parsing coordinates:", error);
    }
    // Default coordinates if parsing fails
    return { lat: 37.7749, lng: -122.4194 }; // Default to San Francisco
  };

  // The useJsApiLoader hook is removed from here.

  const mapContainerStyle = {
    width: '100%',
    height: '100%',
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full h-full flex flex-col">
      {/* Map Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-700">Farm Overview</h2>
        <button 
          className="text-blue-500 text-sm hover:underline"
          onClick={onViewFullMap}
        >
          View Full Map
        </button>
      </div>

      {/* Map Area */}
      <div className="h-[350px] w-full bg-gray-100 rounded-md mb-3 overflow-hidden border border-gray-200">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={getMapCenter()}
            zoom={14}
            options={{
              fullscreenControl: false,
              mapTypeControl: false,
              streetViewControl: false,
            }}
          >
            {/* No markers for now */}
          </GoogleMap>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="mb-2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">Loading Map...</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Farm Info and Active Sensors Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-grow">
        {/* Farm Information */}
        <div className="bg-gray-50 rounded-md p-3">
          <h3 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2 mb-2">
            Farm Information
          </h3>
          <div className="space-y-2">
            <div className="flex items-start">
              <span className="text-xs font-medium text-gray-500 w-28">Farm Name:</span>
              <span className="text-sm text-gray-700">{farmInfo.name}</span>
            </div>
            <div className="flex items-start">
              <span className="text-xs font-medium text-gray-500 w-28">Type:</span>
              <span className="text-sm text-gray-700">{farmInfo.type}</span>
            </div>
            <div className="flex items-start">
              <span className="text-xs font-medium text-gray-500 w-28">Operation Since:</span>
              <span className="text-sm text-gray-700">{farmInfo.operationDate}</span>
            </div>
            <div className="flex items-start">
              <span className="text-xs font-medium text-gray-500 w-28">Area Size:</span>
              <span className="text-sm text-gray-700">{farmInfo.areaSize}</span>
            </div>
            <div className="flex items-start">
              <span className="text-xs font-medium text-gray-500 w-28">Coordinates:</span>
              <span className="text-sm text-gray-700">{farmInfo.coordinates}</span>
            </div>
          </div>
        </div>
        
        {/* Active Sensors/Devices */}
        <div className="bg-gray-50 rounded-md p-3">
          <h3 className="text-sm font-medium text-gray-700 border-b border-gray-200 pb-2 mb-2">
            Active Devices
          </h3>
          <div className="max-h-[180px] overflow-y-auto pr-1">
            <div className="space-y-2">
              {devices.map(device => {
                const statusStyle = getStatusStyles(device.status);
                return (
                  <div 
                    key={device.id}
                    className={`flex items-center justify-between bg-white p-2 rounded-md border-l-4 ${statusStyle.border}`}
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-700">{device.name}</p>
                      <p className="text-xs text-gray-500">Type: {device.type}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusStyle.badge}`}>
                      {statusStyle.text}
                    </span>
                  </div>
                );
              })}
              
              {devices.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No devices found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmMapCard;