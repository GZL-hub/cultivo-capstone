import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface HumidityDataPoint {
  day: string;
  humidity: number;
}

interface HumidityChartProps {
  data: HumidityDataPoint[];
  title?: string;
}

const HumidityChart: React.FC<HumidityChartProps> = ({ 
  data, 
  title = "Humidity Trends (14 Days)" 
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4 text-gray-700">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="humidity" 
              stroke="#3F51B5" 
              fill="#C5CAE9" 
              name="Humidity (%)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HumidityChart;