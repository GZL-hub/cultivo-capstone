import React, { useState, useRef, useCallback, useEffect } from 'react';
import MapComponent from '../../../googlemap/GoogleMap';
import FarmMapToolbar, { MapType } from './FarmMapToolBar';
import { DrawingManager } from '@react-google-maps/api';
import PolygonDataPanel from './polygon/PolygonDataPanel';
import { toast } from 'react-hot-toast';
import axios from 'axios';
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
  
  // Effect to fit map to polygon - kept the same
  useEffect(() => {
    if (polygonCoords.length > 0 && map) {
      fitMapToPolygon();
    }
  }, [polygonCoords, map, fitMapToPolygon]);

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
        const response = await fetch(`/api/farms/${farmId}`);
        const data = await response.json();
        
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
    
    if (activePolygon && polygonCoords.length > 0) {
      try {
        const currentFarmId = farmId || '68d18a709f69d8c82056758c';
        
        const result = await saveFarmBoundary(currentFarmId, {
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
    }
  }, [activePolygon, polygonCoords, polygonArea, polygonPerimeter, farmId, ownerId, isAuthorized]);

  // Updated to fetch boundary with owner verification
// Update the effect that fetches the boundary
useEffect(() => {
  const fetchBoundary = async () => {
    if (!map) return;
    
    // Clear previous error
    setLoadError(null);
    setIsLoading(true);
    
    try {
      // Only attempt to fetch if we have a farmId
      if (!farmId) {
        console.log('No farmId provided, skipping boundary fetch');
        setIsLoading(false);
        return;
      }
      
      console.log(`Fetching boundary for farm: ${farmId}, owner: ${ownerId}`);
      
      // Direct API call to ensure we're getting the raw response
      const response = await axios.get(`/api/farms/${farmId}`);
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
            google.maps.event.addListener(polygon.getPath(), 'set_at', () => {
              updatePolygonData(polygon);
            });
            google.maps.event.addListener(polygon.getPath(), 'insert_at', () => {
              updatePolygonData(polygon);
            });
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
      console.error('Error fetching farm boundary:', error);
      setLoadError('Failed to load farm boundary. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  fetchBoundary();
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
    
    // Store reference to active polygon
    setActivePolygon(polygon);
    
    // Extract coordinates and update metrics
    const coords = extractPolygonCoordinates(polygon);
    setPolygonCoords(coords);
    
    const metrics = updatePolygonMetrics(coords);
    setPolygonArea(metrics.area);
    setPolygonPerimeter(metrics.perimeter);
    
    // Add listeners for when polygon is edited
    google.maps.event.addListener(polygon.getPath(), 'set_at', () => {
      updatePolygonData(polygon);
    });
    google.maps.event.addListener(polygon.getPath(), 'insert_at', () => {
      updatePolygonData(polygon);
    });
    
    // Disable drawing mode after completion
    setDrawing(false);
    setActiveToolbar(null);
  };
  
  return (
    <div className="relative w-full h-full">
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