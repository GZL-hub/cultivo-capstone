import React, { useState, useEffect } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import { getFarms } from '../../services/farmService';
import authService from '../../services/authService';
import LoadingSpinner from '../common/LoadingSpinner';

// Define the context type for TypeScript
type FarmManagementContext = {
  farmId: string | null;
  ownerId: string;
};

const FarmManagement: React.FC = () => {
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
  const [farms, setFarms] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Get current user ID
  const userId = authService.getCurrentUser()?.id || '';

  // Fetch available farms when component mounts
  useEffect(() => {
    const fetchUserFarms = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const userFarms = await getFarms(userId);
        setFarms(userFarms);

        // Set first farm as selected if available
        if (userFarms.length > 0) {
          setSelectedFarmId(userFarms[0]._id);
          console.log(`Selected farm ID: ${userFarms[0]._id}`);
        } else {
          console.log('No farms available for this user');
        }
      } catch (error) {
        console.error('Error loading farms:', error);
        setError('Failed to load farms. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserFarms();
  }, [userId]);
  
  return (
    <div className="w-full h-full flex flex-col">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md m-4 border border-red-200">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="font-medium">Error Loading Farms</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading Display */}
      {isLoading && !error && (
        <div className="flex items-center justify-center h-64 m-4">
          <LoadingSpinner size="lg" text="Loading farms..." />
        </div>
      )}

      {/* Content */}
      {!isLoading && (
        <Outlet context={{ farmId: selectedFarmId, ownerId: userId } as FarmManagementContext} />
      )}
    </div>
  );
};

// Export a helper function to use this context in child components
export function useFarmManagement() {
  return useOutletContext<FarmManagementContext>();
}

export default FarmManagement;