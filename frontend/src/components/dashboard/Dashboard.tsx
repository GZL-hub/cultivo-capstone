import React from 'react';
import DeviceStatistics from './cards/DeviceStatistics';
import WeatherCard from './cards/WeatherCard';
import RainwaterCollector from './cards/RainwaterCollector';
import SensorCard from './cards/SensorCard';
// Import icons
import { 
  FaSeedling, 
  FaVideo, 
  FaVial, 
  FaTint 
} from 'react-icons/fa';

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

  // Sensor card click handlers
  const handleSensorClick = (sensorName: string) => {
    console.log(`${sensorName} sensor clicked`);
    // You can add navigation or open a modal with detailed information
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
          {/* Rainwater Collector */}
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
          
          {/* Sensor Dashboard */}
          <div className="bg-white p-4 rounded-lg shadow-md flex-[3]">
            <div className="grid grid-cols-2 gap-3 h-[calc(100%-1rem)]">
              {/* Plant Health Sensor - with green gradient background and white text */}
              <SensorCard 
                title="Plant Health" 
                icon={FaSeedling}
                status="normal"
                onClick={() => handleSensorClick('Plant Health')}
                className="bg-gradient-to-br from-green-400 to-green-700 border-0 shadow-md"
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-white">85%</span>
                  </div>
                  <span className="text-xs text-white mt-1">Healthy</span>
                </div>
              </SensorCard>
              
              {/* Camera Sensor */}
              <SensorCard 
                title="Camera" 
                icon={FaVideo}
                status="online"
                onClick={() => handleSensorClick('Camera')}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="flex items-center">
                    <span className="text-3xl font-bold text-blue-600">9</span>
                    <span className="text-lg text-gray-500 ml-2">/</span>
                    <span className="text-lg text-gray-400 ml-1">12</span>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">Cameras Online</span>
                </div>
              </SensorCard>
              
              {/* pH Level Sensor */}
              <SensorCard 
                title="pH Level" 
                icon={FaVial}
                status="warning"
                onClick={() => handleSensorClick('pH Level')}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-yellow-600">6.2</span>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">Slightly acidic</span>
                </div>
              </SensorCard>
              
              {/* Soil Moisture Sensor */}
              <SensorCard 
                title="Soil Moisture" 
                icon={FaTint}
                status="alert"
                onClick={() => handleSensorClick('Soil Moisture')}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-red-600">22%</span>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">Low moisture</span>
                </div>
              </SensorCard>
            </div>
          </div>
        </div>
        
        {/* Right column - Farm Map (taking full height) */}
        <div className="md:col-span-8 flex">
          {/* Farm Map (no title) */}
          <div className="bg-white p-4 rounded-lg shadow-md w-full">
            <div className="h-full flex items-center justify-center border border-dashed border-gray-300 rounded-md">
              <p className="text-gray-500">Google Map with Farm Info and Active Sensors</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;