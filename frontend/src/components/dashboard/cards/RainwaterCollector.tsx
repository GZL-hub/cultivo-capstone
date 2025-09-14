import React from 'react';
import ReactApexChart from 'react-apexcharts';

interface RainwaterCollectorProps {
  currentLevel: number;  // Current water level (0-100)
  capacity: number;      // Total capacity in liters
  lastCollected?: string; // Optional timestamp of last collection
}

const RainwaterCollector: React.FC<RainwaterCollectorProps> = ({
  currentLevel,
  capacity,
  lastCollected
}) => {
  // Calculate the actual water volume based on percentage
  const actualVolume = Math.round((currentLevel / 100) * capacity);
  
  // Gauge chart options
  const chartOptions: any = {
    chart: {
      type: 'radialBar',
      offsetY: -20,
      sparkline: {
        enabled: true
      }
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        track: {
          background: "#e7e7e7",
          strokeWidth: '97%',
          margin: 5,
          dropShadow: {
            enabled: true,
            top: 2,
            left: 0,
            opacity: 0.15,
            blur: 3
          }
        },
        dataLabels: {
          name: {
            show: false
          },
          value: {
            offsetY: -2,
            fontSize: '22px',
            formatter: function(val: number) {
              return val + '%';
            }
          }
        },
        hollow: {
          size: '50%'
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        shadeIntensity: 0.4,
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 50, 100],
        colorStops: [
          {
            offset: 0,
            color: "#0ea5e9", // Light blue - matches the top color of the weather card gradient
            opacity: 1
          },
          {
            offset: 50,
            color: "#4f83ef", // Medium blue - transition color
            opacity: 1
          },
          {
            offset: 100,
            color: "#6366f1", // Indigo - matches the bottom color of the weather card gradient
            opacity: 1
          }
        ]
      }
    },
    labels: ['Water Level'],
    colors: ['#0ea5e9'] // Primary color that matches the top of the gradient
  };

  // Chart series
  const chartSeries = [currentLevel];

  return (
    <div className="flex flex-col h-full">
      {/* Gauge Chart */}
      <div className="flex justify-center items-center">
        <ReactApexChart 
          options={chartOptions}
          series={chartSeries}
          type="radialBar"
          height={220}
        />
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 mt-1">
        <div className="text-center bg-gray-50 p-3 rounded-lg">
          <p className="text-gray-500 text-xs font-medium">Current Volume</p>
          <p className="text-lg font-bold text-blue-600">{actualVolume}L</p>
          <p className="text-xs text-gray-400">of {capacity}L capacity</p>
        </div>
        
        <div className="text-center bg-gray-50 p-3 rounded-lg">
          <p className="text-gray-500 text-xs font-medium">Collection Status</p>
          <p className="text-lg font-bold text-blue-600">
            {currentLevel > 70 ? 'Excellent' : currentLevel > 30 ? 'Adequate' : 'Low'}
          </p>
          {lastCollected && (
            <p className="text-xs text-gray-400">Last collected: {lastCollected}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RainwaterCollector;