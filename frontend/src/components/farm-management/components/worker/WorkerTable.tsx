import React from 'react';
import { Worker } from '../../../../services/workerService';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import EmptyState, { Users } from '../../../common/EmptyState';

interface WorkerTableProps {
  workers: Worker[];
  onDelete: (id: string) => void;
  onEdit: (worker: Worker) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
}

const WorkerTable: React.FC<WorkerTableProps> = ({ 
  workers, 
  onDelete, 
  onEdit, 
  currentPage,
  totalPages,
  onPageChange,
  pageSize
}) => {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Worker
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Join Date
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {workers.map((worker) => (
              <tr key={worker.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{worker.name}</div>
                  <div className="text-xs text-gray-500">{worker.role}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {worker.email && (
                    <div className="text-sm text-gray-900">{worker.email}</div>
                  )}
                  {worker.phone && (
                    <div className="text-xs text-gray-500">{worker.phone}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    worker.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {worker.status || 'active'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {worker.joinDate || 'Not specified'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => onEdit(worker)} 
                    className="text-green-600 hover:text-green-900 mr-3"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => onDelete(worker.id)} 
                    className="text-red-600 hover:text-red-900"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {workers.length === 0 && (
        <EmptyState
          icon={Users}
          title="No Workers Found"
          description="No workers found matching your search criteria"
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 bg-gray-50">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === 1
                  ? 'text-gray-300 bg-gray-50'
                  : 'text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === totalPages
                  ? 'text-gray-300 bg-gray-50'
                  : 'text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{workers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, (currentPage - 1) * pageSize + workers.length)}
                </span>{" "}
                of <span className="font-medium">{totalPages * pageSize}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and one page on either side of current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border ${
                          page === currentPage
                            ? 'z-10 bg-primary/10 border-primary-500 text-green-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        } text-sm font-medium`}
                      >
                        {page}
                      </button>
                    );
                  }
                  
                  // Add ellipsis (but only once between gaps)
                  if (
                    (page === 2 && currentPage > 3) ||
                    (page === totalPages - 1 && currentPage < totalPages - 2)
                  ) {
                    return (
                      <span
                        key={page}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                      >
                        ...
                      </span>
                    );
                  }
                  
                  return null;
                })}
                
                <button
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerTable;