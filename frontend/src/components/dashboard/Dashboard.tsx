import React from 'react';

const Dashboard = () => {
  return (
    <div className="w-full h-full flex flex-col px-2 py-2">    
      {/* Top row - devices stats and weather */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Total Devices Registered */}
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
          <h2 className="text-lg font-semibold text-gray-700 mb-1">Total Devices Registered</h2>
          <div className="h-16 flex items-center justify-center">
            {/* Content will go here */}
          </div>
        </div>
        
        {/* Total Devices Online */}
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
          <h2 className="text-lg font-semibold text-gray-700 mb-1">Total Devices Online</h2>
          <div className="h-16 flex items-center justify-center">
            {/* Content will go here */}
          </div>
        </div>
        
        {/* Weather Card */}
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
          <h2 className="text-lg font-semibold text-gray-700 mb-1">Weather</h2>
          <div className="h-16 flex items-center justify-center">
            {/* Weather data will go here */}
          </div>
        </div>
      </div>
      
      {/* Main content area - flex-grow to take remaining height */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-grow">
        {/* Left column - Rainwater collector and Sensor Dashboard */}
        <div className="md:col-span-4 flex flex-col space-y-4">
          {/* Rainwater Collector */}
          <div className="bg-white p-4 rounded-lg shadow-md flex-1">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Rainwater Collector</h2>
            <div className="h-[calc(100%-2rem)] flex items-center justify-center border border-dashed border-gray-300 rounded-md">
              {/* Rainwater data will go here */}
            </div>
          </div>
          
          {/* Sensor Dashboard (no title) */}
          <div className="bg-white p-4 rounded-lg shadow-md flex-1">
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