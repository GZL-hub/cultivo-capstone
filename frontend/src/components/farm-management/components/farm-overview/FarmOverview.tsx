import React, { useState, useEffect } from 'react';
import GoogleMap from '../../../googlemap/GoogleMap';
import { Wifi, WifiOff } from 'lucide-react';
import { IFarm, getFarms } from '../../../../services/farmService';
import axios from 'axios';
import CalendarCard from './calendar/CalendarCard';
import WorkerCard from './worker/WorkerCard';

// API URL
const API_URL = '/api';

// Extended Farm interface with additional fields from dummy data
interface ExtendedFarm extends IFarm {
  activeDevices: number;
  inactiveDevices: number;
  lastActivity: string;
  id: string; // Ensure farm has an id for the WorkerCard
}

interface FarmEvent {
  id: string;
  title: string;
  date: Date;
  category: 'planting' | 'harvesting' | 'maintenance' | 'other';
}

interface FarmOverviewProps {
  farmId?: string; // Optional: if provided, fetch specific farm by ID
  ownerId: string;
}

// Helper function to calculate farm center from boundary
const calculateFarmCenter = (farmBoundary?: { type: string; coordinates: number[][][] }) => {
  try {
    if (farmBoundary && 
        farmBoundary.coordinates && 
        farmBoundary.coordinates.length > 0 && 
        farmBoundary.coordinates[0].length > 0) {
      
      const points = farmBoundary.coordinates[0];
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
    console.error("Error calculating farm center:", error);
  }
  
  // Default coordinates if calculation fails
  return { lat: 14.5995, lng: 120.9842 };
};

// Helper function to format coordinates for display
const formatBoundaryCoordinates = (farmBoundary?: { type: string; coordinates: number[][][] }) => {
  try {
    if (farmBoundary && 
        farmBoundary.coordinates && 
        farmBoundary.coordinates.length > 0 && 
        farmBoundary.coordinates[0].length > 0) {
      
      // Just show first point for brevity
      const firstPoint = farmBoundary.coordinates[0][0];
      return `${firstPoint[1].toFixed(6)}°N, ${firstPoint[0].toFixed(6)}°E`;
    }
  } catch (error) {
    console.error("Error formatting boundary coordinates:", error);
  }
  
  return "Coordinates not available";
};

// Convert boundary to Google Maps polygon format
const getBoundaryPolygon = (farmBoundary?: { type: string; coordinates: number[][][] }) => {
  try {
    if (farmBoundary && 
        farmBoundary.coordinates && 
        farmBoundary.coordinates.length > 0) {
      
      return farmBoundary.coordinates[0].map(point => ({
        lat: point[1],
        lng: point[0]
      }));
    }
  } catch (error) {
    console.error("Error parsing boundary coordinates:", error);
  }
  return [];
};

const FarmOverview: React.FC<FarmOverviewProps> = ({ farmId, ownerId }) => {
  const [farm, setFarm] = useState<ExtendedFarm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workerFarmId, setWorkerFarmId] = useState<string>('');

  
  // Fetch farm data on component mount
  useEffect(() => {
    const fetchFarmData = async () => {
      try {
        setIsLoading(true);
        
        let farmData;
        let actualFarmId: string;
        
        if (farmId) {
          // Fetch specific farm if ID is provided
          const response = await axios.get(`${API_URL}/farms/${farmId}`);
          farmData = response.data.data;
          actualFarmId = farmId;
        } else {
          // Fetch farms filtered by owner
          const farms = await getFarms(ownerId);
          farmData = farms && farms.length > 0 ? farms[0] : null;
          // Use the real farm ID from the API response
          actualFarmId = farmData?._id || ''; 
        }
        
        // Set the farm ID for the worker service to use
        setWorkerFarmId(actualFarmId);
        
        if (farmData) {
          // Keep using the original ID for the farm object
          const id = farmData._id || farmData.id || farmId || `farm-${Date.now()}`;
          
          // Extend with device info (which would normally come from a separate API call)
          setFarm({
            ...farmData,
            id,
            activeDevices: 5, // Example values, could be fetched from a devices API
            inactiveDevices: 2,
            lastActivity: new Date().toISOString()
          });
        } else {
          // Not an error, just no farms yet
          setFarm(null);
        }
      } catch (err) {
        console.error('Error fetching farm data:', err);
        setError("Failed to load farm data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFarmData();
  }, [farmId, ownerId]);

  // Handlers for calendar events
  const handleViewEvent = (event: FarmEvent) => {
    console.log('View event:', event);
    // In a real app, you might navigate to an event details page or open a modal
  };

  const handleAddEvent = () => {
    console.log('Add new event');
    // In a real app, you would open a form to add a new event
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading farm data...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error && !farm) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md">
        <p className="font-medium">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  // If we have no farm data at this point, something went very wrong
  if (!farm) {
    return (
      <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md">
        <p>No farm data available.</p>
      </div>
    );
  }
  
  // Calculate center coordinates for the map
  const farmCenter = calculateFarmCenter(farm.farmBoundary);
  const boundaryCoordinates = formatBoundaryCoordinates(farm.farmBoundary);
  const polygonPath = getBoundaryPolygon(farm.farmBoundary);
  
  return (
  <div className="w-full h-full flex flex-col px-4 py-3 bg-background">
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Center Map and Farm Info */}
      <div className="xl:col-span-2 flex flex-col gap-6 h-full">
        {/* Map Card */}
        <div className="bg-white rounded-lg shadow p-0 flex flex-col overflow-hidden h-96">
          <div className="h-full w-full">
            <GoogleMap 
              center={farmCenter} 
              zoom={17} 
              polygonPath={polygonPath}
            />
          </div>
          <div className="p-4 text-xs text-gray-500 text-center border-t">
            Farm Location Map
          </div>
        </div>
        
        {/* Farm Info + Devices Card */}
        <div className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">{farm.name}</h2>
            <div className="mb-1 text-gray-600">{farm.type}</div>
            <div className="mb-1 text-sm">Operation Since: <span className="font-medium">{farm.operationDate}</span></div>
            <div className="mb-1 text-sm">Area Size: <span className="font-medium">{farm.areaSize}</span></div>
            <div className="mb-1 text-sm">Boundary Type: <span className="font-medium">{farm.farmBoundary?.type || "Polygon"}</span></div>
            <div className="mb-1 text-sm">Coordinate: <span className="font-mono text-xs">{boundaryCoordinates}</span></div>
            <div className="flex gap-2 mt-3">
              <span className="inline-flex items-center bg-green-100 text-primary-700 px-3 py-1 rounded text-sm">
                <Wifi className="mr-1" size={16} /> {farm.activeDevices} Active
              </span>
              <span className="inline-flex items-center bg-red-100 text-red-700 px-3 py-1 rounded text-sm">
                <WifiOff className="mr-1" size={16} /> {farm.inactiveDevices} Inactive
              </span>
            </div>
            <div className="text-xs text-gray-400 mt-2">Last activity: {farm.lastActivity}</div>
          </div>
        </div>
      </div>

      {/* Side Cards: Calendar, Workers */}
      <div className="flex flex-col gap-6 h-full">
        {/* Calendar Card */}
        <CalendarCard 
          onViewEvent={handleViewEvent}
          onAddEvent={handleAddEvent}
        />
        
        {/* Worker Card - now passing farmId instead of workers */}
          {workerFarmId && <WorkerCard farmId={workerFarmId} />}      
        </div>
      
      {/* Show error notification if there was an error but we're still showing data */}
      {error && (
        <div className="fixed top-4 right-4 bg-yellow-100 text-yellow-800 px-4 py-2 rounded shadow-md">
          {error}
        </div>
      )}
    </div>
  </div>
  );
};

export default FarmOverview;