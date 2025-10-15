import React, { useState } from 'react';
import WorkerHeader from './WorkHeader';
import WorkerTable from './WorkerTable';
import AddWorkerModal from './AddWorkerModal';
import { X } from 'lucide-react';

interface Worker {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  joinDate?: string;
  status?: 'active' | 'inactive';
}

// Simple confirmation dialog component
interface ConfirmDialogProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Confirmation</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-500">
            <X size={20} />
          </button>
        </div>
        <p className="mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button 
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const WorkerManagement: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedWorker, setSelectedWorker] = useState<Worker | undefined>(undefined);
  
  // State for confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    message: '',
    workerId: ''
  });
  
  // Sample worker data
  const [workers, setWorkers] = useState<Worker[]>([
    { id: '1', name: 'John Smith', role: 'Farm Manager', email: 'john@example.com', phone: '123-456-7890', joinDate: '2023-01-15', status: 'active' },
    { id: '2', name: 'Maria Garcia', role: 'Crop Specialist', email: 'maria@example.com', phone: '123-456-7891', joinDate: '2023-03-10', status: 'active' },
    { id: '3', name: 'Li Wei', role: 'Field Worker', email: 'li@example.com', phone: '123-456-7892', joinDate: '2023-05-20', status: 'active' },
    { id: '4', name: 'Ahmed Hassan', role: 'Equipment Operator', email: 'ahmed@example.com', phone: '123-456-7893', joinDate: '2023-07-05', status: 'inactive' },
    { id: '5', name: 'Sofia Rodriguez', role: 'Field Worker', email: 'sofia@example.com', phone: '123-456-7894', joinDate: '2023-08-12', status: 'active' },
    { id: '6', name: 'Thomas Weber', role: 'Farm Technician', email: 'thomas@example.com', phone: '123-456-7895', joinDate: '2023-10-01', status: 'active' },
  ]);

  // Filter workers based on search term and status filter
  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = 
      worker.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      worker.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (worker.email && worker.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = 
      statusFilter === 'all' || 
      worker.status === statusFilter;
    
    return matchesSearch && matchesFilter;
  });

  const handleAddWorker = (workerData: Partial<Worker>) => {
    // For editing an existing worker
    if (selectedWorker) {
      setWorkers(prevWorkers => 
        prevWorkers.map(w => 
          w.id === selectedWorker.id 
            ? { ...w, ...workerData } 
            : w
        )
      );
      setSelectedWorker(undefined);
    } 
    // For adding a new worker
    else {
      const newWorker: Worker = {
        id: Date.now().toString(),
        name: workerData.name || '',
        role: workerData.role || '',
        email: workerData.email || '',
        phone: workerData.phone || '',
        joinDate: new Date().toISOString().split('T')[0],
        status: workerData.status as 'active' | 'inactive'
      };
      
      setWorkers([...workers, newWorker]);
    }
    
    setShowAddModal(false);
  };

  // Show confirmation dialog instead of using global confirm
  const handleDeleteWorker = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      message: 'Are you sure you want to delete this worker?',
      workerId: id
    });
  };
  
  // Handle actual deletion after confirmation
  const confirmDelete = () => {
    setWorkers(workers.filter(worker => worker.id !== confirmDialog.workerId));
    setConfirmDialog({ ...confirmDialog, isOpen: false });
  };
  
  // Close confirmation dialog
  const cancelDelete = () => {
    setConfirmDialog({ ...confirmDialog, isOpen: false });
  };

  const handleEditWorker = (worker: Worker) => {
    setSelectedWorker(worker);
    setShowAddModal(true);
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-gray-50">
      <WorkerHeader 
        onAddClick={() => {
          setSelectedWorker(undefined);
          setShowAddModal(true);
        }}
        onSearch={setSearchTerm}
        onFilterChange={setStatusFilter}
        filterValue={statusFilter}
      />
      
      <div className="flex-1 overflow-auto p-4">
        <div className="w-full mx-auto">
          <WorkerTable 
            workers={filteredWorkers}
            onDelete={handleDeleteWorker}
            onEdit={handleEditWorker}
          />
        </div>
      </div>
      
      <AddWorkerModal 
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedWorker(undefined);
        }}
        onSave={handleAddWorker}
        worker={selectedWorker}
      />
      
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        message={confirmDialog.message}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

export default WorkerManagement;