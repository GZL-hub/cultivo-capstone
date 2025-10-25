import React from 'react';

interface BatteryIndicatorProps {
  level: number;
}

const BatteryIndicator: React.FC<BatteryIndicatorProps> = ({ level }) => {
  const getBatteryColor = (level: number) => {
    if (level > 70) return 'text-green-600';
    if (level > 30) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getBarColor = (level: number) => {
    if (level > 70) return 'bg-accent';
    if (level > 30) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="flex items-center">
      <div className={`text-sm ${getBatteryColor(level)} mr-2`}>{level}%</div>
      <div className="w-16 bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${getBarColor(level)}`}
          style={{ width: `${level}%` }}
        ></div>
      </div>
    </div>
  );
};

export default BatteryIndicator;