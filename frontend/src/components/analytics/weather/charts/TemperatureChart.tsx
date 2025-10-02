import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TemperatureDataPoint {
  day: string;
  temperature: number;
}

interface TemperatureChartProps {
  data: TemperatureDataPoint[];
  title?: string;
}

const TemperatureChart: React.FC<TemperatureChartProps> = ({ 
  data, 
  title = "Temperature Trends (14 Days)" 
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4 text-gray-700">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="temperature" 
              stroke="#FF5722" 
              name="Temperature (°C)" 
              strokeWidth={2} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TemperatureChart;