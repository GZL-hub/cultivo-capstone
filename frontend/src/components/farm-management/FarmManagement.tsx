import React, { useState, useEffect } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import { getFarms } from '../../services/farmService';
import authService from '../../services/authService';

// Define the context type for TypeScript
type FarmManagementContext = {
  farmId: string | null;
  ownerId: string;
};

const FarmManagement: React.FC = () => {
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
  const [farms, setFarms] = useState<any[]>([]);
  
  // Get current user ID
  const userId = authService.getCurrentUser()?.id || '';
  
  // Fetch available farms when component mounts
  useEffect(() => {
    const fetchUserFarms = async () => {
      try {
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
      }
    };
    
    fetchUserFarms();
  }, [userId]);
  
  return (
    < div className="w-full h-full flex flex-col">
      <Outlet context={{ farmId: selectedFarmId, ownerId: userId } as FarmManagementContext} />
    </div>
  );
};

// Export a helper function to use this context in child components
export function useFarmManagement() {
  return useOutletContext<FarmManagementContext>();
}

export default FarmManagement;