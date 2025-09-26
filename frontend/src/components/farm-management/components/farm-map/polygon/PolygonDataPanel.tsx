import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

export interface PolygonCoordinate {
  lat: number;
  lng: number;
}

interface PolygonDataPanelProps {
  coordinates: PolygonCoordinate[];
  area?: number;
  perimeter?: number;
  onDelete?: () => void;
}

const PolygonDataPanel: React.FC<PolygonDataPanelProps> = ({ 
  coordinates, 
  area, 
  perimeter,
  onDelete
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (coordinates.length === 0) return null;

  return (
    <div className="absolute bottom-4 right-4 z-20 bg-white p-4 rounded-lg shadow-lg overflow-visible w-80">
      {/* Panel header with collapse control and delete button */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <h4 className="font-medium text-gray-800 text-base">Plot Data</h4>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? 
              <ChevronDown size={16} className="text-gray-500" /> : 
              <ChevronUp size={16} className="text-gray-500" />
            }
          </button>
        </div>
        
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-1 rounded-full hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors"
            title="Delete polygon"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
      
      {!isCollapsed && (
        <>
          {/* Measurements section */}
          {(area !== undefined || perimeter !== undefined) && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              {area !== undefined && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 font-medium">Area:</span>
                  <span className="font-semibold text-sm text-gray-800">
                    {area < 10000 
                      ? `${area.toFixed(2)} m²` 
                      : `${(area / 10000).toFixed(4)} ha`}
                  </span>
                </div>
              )}
              
              {perimeter !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 font-medium">Perimeter:</span>
                  <span className="font-semibold text-sm text-gray-800">
                    {perimeter < 1000 
                      ? `${perimeter.toFixed(2)} m` 
                      : `${(perimeter / 1000).toFixed(2)} km`}
                  </span>
                </div>
              )}
            </div>
          )}
          
          {/* Coordinates section */}
          <div>
            <div className="flex justify-between items-center mb-2 px-1">
              <span className="text-sm text-gray-700 font-medium">Coordinates</span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {coordinates.length} points
              </span>
            </div>
            
            <div className="max-h-44 overflow-y-auto text-xs border border-gray-100 rounded-lg">
              {coordinates.map((coord, index) => (
                <div 
                  key={index} 
                  className="grid grid-cols-2 gap-2 border-b border-gray-100 py-2 px-3 hover:bg-gray-50"
                >
                  <div className="text-gray-600 font-medium">Point {index + 1}</div>
                  <div className="text-right font-mono text-gray-800">
                    {coord.lat.toFixed(6)}, {coord.lng.toFixed(6)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PolygonDataPanel;