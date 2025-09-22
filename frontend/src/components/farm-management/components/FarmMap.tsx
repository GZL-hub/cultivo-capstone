import React from 'react';
import GoogleMap from '../../googlemap/GoogleMap';
interface FarmMapProps {
  coordinates: { lat: number; lng: number };
}

const FarmMap: React.FC<FarmMapProps> = ({ coordinates }) => (
  <div className="relative h-[500px] w-full bg-gray-100 rounded-lg overflow-hidden">
    <GoogleMap center={coordinates} zoom={17} />
    {/* Skeleton overlays for polygons, zones, and device markers */}
    <div className="absolute inset-0 pointer-events-none">
      {/* Example: Polygons, markers, etc. */}
      <div className="absolute left-1/4 top-1/4 w-1/4 h-1/4 border-4 border-green-400 opacity-50 rounded-lg"></div>
      <div className="absolute left-1/2 top-1/2 w-8 h-8 bg-green-500 rounded-full opacity-80"></div>
      <div className="absolute left-1/3 top-2/3 w-8 h-8 bg-red-500 rounded-full opacity-80"></div>
    </div>
  </div>
);

export default FarmMap;