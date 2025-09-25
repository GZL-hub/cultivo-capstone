import React, { useState, useEffect, useRef } from 'react';
import GoogleMap from '../../../googlemap/GoogleMap';
import { DrawingManager, Polygon, Marker } from '@react-google-maps/api';
import FarmMapToolbar from './FarmMapToolBar';

interface FarmMapProps {
  coordinates: { lat: number; lng: number };
}

const mapTypes: Array<{ label: string; value: 'roadmap' | 'satellite' | 'terrain' | 'hybrid' }> = [
  { label: 'Roadmap', value: 'roadmap' },
  { label: 'Satellite', value: 'satellite' },
  { label: 'Terrain', value: 'terrain' },
  { label: 'Hybrid', value: 'hybrid' },
];

const FarmMap: React.FC<FarmMapProps> = ({ coordinates }) => {
  const [drawing, setDrawing] = useState(false);
  const [paths, setPaths] = useState<google.maps.LatLngLiteral[]>([]);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'terrain' | 'hybrid'>('roadmap');
  const [locked, setLocked] = useState(false);
  const [search, setSearch] = useState('');
  const [activeToolbar, setActiveToolbar] = useState<string | null>("map");
  const [showMapTypes, setShowMapTypes] = useState(false);
  const [searchResults, setSearchResults] = useState<google.maps.places.PlaceResult | null>(null);
  
  // Reference to map
  const mapRef = useRef<google.maps.Map | null>(null);
  // Reference to DrawingManager
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);
  // Reference to Geocoder
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  
  // Handler for map load
  const handleMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    geocoderRef.current = new google.maps.Geocoder();
  };
  
  // Force drawing off when active toolbar changes
  useEffect(() => {
    if (activeToolbar !== 'draw') {
      setDrawing(false);
      stopDrawing();
    }
  }, [activeToolbar]);

  // Handler for completed polygon
  const handlePolygonComplete = (polygon: google.maps.Polygon) => {
    const path = polygon.getPath();
    const coords: google.maps.LatLngLiteral[] = [];
    for (let i = 0; i < path.getLength(); i++) {
      const point = path.getAt(i);
      coords.push({ lat: point.lat(), lng: point.lng() });
    }
    setPaths(coords);
    setDrawing(false);
    stopDrawing();
    polygon.setMap(null); // Remove the drawn polygon, we will render our own
  };
  
  // Start drawing mode
  const startDrawing = () => {
    if (!mapRef.current) return;
    
    // Create a new DrawingManager if none exists
    if (!drawingManagerRef.current) {
      drawingManagerRef.current = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControl: false,
        polygonOptions: {
          fillColor: '#22c55e',
          fillOpacity: 0.2,
          strokeColor: '#16a34a',
          strokeWeight: 2,
          clickable: false,
          editable: false,
          zIndex: 1,
        },
      });
      
      // Add listener for polygon completion
      google.maps.event.addListener(
        drawingManagerRef.current, 
        'polygoncomplete', 
        handlePolygonComplete
      );
    }
    
    // Set drawing mode and attach to map
    drawingManagerRef.current.setOptions({
      drawingMode: google.maps.drawing.OverlayType.POLYGON
    });
    drawingManagerRef.current.setMap(mapRef.current);
    setDrawing(true);
  };
  
  // Stop drawing mode
  const stopDrawing = () => {
    if (drawingManagerRef.current) {
      drawingManagerRef.current.setMap(null);
    }
    setDrawing(false);
  };

  // Toggle drawing mode
  const handleStartDrawing = () => {
    if (drawing) {
      stopDrawing();
    } else {
      startDrawing();
    }
  };

  // Implement search handler using Geocoder
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous search result
    setSearchResults(null);
    
    if (!search.trim() || !geocoderRef.current || !mapRef.current) return;
    
    // Check if input is coordinates (simple regex for "lat,lng" format)
    const coordsRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
    const coordsMatch = search.match(coordsRegex);
    
    if (coordsMatch) {
      // Parse as coordinates
      const lat = parseFloat(coordsMatch[1]);
      const lng = parseFloat(coordsMatch[3]);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        const location = new google.maps.LatLng(lat, lng);
        mapRef.current.panTo(location);
        mapRef.current.setZoom(17);
        
        // Create a fake place result for marker
        setSearchResults({
          geometry: {
            location,
          },
          name: `${lat}, ${lng}`,
          formatted_address: `Coordinates: ${lat}, ${lng}`,
        } as google.maps.places.PlaceResult);
        
        return;
      }
    }
    
    // Otherwise search by address
    geocoderRef.current.geocode({ address: search }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
        const location = results[0].geometry.location;
        mapRef.current?.panTo(location);
        mapRef.current?.setZoom(17);
        setSearchResults(results[0]);
      } else {
        // Handle error - could show a toast notification here
        console.error("Geocode was not successful for the following reason:", status);
        alert("Location not found. Please try a different search term.");
      }
    });
  };

  const handleToolbarItemClick = (itemId: string) => {
    // If switching to a different tool, disable drawing mode
    if (itemId !== "draw") {
      stopDrawing();
    }
    
    // When selecting the draw tool, enable drawing
    if (itemId === "draw" && activeToolbar !== "draw") {
      startDrawing();
    }
    
    // When deselecting the draw tool, disable drawing
    if (itemId === "draw" && activeToolbar === "draw") {
      stopDrawing();
    }
    
    // If clicking on a different tool, close map types dropdown
    if (activeToolbar !== itemId) {
      setShowMapTypes(false);
    }
    
    // Toggle active toolbar or set new one
    setActiveToolbar(activeToolbar === itemId ? null : itemId);
  };

  const handleMapTypeSelect = (value: 'roadmap' | 'satellite' | 'terrain' | 'hybrid') => {
    setMapType(value);
    setShowMapTypes(false);
  };

  return (
    <div className="flex flex-col w-full space-y-2">
      {/* Toolbar Component */}
      <FarmMapToolbar 
        mapType={mapType}
        drawing={drawing}
        locked={locked}
        search={search}
        activeToolbar={activeToolbar}
        showMapTypes={showMapTypes}
        mapTypes={mapTypes}
        onToolbarItemClick={handleToolbarItemClick}
        onMapTypeSelect={handleMapTypeSelect}
        onToggleLock={() => setLocked(!locked)}
        onSearchChange={(e) => setSearch(e.target.value)}
        onSearch={handleSearch}
        onToggleMapTypes={() => setShowMapTypes(!showMapTypes)}
        onStartDrawing={handleStartDrawing}
      />
      
      {/* Map Container */}
      <div className="relative h-[500px] w-full bg-gray-100 rounded-lg overflow-hidden">
        <GoogleMap 
          center={coordinates} 
          zoom={17} 
          mapType={mapType}
          options={{
            disableDoubleClickZoom: true,
            clickableIcons: false,
          }}
          onLoad={handleMapLoad}
        >          
          {/* Render search result marker */}
            {searchResults && searchResults.geometry && searchResults.geometry.location && (
              <Marker
                position={{
                  lat: searchResults.geometry.location.lat(),
                  lng: searchResults.geometry.location.lng()
                }}
                title={searchResults.name || "Search Result"}
                animation={google.maps.Animation.DROP}
              />
            )}
                      
          {/* Render the perimeter polygon if drawn */}
          {paths.length > 0 && (
            <Polygon
              path={paths}
              options={{
                fillColor: '#22c55e',
                fillOpacity: 0.2,
                strokeColor: '#16a34a',
                strokeWeight: 2,
                clickable: false,
                editable: false,
                zIndex: 2,
              }}
            />
          )}
        </GoogleMap>
      </div>
    </div>
  );
};
  
export default FarmMap;