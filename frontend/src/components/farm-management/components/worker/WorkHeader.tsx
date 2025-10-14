import React, { useState } from 'react';
import { Plus, Search, Filter, Download, ChevronDown, Check } from 'lucide-react';

interface WorkerHeaderProps {
  onAddClick: () => void;
  onSearch: (term: string) => void;
  onFilterChange: (filter: string) => void;
  filterValue: string;
}

const WorkerHeader: React.FC<WorkerHeaderProps> = ({ 
  onAddClick, 
  onSearch, 
  onFilterChange, 
  filterValue 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };
  
  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search workers..."
              value={searchTerm}
              onChange={handleSearch}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500 focus:placeholder-gray-400 sm:text-sm"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <button 
                onClick={() => setShowFilter(!showFilter)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filter
                <ChevronDown className="ml-2 h-4 w-4" />
              </button>
              
              {showFilter && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">Status</div>
                    <button
                      className={`block px-4 py-2 text-sm w-full text-left ${filterValue === 'all' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                      onClick={() => onFilterChange('all')}
                    >
                      <div className="flex items-center">
                        <span className="flex-grow">All Workers</span>
                        {filterValue === 'all' && <Check className="h-4 w-4" />}
                      </div>
                    </button>
                    <button
                      className={`block px-4 py-2 text-sm w-full text-left ${filterValue === 'active' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                      onClick={() => onFilterChange('active')}
                    >
                      <div className="flex items-center">
                        <span className="flex-grow">Active Only</span>
                        {filterValue === 'active' && <Check className="h-4 w-4" />}
                      </div>
                    </button>
                    <button
                      className={`block px-4 py-2 text-sm w-full text-left ${filterValue === 'inactive' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                      onClick={() => onFilterChange('inactive')}
                    >
                      <div className="flex items-center">
                        <span className="flex-grow">Inactive Only</span>
                        {filterValue === 'inactive' && <Check className="h-4 w-4" />}
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
              <Download className="mr-2 h-4 w-4" />
              Export
            </button>
            
            <button 
              onClick={onAddClick}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Worker
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerHeader;