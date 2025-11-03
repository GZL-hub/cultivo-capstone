import React, { useState, useEffect } from 'react';
import { GoogleMap, Polygon } from '@react-google-maps/api';
import axios from 'axios';
import { Map, MapPin } from 'lucide-react';

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
  farmBoundary: {
    type: string;
    coordinates: number[][][];
  };
}

interface FarmMapCardProps {
  farmId?: string; // Add farmId prop
  devices: Device[];
  isLoaded: boolean;
  onViewFullMap?: () => void;
}

const API_URL = '/api';

const FarmMapCard: React.FC<FarmMapCardProps> = ({
  farmId,
  devices,
  isLoaded,
  onViewFullMap
}) => {
  // Add state for farm info
  const [farmInfo, setFarmInfo] = useState<FarmInfo>({
    name: "Loading...",
    type: "Loading...",
    operationDate: "Loading...",
    areaSize: "Loading...",
    farmBoundary: {
      type: "Polygon",
      coordinates: [[[0, 0], [0, 0], [0, 0], [0, 0]]]
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch farm data when component mounts or farmId changes
  useEffect(() => {
    const fetchFarmData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let response;
        
        // If farmId is provided, fetch specific farm
        if (farmId) {
          response = await axios.get(`${API_URL}/farms/${farmId}`);
          console.log(`Fetching farm with ID: ${farmId}`);
        } else {
          // Otherwise fetch all farms and use the first one
          response = await axios.get(`${API_URL}/farms`);
          console.log('No farmId provided, fetching all farms');
        }
        
        // Handle farm data from response
        if (farmId && response.data.success && response.data.data) {
          // Single farm response format
          const farm = response.data.data;
          setFarmInfo({
            name: farm.name || "Unknown",
            type: farm.type || "Unknown",
            operationDate: farm.operationDate || "Unknown",
            areaSize: farm.areaSize || "Unknown",
            farmBoundary: farm.farmBoundary || {
              type: "Polygon",
              coordinates: [[[0, 0], [0, 0], [0, 0], [0, 0]]]
            }
          });
          console.log('Farm data received:', farm);
        } else if (!farmId && response.data.success && response.data.data && response.data.data.length > 0) {
          // Multiple farms response format - take first farm
          const farm = response.data.data[0];
          setFarmInfo({
            name: farm.name || "Unknown",
            type: farm.type || "Unknown",
            operationDate: farm.operationDate || "Unknown",
            areaSize: farm.areaSize || "Unknown",
            farmBoundary: farm.farmBoundary || {
              type: "Polygon",
              coordinates: [[[0, 0], [0, 0], [0, 0], [0, 0]]]
            }
          });
          console.log('Multiple farms found, using first farm:', farm);
        } else {
          setError('No farm registered. Please create a farm in Farm Management.');
        }
      } catch (err: any) {
        console.error('Error fetching farm data:', err);
        const errorMessage = err.response?.data?.error || 'Failed to load farm data';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have a farmId
    if (farmId) {
      fetchFarmData();
    } else {
      setLoading(false);
      setError('No farm registered. Please create a farm in Farm Management.');
    }
  }, [farmId]); // Re-fetch when farmId changes

  // Helper function to get status styles
  const getStatusStyles = (status: DeviceStatus) => {
    switch (status) {
      case 'online':
        return {
          border: 'border-primary-500',
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

  // Get map center from farm boundary
  const getMapCenter = () => {
    try {
      if (farmInfo.farmBoundary && 
          farmInfo.farmBoundary.coordinates && 
          farmInfo.farmBoundary.coordinates.length > 0 && 
          farmInfo.farmBoundary.coordinates[0].length > 0) {
        
        // Calculate center from polygon points
        const points = farmInfo.farmBoundary.coordinates[0];
        const lats = points.map(p => p[1]);
        const lngs = points.map(p => p[0]);
        
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        
        return {
          lat: (minLat + maxLat) / 2,
          lng: (minLng + maxLng) / 2
        };
      }
    } catch (error) {
      console.error("Error calculating map center:", error);
    }
    // Default coordinates if parsing fails (Manila, Philippines)
    return { lat: 14.5995, lng: 120.9842 };
  };

  // Convert boundary coordinates to Google Maps LatLngLiteral format
  const getBoundaryPath = () => {
    try {
      if (farmInfo.farmBoundary && 
          farmInfo.farmBoundary.coordinates && 
          farmInfo.farmBoundary.coordinates.length > 0) {
        
        return farmInfo.farmBoundary.coordinates[0].map(point => ({
          lat: point[1],
          lng: point[0]
        }));
      }
    } catch (error) {
      console.error("Error parsing boundary coordinates:", error);
    }
    return [];
  };

  const mapContainerStyle = {
    width: '100%',
    height: '100%',
  };

  const polygonOptions = {
    fillColor: "rgba(76, 175, 80, 0.3)",
    fillOpacity: 0.5,
    strokeColor: "#4CAF50",
    strokeOpacity: 1,
    strokeWeight: 2,
  };

  // Show empty state if no farm is registered
  if (error && (error.includes('No farm registered') || error.includes('No farm data found'))) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md w-full h-full flex flex-col items-center justify-center">
        <div className="text-center max-w-md">
          {/* Icon */}
          <div className="mb-4 text-gray-300">
            <Map className="h-24 w-24 mx-auto" strokeWidth={1.5} />
          </div>

          {/* Message */}
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Farm Registered</h3>
          <p className="text-gray-500 mb-4">
            You haven't created a farm yet. Get started by creating and drawing your farm boundary in Farm Management.
          </p>

          {/* Action button */}
          <button
            onClick={onViewFullMap}
            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Go to Farm Management
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full h-full flex flex-col">
      {/* Map Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-700">
          {loading ? 'Loading Farm...' : `Farm Overview: ${farmInfo.name}`}
        </h2>
        <button
          className="text-blue-500 text-sm hover:underline"
          onClick={onViewFullMap}
        >
          View Full Map
        </button>
      </div>

      {/* Map Area */}
      <div className="h-[350px] w-full bg-gray-100 rounded-md mb-3 overflow-hidden border border-gray-200">
        {isLoaded && !loading && !error ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={getMapCenter()}
            zoom={15}
            options={{
              fullscreenControl: false,
              mapTypeControl: false,
              streetViewControl: false,
            }}
          >
            {/* Farm Boundary Polygon */}
            <Polygon
              paths={getBoundaryPath()}
              options={polygonOptions}
            />
          </GoogleMap>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="mb-2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">
                {!isLoaded ? 'Loading Map...' : 'Loading Farm Data...'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error message if present (but not "no farm" errors) */}
      {error && !error.includes('No farm registered') && !error.includes('No farm data found') && (
        <div className="bg-red-50 text-red-600 p-3 mb-3 rounded-md">
          <p className="text-sm">{error}</p>
        </div>
      )}
      
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
              <span className="text-xs font-medium text-gray-500 w-28">Boundary Type:</span>
              <span className="text-sm text-gray-700">{farmInfo.farmBoundary.type}</span>
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