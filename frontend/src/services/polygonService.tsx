import api from './api';
import { calculatePolygonArea, calculatePolygonPerimeter } from '../components/farm-management/components/farm-map/polygon/Polygon-Utils';
import axios from 'axios';

export interface PolygonCoordinate {
  lat: number;
  lng: number;
}

export interface PolygonData {
  coordinates: PolygonCoordinate[];
  area?: number;
  perimeter?: number;
}

export interface FarmBoundary {
  type: string;
  coordinates: number[][][];
}

export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface FarmResponse {
  _id: string;
  name: string;
  location: string;
  owner: string;
  farmBoundary?: FarmBoundary;
  createdAt: string;
  updatedAt: string;
}

/**
 * Fetch the boundary polygon for a farm
 */
export const getFarmBoundary = async (
  farmId: string,
  ownerId?: string
): Promise<ServiceResponse<FarmBoundary>> => {
  try {
    console.log(`Fetching boundary for farm: ${farmId}, owner: ${ownerId}`);
    
    // Type the response according to your API structure
    const response = await api.get<FarmResponse>(`/farms/${farmId}`);
    const farmData = response.data;
    
    // Check if farmBoundary exists in the response
    if (farmData && farmData.farmBoundary) {
      console.log('Farm boundary data received:', farmData.farmBoundary);
      return {
        success: true,
        data: farmData.farmBoundary
      };
    }

    console.log('No farm boundary found in response:', farmData);
    return {
      success: false,
      error: 'No farm boundary found'
    };
  } catch (error) {
    console.error('Error fetching farm boundary:', error);
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Failed to fetch farm boundary'
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Save a polygon as a farm boundary
 */
export const saveFarmBoundary = async (
  farmId: string,
  polygonData: PolygonData & { ownerId?: string }
): Promise<ServiceResponse<FarmResponse>> => {
  try {
    // Type the response
    const response = await api.put<FarmResponse>(
      `/farms/${farmId}/boundary`,
      polygonData
    );

    const farmData = response.data;

    if (farmData) {
      return {
        success: true,
        data: farmData
      };
    }

    return {
      success: false,
      error: 'Failed to save boundary'
    };
  } catch (error) {
    console.error('Error saving polygon:', error);
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Network error occurred'
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Convert GeoJSON coordinates to Google Maps LatLng objects
 */
export const convertGeoJSONToGoogleMaps = (
  boundary: FarmBoundary
): PolygonCoordinate[] => {
  if (!boundary.coordinates || boundary.coordinates.length === 0) {
    return [];
  }
  
  // GeoJSON format is [lng, lat], Google Maps uses {lat, lng}
  return boundary.coordinates[0].map((coord: number[]) => ({
    lat: coord[1],
    lng: coord[0]
  }));
};

/**
 * Calculate center point of a polygon
 */
export const calculatePolygonCenter = (
  coords: PolygonCoordinate[],
  defaultCenter?: {lat: number, lng: number}
): {lat: number, lng: number} => {
  if (coords.length === 0) {
    return defaultCenter || { lat: 0, lng: 0 };
  }
  
  let totalLat = 0;
  let totalLng = 0;
  
  coords.forEach(point => {
    totalLat += point.lat;
    totalLng += point.lng;
  });
  
  return {
    lat: totalLat / coords.length,
    lng: totalLng / coords.length
  };
};

/**
 * Update polygon metrics (area and perimeter)
 */
export const updatePolygonMetrics = (
  coords: PolygonCoordinate[]
): {area: number, perimeter: number} => {
  return {
    area: calculatePolygonArea(coords),
    perimeter: calculatePolygonPerimeter(coords)
  };
};

/**
 * Extract coordinates from a Google Maps polygon path
 */
export const extractPolygonCoordinates = (
  polygon: google.maps.Polygon
): PolygonCoordinate[] => {
  const path = polygon.getPath();
  return path.getArray().map(p => ({ lat: p.lat(), lng: p.lng() }));
};