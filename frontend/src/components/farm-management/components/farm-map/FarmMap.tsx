import React, { useState, useRef, useCallback, useEffect } from 'react';
import MapComponent from '../../../googlemap/GoogleMap';
import FarmMapToolbar, { MapType } from './FarmMapToolBar';
import { DrawingManager } from '@react-google-maps/api';
import PolygonDataPanel from './polygon/PolygonDataPanel';
import { calculatePolygonArea, calculatePolygonPerimeter } from './polygon/Polygon-Utils';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const mapTypes: MapType[] = [
  { label: 'Roadmap', value: 'roadmap' },
  { label: 'Satellite', value: 'satellite' },
  { label: 'Terrain', value: 'terrain' },
  { label: 'Hybrid', value: 'hybrid' },
];

interface FarmMapProps {
  coordinates: {
    lat: number;
    lng: number;
  };
  farmId?: string; // Add farmId as an optional prop
}

const FarmMap: React.FC<FarmMapProps> = ({ coordinates, farmId }) => {
  // State declarations
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
  
  // Polygon data state
  const [polygonCoords, setPolygonCoords] = useState<Array<{lat: number, lng: number}>>([]);
  const [polygonArea, setPolygonArea] = useState<number | undefined>(undefined);
  const [polygonPerimeter, setPolygonPerimeter] = useState<number | undefined>(undefined);
  const [activePolygon, setActivePolygon] = useState<google.maps.Polygon | null>(null);
  
  // Drawing manager ref
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
  
  // Function to calculate center of polygon
  const calculatePolygonCenter = useCallback((coords: Array<{lat: number, lng: number}>) => {
    if (coords.length === 0) return coordinates;
    
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
  }, [coordinates]);
  
  // Function to fit map to polygon bounds
  const fitMapToPolygon = useCallback(() => {
    if (!map || polygonCoords.length === 0) return;
    
    const bounds = new google.maps.LatLngBounds();
    
    polygonCoords.forEach(point => {
      bounds.extend(new google.maps.LatLng(point.lat, point.lng));
    });
    
    // Fit map to these bounds with some padding
    map.fitBounds(bounds, 50);
    
    // Update center state
    const newCenter = calculatePolygonCenter(polygonCoords);
    setCenter(newCenter);
  }, [map, polygonCoords, calculatePolygonCenter]);
  
  // This effect will ensure drawing mode is properly disabled when the drawing state changes
  useEffect(() => {
    if (!drawing && drawingManagerRef.current) {
      drawingManagerRef.current.setDrawingMode(null);
      // Set the map to null to completely disable the drawing manager
      drawingManagerRef.current.setMap(null);
    } else if (drawing && drawingManagerRef.current && map) {
      // Re-enable the drawing manager
      drawingManagerRef.current.setMap(map);
      drawingManagerRef.current.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    }
  }, [drawing, map]);
  
  // Effect to fit map to polygon when coords change
  useEffect(() => {
    if (polygonCoords.length > 0 && map) {
      fitMapToPolygon();
    }
  }, [polygonCoords, map, fitMapToPolygon]);

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

  const handleToolbarItemClick = (itemId: string) => {
    // If we're switching to draw mode but already have a polygon
    if (itemId === "draw" && activePolygon) {
      // Prevent enabling drawing mode
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

  const handleStartDrawing = () => {
    // Check if we already have a polygon
    if (activePolygon) {
      // Provide feedback to the user
      toast.error('Only one polygon allowed. Delete existing polygon to draw a new one.');
      return;
    }
    
    // Toggle drawing state
    setDrawing(!drawing);
  };

  const handleTogglePanel = useCallback(() => {
    setIsPanelVisible(prev => !prev);
  }, []);
  
  const handleDeletePolygon = useCallback(() => {
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
  }, [activePolygon]);

  // Add save polygon functionality
  const handleSavePolygon = useCallback(async () => {
    if (activePolygon && polygonCoords.length > 0) {
      try {
        // Use the farmId prop or default to the fallback ID
        const currentFarmId = farmId || '68d18a709f69d8c82056758c';
        
        const response = await axios.put(
          `/api/farms/${currentFarmId}/boundary`,
          {
            coordinates: polygonCoords,
            area: polygonArea,
            perimeter: polygonPerimeter
          },
          {
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
        
        if (response.data.success) {
          toast.success('Polygon saved successfully');
          console.log('Saved polygon data:', response.data.data);
        } else {
          toast.error('Failed to save polygon');
        }
      } catch (error) {
        console.error('Error saving polygon:', error);
        toast.error('Error saving polygon');
      }
    }
  }, [activePolygon, polygonCoords, polygonArea, polygonPerimeter, farmId]);

  // Add a function to fetch existing farm boundary when component mounts
  useEffect(() => {
    const fetchFarmBoundary = async () => {
      try {
        // Use the farmId prop or default to the fallback ID
        const currentFarmId = farmId || '68d18a709f69d8c82056758c';
        
        const response = await axios.get(`/api/farms/${currentFarmId}/boundary`, {
          headers: {
            // Add authentication header if needed
            // 'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data.success && response.data.data && map) {
          const boundary = response.data.data;
          
          // Convert GeoJSON coordinates to Google Maps LatLng objects
          if (boundary.coordinates && boundary.coordinates.length > 0) {
            const paths = boundary.coordinates[0].map((coord: number[]) => ({
              lat: coord[1], // GeoJSON format is [lng, lat]
              lng: coord[0]
            }));
            
            // Create a new polygon and add it to the map
            const polygon = new google.maps.Polygon({
              paths,
              fillColor: '#4CAF50',
              fillOpacity: 0.3,
              strokeWeight: 2,
              strokeColor: '#4CAF50',
              clickable: true,
              editable: true,
            });
            
            polygon.setMap(map);
            setActivePolygon(polygon);
            
            // Update the polygon data in state
            setPolygonCoords(paths);
            setPolygonArea(calculatePolygonArea(paths));
            setPolygonPerimeter(calculatePolygonPerimeter(paths));
            
            // Add listeners for editing
            google.maps.event.addListener(polygon.getPath(), 'set_at', () => {
              updatePolygonData(polygon);
            });
            google.maps.event.addListener(polygon.getPath(), 'insert_at', () => {
              updatePolygonData(polygon);
            });
            
            // Fit map to the loaded polygon
            // The useEffect will handle this when polygonCoords changes
          }
        }
      } catch (error) {
        console.error('Error fetching farm boundary:', error);
        toast.error('Error loading farm boundary');
      }
    };
    
    if (map) {
      fetchFarmBoundary();
    }
  }, [map, farmId]);
  
  const updatePolygonData = (polygon: google.maps.Polygon) => {
    const path = polygon.getPath();
    const coords = path.getArray().map(p => ({ lat: p.lat(), lng: p.lng() }));
    
    setPolygonCoords(coords);
    setPolygonArea(calculatePolygonArea(coords));
    setPolygonPerimeter(calculatePolygonPerimeter(coords));
    
    // Map will be updated by the useEffect that watches polygonCoords
  };

  const onPolygonComplete = (polygon: google.maps.Polygon) => {
    // Store reference to active polygon
    setActivePolygon(polygon);
    
    // Extract coordinates
    const path = polygon.getPath();
    const coords = path.getArray().map(p => ({ lat: p.lat(), lng: p.lng() }));
    
    // Set coordinates and calculate metrics
    setPolygonCoords(coords);
    setPolygonArea(calculatePolygonArea(coords));
    setPolygonPerimeter(calculatePolygonPerimeter(coords));
    
    // Add listeners for when polygon is edited
    google.maps.event.addListener(polygon.getPath(), 'set_at', () => {
      updatePolygonData(polygon);
    });
    google.maps.event.addListener(polygon.getPath(), 'insert_at', () => {
      updatePolygonData(polygon);
    });
    
    console.log('Polygon drawn:', polygon);
    console.log('Coordinates:', coords);
    
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
        />
      </div>
      
      {/* Polygon Data Panel */}
      {polygonCoords.length > 0 && isPanelVisible && (
        <PolygonDataPanel 
          coordinates={polygonCoords}
          area={polygonArea}
          perimeter={polygonPerimeter}
          onDelete={handleDeletePolygon}
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
        {map && (
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