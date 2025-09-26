import React, { useState, useRef } from 'react';
import { GoogleMap as GoogleMapComponent, TrafficLayer } from '@react-google-maps/api';

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
  mapType?: 'roadmap' | 'satellite' | 'terrain' | 'hybrid';
  options?: google.maps.MapOptions;
  onLoad?: (map: google.maps.Map) => void;
}

function MapComponent({
  center = { lat: -3.745, lng: -38.523 },
  zoom = 10,
  children,
  mapType = 'roadmap',
  options = {},
  onLoad: customOnLoad,
}: MapComponentProps) {
  // The useJsApiLoader hook must be removed from this file.
  
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [showTraffic, setShowTraffic] = useState(false);

  const onLoad = React.useCallback(function callback(map: google.maps.Map) {
    setMap(map);
    if (customOnLoad) customOnLoad(map);
  }, [customOnLoad]);

  const onUnmount = React.useCallback(function callback() {
    setMap(null);
  }, []);

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-2 left-2 z-30 bg-white rounded shadow p-2 flex flex-col gap-2">
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
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          mapTypeId: mapType,
          ...options,
        }}
      >
        {children}
        {showTraffic && <TrafficLayer />}
      </GoogleMapComponent>
    </div>
  );
}

export default React.memo(MapComponent);