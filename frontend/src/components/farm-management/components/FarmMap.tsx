import React, { useState } from 'react';
import GoogleMap from '../../googlemap/GoogleMap';

interface FarmMapProps {
  coordinates: { lat: number; lng: number };
}

const parseLatLng = (input: string): { lat: number; lng: number } | null => {
  // Accepts "lat, lng" or "lat lng"
  const match = input.trim().match(/^(-?\d+(\.\d+)?)[,\s]+(-?\d+(\.\d+)?)$/);
  if (!match) return null;
  const lat = parseFloat(match[1]);
  const lng = parseFloat(match[3]);
  if (isNaN(lat) || isNaN(lng)) return null;
  return { lat, lng };
};

const MAP_TYPES = [
  { label: 'Roadmap', value: 'roadmap' },
  { label: 'Satellite', value: 'satellite' },
  { label: 'Hybrid', value: 'hybrid' },
  { label: 'Terrain', value: 'terrain' },
];

const FarmMap: React.FC<FarmMapProps> = ({ coordinates }) => {
  const [center, setCenter] = useState(coordinates);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const result = parseLatLng(search);
    if (result) {
      setCenter(result);
      setError('');
    } else {
      setError('Please enter valid decimal degrees (e.g., 14.5995, 120.9842)');
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="mb-3 flex gap-2">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by decimal degrees (lat, lng)"
          className="border rounded px-3 py-2 w-full"
        />
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </form>
      <div className="mb-2 flex gap-2 items-center">
        <span className="text-sm font-medium">Map Type:</span>
        {MAP_TYPES.map(type => (
          <button
            key={type.value}
            type="button"
            className={`px-3 py-1 rounded text-sm border ${mapType === type.value ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-green-50'}`}
            onClick={() => setMapType(type.value as any)}
          >
            {type.label}
          </button>
        ))}
      </div>
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      <div className="relative h-[500px] w-full bg-gray-100 rounded-lg overflow-hidden">
        <GoogleMap center={center} zoom={17} mapTypeId={mapType} showDefaultUI />
        {/* Skeleton overlays for polygons, zones, and device markers */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Example: Polygons, markers, etc. */}
          <div className="absolute left-1/4 top-1/4 w-1/4 h-1/4 border-4 border-green-400 opacity-50 rounded-lg"></div>
          <div className="absolute left-1/2 top-1/2 w-8 h-8 bg-green-500 rounded-full opacity-80"></div>
          <div className="absolute left-1/3 top-2/3 w-8 h-8 bg-red-500 rounded-full opacity-80"></div>
        </div>
      </div>
    </div>
  );
};

export default FarmMap;