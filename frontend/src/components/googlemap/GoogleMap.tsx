import React, { useState, useRef } from 'react';
import { GoogleMap as GoogleMapComponent, useJsApiLoader, TrafficLayer, StandaloneSearchBox } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%'
};

interface MapComponentProps {
  center?: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  children?: React.ReactNode;
  mapType?: 'roadmap' | 'satellite' | 'terrain' | 'hybrid'; // <-- Add this line
}

function MapComponent({
  center = { lat: -3.745, lng: -38.523 },
  zoom = 10,
  children,
  mapType = 'roadmap', // <-- Use prop, default to 'roadmap'
}: MapComponentProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places', 'drawing'],
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [showTraffic, setShowTraffic] = useState(false);
  const [mapCenter, setMapCenter] = useState(center);

  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);

  const onLoad = React.useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback() {
    setMap(null);
  }, []);

  const onPlacesChanged = () => {
    const places = searchBoxRef.current?.getPlaces();
    if (places && places.length > 0 && places[0].geometry?.location) {
      const location = places[0].geometry.location;
      setMapCenter({ lat: location.lat(), lng: location.lng() });
      map?.panTo(location);
    }
  };

  return isLoaded ? (
    <div className="relative w-full h-full">
      {/* Traffic control */}
      <div className="absolute top-2 left-2 z-10 bg-white rounded shadow p-2 flex flex-col gap-2">
        <label className="text-xs font-semibold">
          <input
            type="checkbox"
            checked={showTraffic}
            onChange={() => setShowTraffic((v) => !v)}
            className="mr-1"
          />
          Show Traffic
        </label>
      </div>
      <GoogleMapComponent
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          mapTypeId: mapType,
          mapTypeControl: false, // Hide built-in map type control, use your own in toolbar
          zoomControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        }}
      >
        {children}
        {showTraffic && <TrafficLayer />}
      </GoogleMapComponent>
    </div>
  ) : <div>Loading...</div>;
}

export default React.memo(MapComponent);