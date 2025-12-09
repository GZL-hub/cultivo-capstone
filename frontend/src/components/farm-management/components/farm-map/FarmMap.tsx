import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MapComponent from '../../../googlemap/GoogleMap';
import FarmMapToolbar, { MapType } from './FarmMapToolBar';
import { DrawingManager } from '@react-google-maps/api';
import PolygonDataPanel from './polygon/PolygonDataPanel';
import { toast } from 'react-hot-toast';
import api from '../../../../services/api';
import axios from 'axios'; // Keep for axios.isCancel check
import { MapPin, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../../../common/LoadingSpinner';
// Import the polygon service
import { 
  getFarmBoundary, 
  saveFarmBoundary,
  convertGeoJSONToGoogleMaps,
  calculatePolygonCenter,
  updatePolygonMetrics,
  extractPolygonCoordinates,
  PolygonCoordinate
} from '../../../../services/polygonService';
// Context Hook
import { useFarmManagement } from '../../FarmManagement';

const mapTypes: MapType[] = [
  { label: 'Roadmap', value: 'roadmap' },
  { label: 'Satellite', value: 'satellite' },
  { label: 'Terrain', value: 'terrain' },
  { label: 'Hybrid', value: 'hybrid' },
];

interface FarmMapProps {
  coordinates?: {
    lat: number;
    lng: number;
  };
  farmId?: string;
  ownerId?: string; // Add ownerId as a required prop
}
const FarmMap: React.FC<FarmMapProps> = ({ coordinates, farmId: propFarmId, ownerId: propOwnerId }) => {
  const navigate = useNavigate();

  // Get farmId and ownerId from context if not provided as props
  const context = useFarmManagement();
  const farmId = propFarmId || context?.farmId;
  const ownerId = propOwnerId || context?.ownerId;

  console.log(`FarmMap rendered with farmId: ${farmId}, ownerId: ${ownerId}`);

  // State declarations - kept the same
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'terrain' | 'hybrid'>('roadmap');
  const [drawing, setDrawing] = useState(false);
  const [locked, setLocked] = useState(false);
  const [search, setSearch] = useState('');
  const [activeToolbar, setActiveToolbar] = useState<string | null>(null);
  const [showMapTypes, setShowMapTypes] = useState(false);
  const [center, setCenter] = useState(coordinates);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  
  // Polygon data state - kept the same
  const [polygonCoords, setPolygonCoords] = useState<PolygonCoordinate[]>([]);
  const [polygonArea, setPolygonArea] = useState<number | undefined>(undefined);
  const [polygonPerimeter, setPolygonPerimeter] = useState<number | undefined>(undefined);
  const [activePolygon, setActivePolygon] = useState<google.maps.Polygon | null>(null);
  
  // Refs
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
  const eventListenersRef = useRef<google.maps.MapsEventListener[]>([]);

  // API Handling 
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Function to fit map to polygon bounds - kept the same
  const fitMapToPolygon = useCallback(() => {
    if (!map || polygonCoords.length === 0) return;
    
    const bounds = new google.maps.LatLngBounds();
    
    polygonCoords.forEach(point => {
      bounds.extend(new google.maps.LatLng(point.lat, point.lng));
    });
    
    // Fit map to these bounds with some padding
    map.fitBounds(bounds, 50);
    
    // Update center state
    const newCenter = calculatePolygonCenter(polygonCoords, coordinates);
    setCenter(newCenter);
  }, [map, polygonCoords, coordinates]);
  
  // Drawing mode management - kept the same
  useEffect(() => {
    if (!drawing && drawingManagerRef.current) {
      drawingManagerRef.current.setDrawingMode(null);
      drawingManagerRef.current.setMap(null);
    } else if (drawing && drawingManagerRef.current && map) {
      drawingManagerRef.current.setMap(map);
      drawingManagerRef.current.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    }
  }, [drawing, map]);
  
  // Effect to fit map to polygon - fixed circular dependency
  useEffect(() => {
    if (polygonCoords.length > 0 && map) {
      const bounds = new google.maps.LatLngBounds();

      polygonCoords.forEach(point => {
        bounds.extend(new google.maps.LatLng(point.lat, point.lng));
      });

      map.fitBounds(bounds, 50);

      const newCenter = calculatePolygonCenter(polygonCoords, coordinates);
      setCenter(newCenter);
    }
  }, [polygonCoords.length, map]); // Only depend on length to avoid unnecessary re-renders

  // Event handlers - kept the same
  const handleMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);
  
  const handleDrawingManagerLoad = useCallback((drawingManager: google.maps.drawing.DrawingManager) => {
    drawingManagerRef.current = drawingManager;
  }, []);

  const handleSearchBoxLoad = useCallback((ref: google.maps.places.SearchBox) => {
    searchBoxRef.current = ref;
  }, []);

  const handlePlacesChanged = useCallback(() => {
    const places = searchBoxRef.current?.getPlaces();
    if (places && places.length > 0 && places[0].geometry?.location) {
      const location = places[0].geometry.location;
      const newCenter = { lat: location.lat(), lng: location.lng() };
      setCenter(newCenter);
      map?.panTo(newCenter);
      map?.setZoom(15);
    }
  }, [map]);

  const handleToggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  // Check if user is authorized to edit this farm
  useEffect(() => {
    const checkAuthorization = async () => {
      if (!farmId || !ownerId) {
        // If no farmId, we're creating a new farm, so the user is authorized
        if (!farmId) {
          setIsAuthorized(true);
          return;
        }
        
        setIsAuthorized(false);
        return;
      }
      
      try {
        // Fetch the farm to check if it belongs to this owner
        const response = await api.get(`/farms/${farmId}`);
        const data = response.data;

        if (data.success && data.data) {
          // Check if the farm belongs to the current user
          setIsAuthorized(data.data.owner === ownerId);
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error('Error checking farm authorization:', error);
        setIsAuthorized(false);
      }
    };
    
    checkAuthorization();
  }, [farmId, ownerId]);

  // Existing toolbar handler - kept the same
  const handleToolbarItemClick = (itemId: string) => {
    // If not authorized to edit, prevent drawing
    if (itemId === "draw" && !isAuthorized) {
      toast.error('You are not authorized to edit this farm');
      return;
    }
    
    // If we're switching to draw mode but already have a polygon
    if (itemId === "draw" && activePolygon) {
      toast.error('Only one polygon allowed. Delete existing polygon to draw a new one.');
      return;
    }
    
    // If we're switching from drawing mode to another tool, disable drawing
    if ((activeToolbar === "draw" || drawing) && itemId !== "draw") {
      setDrawing(false);
    }
    
    setActiveToolbar(prev => (prev === itemId ? null : itemId));
    
    if (itemId !== 'map') {
      setShowMapTypes(false);
    }
  };

  // Existing handlers - kept the same
  const handleMapTypeSelect = (value: 'roadmap' | 'satellite' | 'terrain' | 'hybrid') => {
    setMapType(value);
    setShowMapTypes(false);
  };

  const handleToggleLock = () => {
    setLocked(prev => !prev);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Search submitted:', search);
  };

  const handleToggleMapTypes = () => {
    // When toggling map types, ensure drawing is disabled
    if (drawing) {
      setDrawing(false);
    }
    setShowMapTypes(prev => !prev);
  };

  // Updated to check authorization
  const handleStartDrawing = () => {
    // Check authorization
    if (!isAuthorized) {
      toast.error('You are not authorized to edit this farm');
      return;
    }
    
    // Check if we already have a polygon
    if (activePolygon) {
      toast.error('Only one polygon allowed. Delete existing polygon to draw a new one.');
      return;
    }
    
    // Toggle drawing state
    setDrawing(!drawing);
  };

  const handleTogglePanel = useCallback(() => {
    setIsPanelVisible(prev => !prev);
  }, []);
  
  // Updated to check authorization
  const handleDeletePolygon = useCallback(() => {
    if (!isAuthorized) {
      toast.error('You are not authorized to delete this boundary');
      return;
    }
    
    if (activePolygon) {
      // Remove the polygon from the map
      activePolygon.setMap(null);
      
      // Clear polygon data
      setActivePolygon(null);
      setPolygonCoords([]);
      setPolygonArea(undefined);
      setPolygonPerimeter(undefined);
      
      toast.success('Polygon deleted');
    }
  }, [activePolygon, isAuthorized]);

  // Updated to include owner ID and check authorization
  const handleSavePolygon = useCallback(async () => {
    if (!isAuthorized) {
      toast.error('You are not authorized to save changes to this farm');
      return;
    }

    if (!farmId) {
      toast.error('No farm selected. Please select a farm before saving.');
      return;
    }

    if (!activePolygon || polygonCoords.length < 3) {
      toast.error('Invalid polygon. Please draw a valid boundary with at least 3 points.');
      return;
    }

    try {
      const result = await saveFarmBoundary(farmId, {
        coordinates: polygonCoords,
        area: polygonArea,
        perimeter: polygonPerimeter,
        ownerId // Include owner ID for verification
      });

      if (result.success) {
        toast.success('Boundary saved successfully');
      } else {
        toast.error('Failed to save boundary: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving polygon:', error);
      toast.error('Error saving boundary');
    }
  }, [activePolygon, polygonCoords, polygonArea, polygonPerimeter, farmId, ownerId, isAuthorized]);

  // Updated to fetch boundary with owner verification
// Update the effect that fetches the boundary
useEffect(() => {
  const abortController = new AbortController();

  const fetchBoundary = async () => {
    if (!map) return;

    // Clear previous error
    setLoadError(null);
    setIsLoading(true);

    // Clean up existing polygon and event listeners before creating new ones
    if (activePolygon) {
      activePolygon.setMap(null);
      setActivePolygon(null);
    }

    // Remove all existing event listeners
    eventListenersRef.current.forEach(listener => {
      google.maps.event.removeListener(listener);
    });
    eventListenersRef.current = [];

    try {
      // Only attempt to fetch if we have a farmId
      if (!farmId) {
        console.log('No farmId provided, skipping boundary fetch');
        setIsLoading(false);
        return;
      }

      console.log(`Fetching boundary for farm: ${farmId}, owner: ${ownerId}`);

      // API call with abort signal for race condition protection
      const response = await api.get(`/farms/${farmId}`, {
        signal: abortController.signal
      });
      console.log('Farm data response:', response.data);

      if (response.data.success && response.data.data && response.data.data.farmBoundary) {
        const boundary = response.data.data.farmBoundary;
        console.log('Farm boundary data:', boundary);

        // Convert GeoJSON coordinates to Google Maps LatLng objects
        const paths = convertGeoJSONToGoogleMaps(boundary);
        console.log('Converted polygon paths:', paths);

        if (paths.length > 0) {
          // Create polygon and add it to the map
          const polygon = new google.maps.Polygon({
            paths,
            fillColor: '#4CAF50',
            fillOpacity: 0.3,
            strokeWeight: 2,
            strokeColor: '#4CAF50',
            clickable: true,
            editable: isAuthorized, // Only make it editable if user is authorized
          });

          polygon.setMap(map);
          setActivePolygon(polygon);

          // Update the polygon data in state
          setPolygonCoords(paths);
          const metrics = updatePolygonMetrics(paths);
          setPolygonArea(metrics.area);
          setPolygonPerimeter(metrics.perimeter);

          // Add listeners for editing only if authorized
          if (isAuthorized) {
            const listener1 = google.maps.event.addListener(polygon.getPath(), 'set_at', () => {
              updatePolygonData(polygon);
            });
            const listener2 = google.maps.event.addListener(polygon.getPath(), 'insert_at', () => {
              updatePolygonData(polygon);
            });

            // Store listeners for cleanup
            eventListenersRef.current.push(listener1, listener2);
          }

          // Fit map to polygon bounds
          fitMapToPolygon();
        } else {
          console.warn('No valid paths extracted from boundary');
        }
      } else {
        console.warn('No farm boundary found in response:', response.data);
      }
    } catch (error) {
      // Ignore abort errors
      if (axios.isCancel(error)) {
        console.log('Request cancelled:', error.message);
        return;
      }
      console.error('Error fetching farm boundary:', error);
      setLoadError('Failed to load farm boundary. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  fetchBoundary();

  // Cleanup function
  return () => {
    abortController.abort();
    // Clean up event listeners when component unmounts or dependencies change
    eventListenersRef.current.forEach(listener => {
      google.maps.event.removeListener(listener);
    });
    eventListenersRef.current = [];
  };
}, [map, farmId, ownerId, isAuthorized]);
  
  // Update polygon data utility - kept the same
  const updatePolygonData = (polygon: google.maps.Polygon) => {
    const coords = extractPolygonCoordinates(polygon);
    
    setPolygonCoords(coords);
    const metrics = updatePolygonMetrics(coords);
    setPolygonArea(metrics.area);
    setPolygonPerimeter(metrics.perimeter);
  };

  // Updated polygon complete handler with authorization check
  const onPolygonComplete = (polygon: google.maps.Polygon) => {
    // Check authorization again
    if (!isAuthorized) {
      // Remove the polygon if not authorized
      polygon.setMap(null);
      toast.error('You are not authorized to draw on this farm');
      return;
    }

    // Clean up existing polygon and listeners if any
    if (activePolygon) {
      activePolygon.setMap(null);
    }
    eventListenersRef.current.forEach(listener => {
      google.maps.event.removeListener(listener);
    });
    eventListenersRef.current = [];

    // Store reference to active polygon
    setActivePolygon(polygon);

    // Extract coordinates and update metrics
    const coords = extractPolygonCoordinates(polygon);
    setPolygonCoords(coords);

    const metrics = updatePolygonMetrics(coords);
    setPolygonArea(metrics.area);
    setPolygonPerimeter(metrics.perimeter);

    // Add listeners for when polygon is edited and store them
    const listener1 = google.maps.event.addListener(polygon.getPath(), 'set_at', () => {
      updatePolygonData(polygon);
    });
    const listener2 = google.maps.event.addListener(polygon.getPath(), 'insert_at', () => {
      updatePolygonData(polygon);
    });

    // Store listeners for cleanup
    eventListenersRef.current.push(listener1, listener2);

    // Disable drawing mode after completion
    setDrawing(false);
    setActiveToolbar(null);
  };
  
  // Show onboarding UI if no farm is registered
  if (!farmId) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full">
          <div className="text-center">
            {/* Icon */}
            <div className="mb-6 text-blue-500">
              <MapPin className="h-20 w-20 mx-auto" strokeWidth={1.5} />
            </div>

            {/* Heading */}
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Create a Farm First</h2>
            <p className="text-gray-600 mb-6">
              Before you can draw your farm boundary on the map, you need to register your farm with basic information.
            </p>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-800 mb-2">What you need to do:</h3>
              <ol className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start">
                  <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">
                    1
                  </span>
                  <span>Go to Farm Overview and create your farm</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">
                    2
                  </span>
                  <span>Fill in basic farm details (name, type, size)</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">
                    3
                  </span>
                  <span>Return here to draw your farm boundary</span>
                </li>
              </ol>
            </div>

            {/* Action Button */}
            <button
              onClick={() => navigate('/farm/overview')}
              className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-md"
            >
              Go to Farm Overview
              <ArrowRight size={20} className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <LoadingSpinner size="lg" text="Loading farm boundary..." />
        </div>
      )}

      {/* Error Display */}
      {loadError && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg shadow-lg max-w-md">
          <p className="font-medium">Error Loading Boundary</p>
          <p className="text-sm mt-1">{loadError}</p>
        </div>
      )}

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-full px-4">
        <FarmMapToolbar
          mapType={mapType}
          drawing={drawing}
          locked={locked}
          search={search}
          activeToolbar={activeToolbar}
          showMapTypes={showMapTypes}
          mapTypes={mapTypes}
          isDarkMode={isDarkMode}
          isPanelVisible={isPanelVisible}
          hasPolygon={!!activePolygon}
          onToolbarItemClick={handleToolbarItemClick}
          onMapTypeSelect={handleMapTypeSelect}
          onToggleLock={handleToggleLock}
          onSearchChange={handleSearchChange}
          onSearch={handleSearch}
          onToggleMapTypes={handleToggleMapTypes}
          onStartDrawing={handleStartDrawing}
          onSearchBoxLoad={handleSearchBoxLoad}
          onPlacesChanged={handlePlacesChanged}
          onToggleTheme={handleToggleTheme}
          onTogglePanel={handleTogglePanel}
          onDeletePolygon={handleDeletePolygon}
          onSavePolygon={handleSavePolygon}
          isAuthorized={isAuthorized} // Pass authorization status to toolbar
        />
      </div>
      
      {/* Polygon Data Panel */}
      {polygonCoords.length > 0 && isPanelVisible && (
        <PolygonDataPanel 
          coordinates={polygonCoords}
          area={polygonArea}
          perimeter={polygonPerimeter}
          onDelete={isAuthorized ? handleDeletePolygon : undefined} // Only allow delete if authorized
        />
      )}
      
      <MapComponent
        center={center}
        zoom={12}
        mapType={mapType}
        onLoad={handleMapLoad}
        isDarkMode={isDarkMode}
        showDefaultMarker={false}
        options={{
          zoomControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          mapTypeControl: false,
        }}
      >
        {map && isAuthorized && ( // Only show drawing manager if authorized
          <DrawingManager
            onLoad={handleDrawingManagerLoad}
            onPolygonComplete={onPolygonComplete}
            options={{
              drawingControl: false,
              drawingMode: drawing ? google.maps.drawing.OverlayType.POLYGON : null,
              polygonOptions: {
                fillColor: '#4CAF50',
                fillOpacity: 0.3,
                strokeWeight: 2,
                strokeColor: '#4CAF50',
                clickable: true,
                editable: true,
                zIndex: 1,
              },
            }}
          />
        )}
      </MapComponent>
    </div>
  );
};

export default FarmMap;