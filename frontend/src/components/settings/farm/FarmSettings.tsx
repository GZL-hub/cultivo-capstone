import React, { useState, useEffect } from 'react';
import { getFarms, IFarm } from '../../../services/farmService';
import authService from '../../../services/authService';
import FarmConfigSection from './FarmConfigSection';
import DeviceManagementSection from './DeviceManagementSection';

type FarmData = IFarm;

const FarmSettings: React.FC = () => {
  const [farmData, setFarmData] = useState<FarmData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch farm data using the getFarms service
    const fetchFarmData = async () => {
      try {
        setIsLoading(true);
        
        // Get current user from authService
        const currentUser = authService.getCurrentUser();
        
        if (!currentUser || !currentUser.id) {
          throw new Error('You must be logged in to view farm settings');
        }
        
        // User is authenticated, get their farms
        const farms = await getFarms(currentUser.id);
        
        if (!farms || farms.length === 0) {
          throw new Error('No farms found for your account');
        }
        
        const data = farms[0]; // Use the first farm
        setFarmData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFarmData();
  }, []);

  const handleFarmUpdate = (updatedFarm: FarmData) => {
    setFarmData(updatedFarm);
  };

  if (isLoading && !farmData) {
    return <div className="text-center p-4">Loading farm data...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
      {farmData && (
        <>
          <div className="md:col-span-6">
            <FarmConfigSection 
              farmData={farmData} 
              onFarmUpdate={handleFarmUpdate} 
            />
          </div>
          
          <div className="md:col-span-6">
            <DeviceManagementSection />
          </div>
        </>
      )}
    </div>
  );
};

export default FarmSettings;