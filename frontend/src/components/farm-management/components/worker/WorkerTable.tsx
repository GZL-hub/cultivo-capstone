import React from 'react';
import { User, Users, Mail, Phone, Edit, Trash2 } from 'lucide-react';

interface Worker {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  joinDate?: string;
  status?: 'active' | 'inactive';
}

interface WorkerTableProps {
  workers: Worker[];
  onDelete: (id: string) => void;
  onEdit: (worker: Worker) => void;
}

const WorkerTable: React.FC<WorkerTableProps> = ({ workers, onDelete, onEdit }) => {
  return (
    <div className="bg-white shadow overflow-hidden rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Join Date
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {workers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                  <Users className="mx-auto h-12 w-12 text-gray-300" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No workers found</h3>
                  <p className="mt-1 text-sm text-gray-500">Add a new worker to get started.</p>
                </td>
              </tr>
            ) : (
              workers.map((worker) => (
                <tr key={worker.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-500" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{worker.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">{worker.role}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      worker.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {worker.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Mail size={14} className="mr-2 text-gray-400" />
                      <div className="text-sm text-gray-500">{worker.email || 'N/A'}</div>
                    </div>
                    <div className="flex items-center mt-1">
                      <Phone size={14} className="mr-2 text-gray-400" />
                      <div className="text-sm text-gray-500">{worker.phone || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {worker.joinDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onEdit(worker)}
                        className="text-gray-400 hover:text-green-600 p-1 rounded-full hover:bg-green-50"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => onDelete(worker.id)}
                        className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{workers.length}</span> workers
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerTable;