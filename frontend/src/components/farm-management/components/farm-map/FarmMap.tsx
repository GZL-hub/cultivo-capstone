import React, { useState, useRef, useCallback } from 'react';
import MapComponent from '../../../googlemap/GoogleMap';
import FarmMapToolbar, { MapType } from './FarmMapToolBar';
import { DrawingManager } from '@react-google-maps/api';

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
    // This function can be used for custom search logic if needed,
    // but autocomplete handles most cases.
    console.log('Search submitted:', search);
  };

  const handleToggleMapTypes = () => {
    setShowMapTypes(prev => !prev);
  };

  const handleStartDrawing = () => {
    setDrawing(prev => !prev);
  };

  const onPolygonComplete = (polygon: google.maps.Polygon) => {
    console.log('Polygon drawn:', polygon);
    // You can get coordinates like this:
    const path = polygon.getPath();
    const coords = path.getArray().map(p => ({ lat: p.lat(), lng: p.lng() }));
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
          onToolbarItemClick={handleToolbarItemClick}
          onMapTypeSelect={handleMapTypeSelect}
          onToggleLock={handleToggleLock}
  
          onSearchChange={handleSearchChange}
          onSearch={handleSearch}
          onToggleMapTypes={handleToggleMapTypes}
          onStartDrawing={handleStartDrawing}
          onSearchBoxLoad={handleSearchBoxLoad}
          onPlacesChanged={handlePlacesChanged}
        />
      </div>
      <MapComponent
        center={center}
        zoom={12}
        mapType={mapType}
        onLoad={handleMapLoad}
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
                clickable: false,
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