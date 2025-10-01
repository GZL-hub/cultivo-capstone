import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

// Example data - replace with your actual data fetching logic
const farmYieldData = [
  { name: 'Jan', yield: 400 },
  { name: 'Feb', yield: 300 },
  { name: 'Mar', yield: 600 },
  { name: 'Apr', yield: 800 },
  { name: 'May', yield: 1000 },
  { name: 'Jun', yield: 1200 },
  { name: 'Jul', yield: 1400 },
];

const resourceUsageData = [
  { name: 'Jan', water: 300, fertilizer: 200, energy: 400 },
  { name: 'Feb', water: 400, fertilizer: 300, energy: 450 },
  { name: 'Mar', water: 350, fertilizer: 250, energy: 410 },
  { name: 'Apr', water: 500, fertilizer: 400, energy: 500 },
  { name: 'May', water: 450, fertilizer: 350, energy: 480 },
  { name: 'Jun', water: 600, fertilizer: 500, energy: 550 },
  { name: 'Jul', water: 550, fertilizer: 450, energy: 570 },
];

const FarmAnalytics: React.FC = () => {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Farm Performance Analytics</h2>
      
      {/* Farm Yield Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4 text-gray-700">Monthly Yield</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={farmYieldData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="yield" fill="#4CAF50" name="Crop Yield (kg)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Resource Usage Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4 text-gray-700">Resource Utilization</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={resourceUsageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="water" stroke="#2196F3" name="Water Usage (L)" />
              <Line type="monotone" dataKey="fertilizer" stroke="#FF9800" name="Fertilizer (kg)" />
              <Line type="monotone" dataKey="energy" stroke="#F44336" name="Energy (kWh)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Efficiency Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2 text-gray-700">Water Efficiency</h3>
          <p className="text-3xl font-bold text-blue-600">94%</p>
          <p className="text-sm text-gray-500 mt-2">5% better than last month</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2 text-gray-700">Yield Rate</h3>
          <p className="text-3xl font-bold text-green-600">1.2 kg/m²</p>
          <p className="text-sm text-gray-500 mt-2">3% increase from previous harvest</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-2 text-gray-700">Energy Usage</h3>
          <p className="text-3xl font-bold text-orange-600">78%</p>
          <p className="text-sm text-gray-500 mt-2">Efficient compared to industry standard</p>
        </div>
      </div>
    </div>
  );
};

export default FarmAnalytics;