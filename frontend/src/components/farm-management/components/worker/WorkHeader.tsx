import React from 'react';

interface WorkHeaderProps {
  onAddClick: () => void;
  onSearch: (term: string) => void;
  onFilterChange: (filter: string) => void;
  filterValue: string;
  pageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
}

const WorkHeader: React.FC<WorkHeaderProps> = ({ 
  onAddClick, 
  onSearch, 
  onFilterChange, 
  filterValue,
  pageSize = 5,
  onPageSizeChange
}) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 z-10">
      <div className="w-full px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {/* Status Filter Dropdown */}
            <div>
              <select
                value={filterValue}
                onChange={(e) => onFilterChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              >
                <option value="all">All Workers</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            {/* Page Size Selector (if enabled) */}
            {onPageSizeChange && (
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(parseInt(e.target.value, 10))}
                  className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
              </div>
            )}
            
            {/* Search Field */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search workers..."
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                onChange={(e) => onSearch(e.target.value)}
              />
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          {/* Add Worker Button */}
          <button 
            onClick={onAddClick}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-primary/90 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Worker
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkHeader;