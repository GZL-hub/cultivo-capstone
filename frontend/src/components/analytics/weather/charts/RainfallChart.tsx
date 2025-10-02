import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RainfallDataPoint {
  month: string;
  rainfall: number;
}

interface RainfallChartProps {
  data: RainfallDataPoint[];
  title?: string;
}

const RainfallChart: React.FC<RainfallChartProps> = ({ 
  data, 
  title = "Monthly Rainfall" 
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4 text-gray-700">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="rainfall" fill="#2196F3" name="Rainfall (mm)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RainfallChart;