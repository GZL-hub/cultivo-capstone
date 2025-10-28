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
    <div className={`bg-white rounded-lg shadow p-5 flex flex-col h-full hover:shadow-xl transition-shadow ${className}`}>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 rounded-lg p-2">
            <Users className="text-primary" size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-800">Workers</h3>
            {!isLoading && (
              <span className="text-xs text-gray-500">{workers.length} total</span>
            )}
          </div>
        </div>

        {!isLoading && workers.length > 0 && (
          <div className="flex items-center gap-2">
            {uniqueRoles.length > 1 && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all ${
                    activeFilterCount > 0
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Filter size={12} />
                  {activeFilterCount > 0 ? `${activeFilterCount} Filter${activeFilterCount > 1 ? 's' : ''}` : 'Filter'}
                </button>

                {isFilterDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-20 border border-gray-200">
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-semibold text-gray-700">Filter by Role</h4>
                        {activeFilterCount > 0 && (
                          <button
                            onClick={clearAllFilters}
                            className="text-xs text-primary hover:text-primary-600"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {uniqueRoles.map(role => (
                          <label key={role} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1.5 rounded">
                            <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${
                              roleFilters[role] ? 'bg-primary border-primary' : 'border-gray-300'
                            }`}>
                              {roleFilters[role] && <Check size={10} className="text-white" strokeWidth={3} />}
                            </div>
                            <span className="text-sm text-gray-700 flex-1">{role}</span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                              {roleCount[role]}
                            </span>
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
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-32"
                />
                <Search className="absolute left-2 top-2 text-gray-400" size={14} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active filters summary */}
      {!isLoading && activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {Object.entries(roleFilters)
            .filter(([_, isActive]) => isActive)
            .map(([role]) => (
              <div key={role} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full flex items-center gap-1">
                {role}
                <button
                  onClick={() => toggleRoleFilter(role)}
                  className="hover:bg-primary/20 rounded-full p-0.5"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
        </div>
      )}
      
      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8">
          <Loader2 className="animate-spin text-primary mb-2" size={24} />
          <span className="text-sm text-gray-500">Loading workers...</span>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center text-center p-6">
          <div>
            <div className="text-red-500 text-sm font-medium mb-1">Error</div>
            <p className="text-xs text-gray-500">{error}</p>
          </div>
        </div>
      ) : workers.length > 0 ? (
        <div className="flex-1 flex flex-col min-h-0">
          {filteredWorkers.length > 0 ? (
            <>
              <div className="flex-1 overflow-y-auto">
                <ul className="space-y-2">
                  {currentWorkers.map((worker) => (
                    <li
                      key={worker.id}
                      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-200"
                    >
                      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-full p-2 flex-shrink-0">
                        <User className="text-primary" size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <div className="font-medium text-sm text-gray-800 truncate">{worker.name}</div>
                          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded flex-shrink-0">
                            {worker.role}
                          </div>
                        </div>
                        {worker.email && (
                          <div className="text-xs text-gray-500 truncate">
                            {worker.email}
                          </div>
                        )}
                      </div>
                      {worker.status && (
                        <div className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                          worker.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
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
                <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-3">
                  <div className="text-xs text-gray-500">
                    {indexOfFirstWorker + 1}-{Math.min(indexOfLastWorker, filteredWorkers.length)} of {filteredWorkers.length}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className={`p-1.5 rounded-lg transition-colors ${
                        currentPage === 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <div className="flex items-center px-2 text-xs font-medium text-gray-600">
                      {currentPage} / {totalPages}
                    </div>
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className={`p-1.5 rounded-lg transition-colors ${
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
            <div className="flex-1 flex items-center justify-center py-8">
              <div className="text-center">
                <div className="text-gray-400 mb-2">
                  <Users size={32} className="mx-auto" />
                </div>
                <p className="text-sm text-gray-500">
                  {searchTerm ? 'No workers match your search' : 'No workers match filters'}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center py-8">
          <div className="text-center">
            <div className="text-gray-300 mb-2">
              <Users size={32} className="mx-auto" />
            </div>
            <p className="text-sm text-gray-500">No workers assigned</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerCard;