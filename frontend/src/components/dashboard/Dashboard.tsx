import React from 'react';
import DeviceStatistics from './cards/DeviceStatistics';
import WeatherCard from './cards/WeatherCard';
import RainwaterCollector from './cards/RainwaterCollector';

const Dashboard = () => {
  // Define deviceStats with default values
  const deviceStats = {
    totalRegistered: 0,
    totalOnline: 0
  };

  // Define weather data with default values
  const weatherData = {
    temperature: 24,
    condition: 'Sunny',
    humidity: 65,
    windSpeed: 8,
  };

  // Define rainwater collector data with default values
  const rainwaterData = {
    currentLevel: 65,  // 65% full
    capacity: 500,     // 500 liters capacity
    lastCollected: "Sept 12, 2025" 
  };

  return (
    <div className="w-full h-full flex flex-col px-2 py-2">    
      {/* Top row - devices stats and weather */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Device Statistics Component */}
        <DeviceStatistics 
          totalRegistered={deviceStats.totalRegistered} 
          totalOnline={deviceStats.totalOnline} 
        />
      
        {/* Weather Card Component */}
        <WeatherCard 
          temperature={weatherData.temperature}
          condition={weatherData.condition}
          humidity={weatherData.humidity}
          windSpeed={weatherData.windSpeed}
        />
      </div>
      
      {/* Main content area - flex-grow to take remaining height */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-grow">
        {/* Left column - Rainwater collector and Sensor Dashboard */}
        <div className="md:col-span-4 flex flex-col space-y-4">
          {/* Adjust the flex ratio - Rainwater gets less space, sensors get more */}
          {/* Rainwater Collector - now with flex-[2] instead of flex-1 */}
          <div className="bg-white p-4 rounded-lg shadow-md flex-[2]">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Rainwater Collector</h2>
            <div className="h-[calc(100%-2rem)]">
              <RainwaterCollector
                currentLevel={rainwaterData.currentLevel}
                capacity={rainwaterData.capacity}
                lastCollected={rainwaterData.lastCollected}
              />
            </div>
          </div>
          
          {/* Sensor Dashboard - now with flex-[3] to take more space */}
          <div className="bg-white p-4 rounded-lg shadow-md flex-[3]">
            <div className="grid grid-cols-2 gap-3 h-[calc(100%-1rem)]">
              {/* Plant Health */}
              <div className="border border-gray-200 rounded-md p-3">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Plant Health</h3>
                <div className="h-[calc(100%-1.75rem)] flex items-center justify-center border border-dashed border-gray-300 rounded-md">
                  {/* Plant health data will go here */}
                </div>
              </div>
              
              {/* Camera */}
              <div className="border border-gray-200 rounded-md p-3">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Camera</h3>
                <div className="h-[calc(100%-1.75rem)] flex items-center justify-center border border-dashed border-gray-300 rounded-md">
                  {/* Camera feed will go here */}
                </div>
              </div>
              
              {/* pH Level */}
              <div className="border border-gray-200 rounded-md p-3">
                <h3 className="text-sm font-medium text-gray-700 mb-1">pH Level</h3>
                <div className="h-[calc(100%-1.75rem)] flex items-center justify-center border border-dashed border-gray-300 rounded-md">
                  {/* pH level data will go here */}
                </div>
              </div>
              
              {/* Soil Moisture */}
              <div className="border border-gray-200 rounded-md p-3">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Soil Moisture</h3>
                <div className="h-[calc(100%-1.75rem)] flex items-center justify-center border border-dashed border-gray-300 rounded-md">
                  {/* Soil moisture data will go here */}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right column - Farm Map (taking full height) */}
        <div className="md:col-span-8 flex">
          {/* Farm Map (no title) */}
          <div className="bg-white p-4 rounded-lg shadow-md w-full">
            {/* No title here as requested */}
            <div className="h-full flex items-center justify-center border border-dashed border-gray-300 rounded-md">
              {/* Google Maps with Farm Info and Active Sensors will go here */}
              <p className="text-gray-500">Google Map with Farm Info and Active Sensors</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;