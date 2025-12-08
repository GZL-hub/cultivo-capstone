import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchResult } from '../../services/searchService';
import { MapPin, Droplets, Camera, Users, Bell, ChevronRight } from 'lucide-react';

interface SearchResultsProps {
  results: {
    farms: SearchResult[];
    sensors: SearchResult[];
    cameras: SearchResult[];
    workers: SearchResult[];
    alerts: SearchResult[];
    total: number;
  };
  onClose: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, onClose }) => {
  const navigate = useNavigate();

  const handleResultClick = (result: SearchResult) => {
    navigate(result.path);
    onClose();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'farm':
        return <MapPin className="w-4 h-4" />;
      case 'sensor':
        return <Droplets className="w-4 h-4" />;
      case 'camera':
        return <Camera className="w-4 h-4" />;
      case 'worker':
        return <Users className="w-4 h-4" />;
      case 'alert':
        return <Bell className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'farm':
        return 'text-green-600 bg-green-50';
      case 'sensor':
        return 'text-blue-600 bg-blue-50';
      case 'camera':
        return 'text-purple-600 bg-purple-50';
      case 'worker':
        return 'text-orange-600 bg-orange-50';
      case 'alert':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const renderSection = (title: string, items: SearchResult[]) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase px-4 py-2 bg-gray-50">
          {title}
        </h3>
        <div className="divide-y divide-gray-100">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => handleResultClick(item)}
              className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left flex items-center gap-3"
            >
              <div className={`p-2 rounded-lg ${getIconColor(item.type)}`}>
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.title}
                </p>
                {item.subtitle && (
                  <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
                )}
                {item.description && (
                  <p className="text-xs text-gray-400 truncate">{item.description}</p>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (results.total === 0) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Camera className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-700">No results found</p>
          <p className="text-xs text-gray-500 mt-1">
            Try searching for farms, sensors, cameras, workers, or alerts
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      <div className="p-2">
        <div className="px-4 py-2 mb-2 bg-primary-50 rounded-lg">
          <p className="text-xs font-semibold text-primary-700">
            Found {results.total} {results.total === 1 ? 'result' : 'results'}
          </p>
        </div>
        {renderSection('Farms', results.farms)}
        {renderSection('Sensors', results.sensors)}
        {renderSection('Cameras', results.cameras)}
        {renderSection('Workers', results.workers)}
        {renderSection('Alerts', results.alerts)}
      </div>
    </div>
  );
};

export default SearchResults;
