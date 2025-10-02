import React from 'react';
import TemperatureChart from './charts/TemperatureChart';
import RainfallChart from './charts/RainfallChart';
import HumidityChart from './charts/HumidityChart';
import { temperatureData, rainfallData, humidityData } from './weatherData';

interface HistoricalWeatherChartsProps {
  className?: string;
}

const HistoricalWeatherCharts: React.FC<HistoricalWeatherChartsProps> = ({ 
  className = "" 
}) => {
  return (
    <div className={`space-y-8 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Historical Weather Data</h2>
      
      {/* Temperature Chart */}
      <TemperatureChart data={temperatureData} />
      
      {/* Rainfall Chart */}
      <RainfallChart data={rainfallData} />
      
      {/* Humidity Chart */}
      <HumidityChart data={humidityData} />
    </div>
  );
};

export default HistoricalWeatherCharts;