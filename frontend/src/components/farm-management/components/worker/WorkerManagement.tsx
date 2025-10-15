import React, { useState, useEffect } from 'react';
import WorkerHeader from './WorkHeader';
import WorkerTable from './WorkerTable';
import AddWorkerModal from './AddWorkerModal';
import { useFarmManagement } from '../../FarmManagement';
import workerService, { Worker } from '../../../../services/workerService';
import { X, AlertCircle } from 'lucide-react';

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

// Error alert component
interface ErrorAlertProps {
  message: string;
  onDismiss: () => void;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onDismiss }) => {
  return (
    <div className="rounded-md bg-red-50 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <div className="text-sm text-red-700">
            <p>{message}</p>
          </div>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              onClick={onDismiss}
              className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100"
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const WorkerManagement: React.FC = () => {
  const { farmId } = useFarmManagement();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedWorker, setSelectedWorker] = useState<Worker | undefined>(undefined);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    message: '',
    workerId: ''
  });

  // Fetch workers when component mounts or farmId changes
  useEffect(() => {
    const fetchWorkers = async () => {
      if (!farmId) {
        setError("No farm selected. Please select a farm first.");
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        const data = await workerService.getWorkers(farmId);
        setWorkers(data);
      } catch (err) {
        setError("Failed to load workers. Please try again later.");
        console.error("Error fetching workers:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkers();
  }, [farmId]);

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

  const handleAddWorker = async (workerData: Partial<Worker>) => {
    if (!farmId) {
      setError("No farm selected. Cannot add worker.");
      return;
    }

    try {
      setError(null);
      
      // For editing an existing worker
      if (selectedWorker) {
        const updatedWorker = await workerService.updateWorker(farmId, selectedWorker.id, workerData);
        setWorkers(prevWorkers => 
          prevWorkers.map(w => 
            w.id === selectedWorker.id ? updatedWorker : w
          )
        );
        setSelectedWorker(undefined);
      } 
      // For adding a new worker
      else {
        const newWorker = await workerService.createWorker(farmId, {
          name: workerData.name || '',
          role: workerData.role || '',
          email: workerData.email,
          phone: workerData.phone,
          status: workerData.status as 'active' | 'inactive' || 'active'
        });
        
        setWorkers(prev => [...prev, newWorker]);
      }
      
      setShowAddModal(false);
    } catch (err) {
      setError("Failed to save worker. Please try again.");
      console.error("Error saving worker:", err);
      // Keep modal open if there's an error
    }
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
  const confirmDelete = async () => {
    if (!farmId) {
      setError("No farm selected. Cannot delete worker.");
      setConfirmDialog({ ...confirmDialog, isOpen: false });
      return;
    }

    try {
      setError(null);
      await workerService.deleteWorker(farmId, confirmDialog.workerId);
      setWorkers(workers.filter(worker => worker.id !== confirmDialog.workerId));
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    } catch (err) {
      setError("Failed to delete worker. Please try again.");
      console.error("Error deleting worker:", err);
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
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
          {/* Error Alert */}
          {error && (
            <ErrorAlert 
              message={error} 
              onDismiss={() => setError(null)} 
            />
          )}
          
          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <WorkerTable 
              workers={filteredWorkers}
              onDelete={handleDeleteWorker}
              onEdit={handleEditWorker}
            />
          )}
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