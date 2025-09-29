import React, { useState, useRef, useEffect } from 'react';
import { GoogleMap as GoogleMapComponent, TrafficLayer, Polygon, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%'
};

// Dark mode map styles
const darkModeStyles = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#242f3e"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#746855"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#242f3e"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#d59563"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#d59563"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#263c3f"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#6b9a76"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#38414e"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#212a37"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9ca5b3"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#746855"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry.stroke",
    "stylers": [
      {
        "color": "#1f2835"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#f3d19c"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#2f3948"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#d59563"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#17263c"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#515c6d"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#17263c"
      }
    ]
  }
];

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
  isDarkMode?: boolean;
  polygonPath?: { lat: number; lng: number }[];
}

function MapComponent({
  center = { lat: -3.745, lng: -38.523 },
  zoom = 10,
  children,
  mapType = 'roadmap',
  options = {},
  onLoad: customOnLoad,
  isDarkMode = false,
  polygonPath,
}: MapComponentProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [showTraffic, setShowTraffic] = useState(false);

  const onLoad = React.useCallback(function callback(map: google.maps.Map) {
    setMap(map);
    if (customOnLoad) customOnLoad(map);
  }, [customOnLoad]);

  const onUnmount = React.useCallback(function callback() {
    setMap(null);
  }, []);

  // Use effect to update map styles when isDarkMode changes
  useEffect(() => {
    if (map && mapType === 'roadmap') {
      if (isDarkMode) {
        map.setOptions({ styles: darkModeStyles });
      } else {
        map.setOptions({ styles: [] });  // Reset to default styles
      }
    }
  }, [isDarkMode, map, mapType]);

  // Polygon options
  const polygonOptions = {
    fillColor: "rgba(76, 175, 80, 0.3)",
    fillOpacity: 0.5,
    strokeColor: "#4CAF50",
    strokeOpacity: 1,
    strokeWeight: 2,
  };

  // Combine the user's options with dark mode styles when dark mode is enabled
  const mapOptions = {
    mapTypeId: mapType,
    ...options,
    ...(isDarkMode && mapType === 'roadmap' ? { styles: darkModeStyles } : {})
  };

  return (
    <div className="relative w-full h-full">
      <div className={`absolute top-2 left-2 z-30 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded shadow p-2 flex flex-col gap-2`}>
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
        options={mapOptions}
      >
        {/* Show marker if no polygon */}
        {(!polygonPath || polygonPath.length === 0) && (
          <Marker position={center} />
        )}
        
        {/* Show polygon if available */}
        {polygonPath && polygonPath.length > 0 && (
          <Polygon
            paths={polygonPath}
            options={polygonOptions}
          />
        )}
        
        {children}
        {showTraffic && <TrafficLayer />}
      </GoogleMapComponent>
    </div>
  );
}

export default React.memo(MapComponent);