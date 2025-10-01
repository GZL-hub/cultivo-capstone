import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { BarChart2, CloudRain } from 'lucide-react';

const Analytics: React.FC = () => {
  return (
    <div className="h-full flex flex-col">      
      {/* Analytics Navigation */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-4 overflow-x-auto">
            <NavLink
              to="/analytics/farm"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 border-b-2 transition-colors ${
                  isActive
                    ? 'border-green-500 text-green-600 font-medium'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`
              }
            >
              <BarChart2 className="h-5 w-5 mr-2" />
              Farm Analytics
            </NavLink>
            <NavLink
              to="/analytics/weather"
              className={({ isActive }) =>
                `flex items-center px-4 py-3 border-b-2 transition-colors ${
                  isActive
                    ? 'border-green-500 text-green-600 font-medium'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`
              }
            >
              <CloudRain className="h-5 w-5 mr-2" />
              Weather Analytics
            </NavLink>
          </div>
        </div>
      </div>
      
      {/* Content Area - Will render the child route components */}
      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        <Outlet />
      </div>
    </div>
  );
};

export default Analytics;