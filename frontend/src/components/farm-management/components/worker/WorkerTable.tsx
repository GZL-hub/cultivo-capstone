import React from 'react';
import { Worker } from '../../../../services/workerService';

interface WorkerTableProps {
  workers: Worker[];
  onDelete: (id: string) => void;
  onEdit: (worker: Worker) => void;
}

const WorkerTable: React.FC<WorkerTableProps> = ({ workers, onDelete, onEdit }) => {
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
        <div className="text-center py-8 text-gray-500">
          No workers found matching your search criteria
        </div>
      )}
    </div>
  );
};

export default WorkerTable;