import React, { useState, useRef, useEffect } from 'react';
import { User, Users, Search, ChevronDown, ChevronUp, Filter, X, Check } from 'lucide-react';

interface Worker {
  name: string;
  role: string;
}

interface WorkerCardProps {
  workers: Worker[];
  className?: string;
}

const WorkerCard: React.FC<WorkerCardProps> = ({ workers, className = "" }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [roleFilters, setRoleFilters] = useState<Record<string, boolean>>({});
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  // Count by role for summary
  const roleCount: Record<string, number> = {};
  const uniqueRoles: string[] = [];
  
  workers.forEach(worker => {
    if (!roleCount[worker.role]) {
      uniqueRoles.push(worker.role);
    }
    roleCount[worker.role] = (roleCount[worker.role] || 0) + 1;
  });
  
  // Get active filters count
  const activeFilterCount = Object.values(roleFilters).filter(Boolean).length;
  
  // Initialize roleFilters if needed
  useEffect(() => {
    if (Object.keys(roleFilters).length === 0 && uniqueRoles.length > 0) {
      const initialFilters: Record<string, boolean> = {};
      uniqueRoles.forEach(role => {
        initialFilters[role] = false;
      });
      setRoleFilters(initialFilters);
    }
  }, [uniqueRoles.length]);
  
  // Filter workers based on search term AND role filters
  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = 
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    // If no role filters are active, show all. Otherwise, check if worker's role is selected
    const noActiveRoleFilters = activeFilterCount === 0;
    const roleIsSelected = roleFilters[worker.role];
    
    return matchesSearch && (noActiveRoleFilters || roleIsSelected);
  });

  // Determine if we need expand functionality (for more than 5 workers)
  const showExpandControls = filteredWorkers.length > 5;
  
  // Calculate display height based on number of workers and expand state
  const getListHeight = () => {
    if (!showExpandControls || isExpanded) {
      return 'max-h-80'; // Expanded height with scrolling
    }
    // Default height to show about 5 workers
    return 'max-h-52';
  };
  
  // Toggle a role filter checkbox
  const toggleRoleFilter = (role: string) => {
    setRoleFilters(prev => ({
      ...prev,
      [role]: !prev[role]
    }));
  };
  
  // Clear all role filters
  const clearAllFilters = () => {
    const clearedFilters: Record<string, boolean> = {};
    Object.keys(roleFilters).forEach(role => {
      clearedFilters[role] = false;
    });
    setRoleFilters(clearedFilters);
  };
  
  return (
    <div className={`bg-white rounded-lg shadow p-6 flex flex-col h-full ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Users className="text-green-700 mr-2" />
          <h3 className="text-lg font-semibold">Workers</h3>
          <span className="ml-2 text-gray-500 text-sm">({workers.length})</span>
        </div>
        
        <div className="flex space-x-2">
          {/* Role filter dropdown */}
          {uniqueRoles.length > 1 && (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className={`flex items-center text-sm px-2 py-1 border rounded-md
                  ${activeFilterCount > 0 
                    ? 'border-green-300 bg-green-50 text-green-700' 
                    : 'border-gray-300 hover:bg-gray-50'}`}
              >
                <Filter size={14} className="mr-1" />
                Filter
                {activeFilterCount > 0 && (
                  <span className="ml-1 bg-green-100 text-green-800 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              
              {/* Dropdown menu */}
              {isFilterDropdownOpen && (
                <div className="absolute right-0 mt-1 w-56 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">Filter by Role</h4>
                      {activeFilterCount > 0 && (
                        <button 
                          onClick={clearAllFilters}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {uniqueRoles.map(role => (
                        <label key={role} className="flex items-center space-x-2 cursor-pointer">
                          <div className={`w-4 h-4 border rounded flex items-center justify-center
                            ${roleFilters[role] ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}
                          >
                            {roleFilters[role] && <Check size={12} className="text-white" />}
                          </div>
                          <span className="text-sm">{role}</span>
                          <span className="text-xs text-gray-500">({roleCount[role]})</span>
                          <input 
                            type="checkbox"
                            checked={roleFilters[role] || false}
                            onChange={() => toggleRoleFilter(role)}
                            className="sr-only" // Hidden but accessible
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Search input */}
          {workers.length > 5 && (
            <div className="relative">
              <input
                type="text"
                placeholder="Search workers"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-4 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
              />
              <Search className="absolute left-2 top-1.5 text-gray-400" size={16} />
            </div>
          )}
        </div>
      </div>
      
      {/* Active filters summary */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-1 mb-3 bg-gray-50 p-2 rounded-md">
          <span className="text-xs text-gray-500 mr-1">Filters:</span>
          {Object.entries(roleFilters)
            .filter(([_, isActive]) => isActive)
            .map(([role]) => (
              <div key={role} className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded flex items-center">
                {role}
                <button 
                  onClick={() => toggleRoleFilter(role)} 
                  className="ml-1 hover:text-green-600"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          <button 
            onClick={clearAllFilters}
            className="text-xs text-gray-500 hover:text-gray-700 ml-auto"
          >
            Clear all
          </button>
        </div>
      )}
      
      {workers.length > 0 ? (
        <>
          {/* Filtered results count - shown when filters are active or search is used */}
          {(activeFilterCount > 0 || searchTerm) && filteredWorkers.length > 0 && (
            <div className="text-xs text-gray-500 mb-2">
              Showing {filteredWorkers.length} of {workers.length} worker{workers.length !== 1 ? 's' : ''}
            </div>
          )}
          
          {/* Scrollable worker list */}
          <div className={`overflow-y-auto ${getListHeight()} scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100`}>
            <ul className="space-y-3 pr-1">
              {filteredWorkers.map((worker, idx) => (
                <li key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                  <div className="bg-gray-100 rounded-full p-1.5">
                    <User className="text-gray-600" size={18} />
                  </div>
                  <div className="flex-grow">
                    <div className="font-medium">{worker.name}</div>
                    <div className="text-xs text-gray-500">{worker.role}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Show/hide more workers control */}
          {showExpandControls && (
            <button 
              className="mt-2 text-sm text-green-600 flex items-center justify-center hover:underline"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <>Show Less <ChevronUp size={16} className="ml-1" /></>
              ) : (
                <>Show All Workers <ChevronDown size={16} className="ml-1" /></>
              )}
            </button>
          )}
          
          {/* Show message when filtered results are empty */}
          {filteredWorkers.length === 0 && (
            <div className="text-gray-500 text-sm text-center py-4">
              {searchTerm ? 'No workers match your search.' : 'No workers match the selected filters.'}
            </div>
          )}
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <p>No workers assigned</p>
        </div>
      )}
    </div>
  );
};

export default WorkerCard;