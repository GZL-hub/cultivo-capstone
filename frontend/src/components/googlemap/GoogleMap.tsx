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
}

type MapTypeIdLiteral = 'roadmap' | 'satellite' | 'terrain' | 'hybrid';

function MapComponent({ center = { lat: -3.745, lng: -38.523 }, zoom = 10 }: MapComponentProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'],
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapType, setMapType] = useState<MapTypeIdLiteral>('roadmap');
  const [showTraffic, setShowTraffic] = useState(false);
  const [mapCenter, setMapCenter] = useState(center);

  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);

  const onLoad = React.useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback() {
    setMap(null);
  }, []);

  const handleMapTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMapType(e.target.value as MapTypeIdLiteral);
  };

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
      {/* Search bar */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 w-[350px]">
        <StandaloneSearchBox
          onLoad={ref => (searchBoxRef.current = ref as unknown as google.maps.places.SearchBox)}
          onPlacesChanged={onPlacesChanged}
        >
          <input
            type="text"
            placeholder="Search address or coordinates"
            className="w-full px-3 py-2 border rounded shadow focus:outline-none"
            style={{ fontSize: 14 }}
          />
        </StandaloneSearchBox>
      </div>
      {/* Map type and traffic controls */}
      <div className="absolute top-2 left-2 z-10 bg-white rounded shadow p-2 flex flex-col gap-2">
        <label className="text-xs font-semibold">
          Map Type:
          <select
            className="ml-2 border rounded px-1 py-0.5"
            value={mapType}
            onChange={handleMapTypeChange}
          >
            <option value="roadmap">Roadmap</option>
            <option value="satellite">Satellite</option>
            <option value="terrain">Terrain</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </label>
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
          mapTypeControl: true,
          zoomControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        }}
      >
        {showTraffic && <TrafficLayer />}
      </GoogleMapComponent>
    </div>
  ) : <div>Loading...</div>;
}

export default React.memo(MapComponent);