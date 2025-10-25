import React, { useState, useRef, useEffect } from 'react';
import { User, Users, Search, Filter, X, Check, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Worker, getWorkers } from '../../../../../services/workerService';

interface WorkerCardProps {
  farmId: string;
  className?: string;
}

const WorkerCard: React.FC<WorkerCardProps> = ({ farmId, className = "" }) => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilters, setRoleFilters] = useState<Record<string, boolean>>({});
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const workersPerPage = 3;
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Fetch workers from API
  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        setIsLoading(true);
        const data = await getWorkers(farmId);
        setWorkers(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch workers:', err);
        setError('Failed to load workers. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWorkers();
  }, [farmId]);
  
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
    
    const noActiveRoleFilters = activeFilterCount === 0;
    const roleIsSelected = roleFilters[worker.role];
    
    return matchesSearch && (noActiveRoleFilters || roleIsSelected);
  });

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilters]);
  
  // Calculate pagination values
  const totalPages = Math.ceil(filteredWorkers.length / workersPerPage);
  const indexOfLastWorker = currentPage * workersPerPage;
  const indexOfFirstWorker = indexOfLastWorker - workersPerPage;
  const currentWorkers = filteredWorkers.slice(indexOfFirstWorker, indexOfLastWorker);
  
  // Handle pagination
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
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
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Users className="text-primary-700 mr-2" />
          <h3 className="text-lg font-semibold">Workers</h3>
          {!isLoading && <span className="ml-2 text-gray-500 text-sm">({workers.length})</span>}
        </div>
        
        {!isLoading && workers.length > 0 && (
          <div className="flex space-x-2">
            {uniqueRoles.length > 1 && (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                  className={`flex items-center text-sm px-2 py-1 border rounded-md
                    ${activeFilterCount > 0 
                      ? 'border-green-300 bg-primary/10 text-primary-700' 
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
                              ${roleFilters[role] ? 'bg-accent border-primary-500' : 'border-gray-300'}`}
                            >
                              {roleFilters[role] && <Check size={12} className="text-white" />}
                            </div>
                            <span className="text-sm">{role}</span>
                            <span className="text-xs text-gray-500">({roleCount[role]})</span>
                            <input 
                              type="checkbox"
                              checked={roleFilters[role] || false}
                              onChange={() => toggleRoleFilter(role)}
                              className="sr-only"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {workers.length > 5 && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search workers"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-4 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Search className="absolute left-2 top-1.5 text-gray-400" size={16} />
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Active filters summary */}
      {!isLoading && activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-1 mb-3 bg-gray-50 p-2 rounded-md">
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
      
      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-green-600 mr-2" />
          <span className="text-gray-600">Loading workers...</span>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center text-red-500 text-center p-4">
          <p>{error}</p>
        </div>
      ) : workers.length > 0 ? (
        <div className="flex-1 flex flex-col min-h-0">
          {filteredWorkers.length > 0 ? (
            <>
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <ul className="space-y-3 pr-1">
                  {currentWorkers.map((worker) => (
                    <li key={worker.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                      <div className="bg-gray-100 rounded-full p-1.5">
                        <User className="text-gray-600" size={18} />
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-baseline gap-2">
                          <div className="font-medium">{worker.name}</div>
                          <div className="text-xs text-gray-500">{worker.role}</div>
                        </div>
                        {worker.email && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {worker.email}
                          </div>
                        )}
                      </div>
                      {worker.status && (
                        <div className={`text-xs px-2 py-0.5 rounded-full ${
                          worker.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {worker.status}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 pt-3 mt-3">
                  <div className="text-xs text-gray-500">
                    Showing {indexOfFirstWorker + 1}-{Math.min(indexOfLastWorker, filteredWorkers.length)} of {filteredWorkers.length}
                  </div>
                  <div className="flex space-x-1">
                    <button 
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className={`p-1 rounded ${
                        currentPage === 1 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <div className="flex items-center px-2 text-sm">
                      {currentPage} / {totalPages}
                    </div>
                    <button 
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className={`p-1 rounded ${
                        currentPage === totalPages 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
              {searchTerm ? 'No workers match your search.' : 'No workers match the selected filters.'}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <p>No workers assigned to this farm</p>
        </div>
      )}
    </div>
  );
};

export default WorkerCard;