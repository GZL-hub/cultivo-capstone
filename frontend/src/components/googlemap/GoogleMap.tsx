import React from 'react';
import { GoogleMap as GoogleMapComponent, useJsApiLoader } from '@react-google-maps/api';

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
}

function MapComponent({ center = { lat: -3.745, lng: -38.523 }, zoom = 10 }: MapComponentProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ''
  });

  const [map, setMap] = React.useState<google.maps.Map | null>(null);

  const onLoad = React.useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback() {
    setMap(null);
  }, []);

  return isLoaded ? (
    <GoogleMapComponent
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {/* No markers or other components yet */}
    </GoogleMapComponent>
  ) : <div>Loading...</div>;
}

export default React.memo(MapComponent);