import React, { useState, useRef, useCallback } from 'react';
import MapComponent from '../../../googlemap/GoogleMap';
import FarmMapToolbar, { MapType } from './FarmMapToolBar';
import { DrawingManager } from '@react-google-maps/api';
import PolygonDataPanel from './polygon/PolygonDataPanel';
import { calculatePolygonArea, calculatePolygonPerimeter } from './polygon/Polygon-Utils';

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
}

const FarmMap: React.FC<FarmMapProps> = ({ coordinates }) => {
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
  
  // New state for polygon data
  const [polygonCoords, setPolygonCoords] = useState<Array<{lat: number, lng: number}>>([]);
  const [polygonArea, setPolygonArea] = useState<number | undefined>(undefined);
  const [polygonPerimeter, setPolygonPerimeter] = useState<number | undefined>(undefined);
  const [activePolygon, setActivePolygon] = useState<google.maps.Polygon | null>(null);

  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);

  const handleMapLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
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
      map?.setZoom(15); // Zoom in on the selected location
    }
  }, [map]);

  const handleToggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const handleToolbarItemClick = (itemId: string) => {
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
    setShowMapTypes(prev => !prev);
  };

  const handleStartDrawing = () => {
    setDrawing(prev => !prev);
  };

  // Function to toggle the visibility of the polygon data panel
  const handleTogglePanel = useCallback(() => {
    setIsPanelVisible(prev => !prev);
  }, []);
  
  // Function to update polygon data when it's edited
  const updatePolygonData = (polygon: google.maps.Polygon) => {
    const path = polygon.getPath();
    const coords = path.getArray().map(p => ({ lat: p.lat(), lng: p.lng() }));
    
    setPolygonCoords(coords);
    setPolygonArea(calculatePolygonArea(coords));
    setPolygonPerimeter(calculatePolygonPerimeter(coords));
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
        />
      </div>
      
      {/* Polygon Data Panel - shown when polygon exists */}
      {polygonCoords.length > 0 && isPanelVisible && (
        <PolygonDataPanel 
          coordinates={polygonCoords}
          area={polygonArea}
          perimeter={polygonPerimeter}
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
        {drawing && (
          <DrawingManager
            onPolygonComplete={onPolygonComplete}
            options={{
              drawingControl: false,
              drawingMode: google.maps.drawing.OverlayType.POLYGON,
              polygonOptions: {
                fillColor: '#4CAF50',
                fillOpacity: 0.3,
                strokeWeight: 2,
                strokeColor: '#4CAF50',
                clickable: true, // Changed to true to allow interaction
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