import React, { useState } from 'react';
import GoogleMap from '../../googlemap/GoogleMap';
import { DrawingManager, Polygon } from '@react-google-maps/api';

interface FarmMapProps {
  coordinates: { lat: number; lng: number };
}

const mapTypes = [
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
    polygon.setMap(null); // Remove the drawn polygon, we will render our own
  };

  // Placeholder for search handler
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search logic here (e.g., geocode and pan map)
  };

  return (
    <div className="relative h-[540px] w-full bg-gray-100 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="w-full flex flex-wrap items-center gap-2 bg-white border-b px-4 py-2 z-30">
        {/* Map Type Selector */}
        <label className="flex items-center gap-1 text-sm font-medium">
          Map Type:
          <select
            className="border rounded px-2 py-1 ml-1"
            value={mapType}
            onChange={e => setMapType(e.target.value as any)}
          >
            {mapTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </label>
        {/* Draw Perimeter Button */}
        <button
          className={`px-4 py-2 rounded shadow text-sm font-semibold border ${drawing ? 'bg-green-100 border-green-400' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
          onClick={() => setDrawing((d) => !d)}
        >
          {drawing ? 'Cancel Drawing' : 'Draw Perimeter'}
        </button>
        {/* Lock/Unlock Toggle */}
        <button
          className={`px-4 py-2 rounded shadow text-sm font-semibold border ${locked ? 'bg-gray-200 border-gray-400' : 'bg-white border-gray-200 hover:bg-gray-50'}`}
          onClick={() => setLocked(l => !l)}
        >
          {locked ? 'Unlock' : 'Lock'}
        </button>
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center ml-auto">
          <input
            type="text"
            className="border rounded px-2 py-1 text-sm"
            placeholder="Search address or coordinates"
            value={search}
            onChange={e => setSearch(e.target.value)}
            disabled={locked}
          />
          <button
            type="submit"
            className="ml-2 px-3 py-1 rounded bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600"
            disabled={locked}
          >
            Search
          </button>
        </form>
      </div>
      {/* Map */}
      <div className="h-[500px] w-full">
        <GoogleMap center={coordinates} zoom={17} mapType={mapType}>
          {/* Drawing Manager */}
          {drawing && !locked && (
            <DrawingManager
              drawingMode={google.maps.drawing.OverlayType.POLYGON}
              onPolygonComplete={handlePolygonComplete}
              options={{
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
              }}
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