import React from 'react';

interface CameraHeaderProps {
  filter: string;
  setFilter: (filter: string) => void;
  onAddClick: () => void;
}

const CameraHeader: React.FC<CameraHeaderProps> = ({ filter, setFilter, onAddClick }) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 z-10">
      <div className="w-full px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <FilterButton 
              active={filter === 'all'} 
              onClick={() => setFilter('all')}
              color="green"
            >
              All Cameras
            </FilterButton>
            <FilterButton 
              active={filter === 'online'} 
              onClick={() => setFilter('online')}
              color="green"
            >
              Online
            </FilterButton>
            <FilterButton 
              active={filter === 'offline'} 
              onClick={() => setFilter('offline')}
              color="red"
            >
              Offline
            </FilterButton>
            <FilterButton 
              active={filter === 'maintenance'} 
              onClick={() => setFilter('maintenance')}
              color="yellow"
            >
              Maintenance
            </FilterButton>
          </div>
          
          <button 
            onClick={onAddClick}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-primary/90 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Camera
          </button>
        </div>
      </div>
    </div>
  );
};

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  color: 'green' | 'red' | 'yellow';
}

const FilterButton: React.FC<FilterButtonProps> = ({ active, onClick, children, color }) => {
  const getActiveClass = () => {
    if (!active) return 'bg-white border border-gray-300 text-gray-700';
    
    switch (color) {
      case 'green': return 'bg-green-100 text-green-800';
      case 'red': return 'bg-red-100 text-red-800';
      case 'yellow': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <button 
      className={`px-3 py-1 rounded-full text-sm ${getActiveClass()}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default CameraHeader;