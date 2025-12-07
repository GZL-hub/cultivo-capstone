import React from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Thermometer } from 'lucide-react';

interface TemperatureCardProps {
  temperature: number;
  activeSensorCount: number;
}

const TemperatureCard: React.FC<TemperatureCardProps> = ({ temperature, activeSensorCount }) => {
  const getTempStatus = (temp: number) => {
    if (temp < 20 || temp > 30) return { color: '#f59e0b', label: 'Suboptimal' };
    return { color: '#10b981', label: 'Optimal' };
  };

  const tempStatus = getTempStatus(temperature);

  // Generate a simple trend line (simulating last 7 points around current temp)
  const generateTrendData = (currentTemp: number) => {
    const data = [];
    const variation = 2;
    for (let i = 0; i < 7; i++) {
      const randomVariation = (Math.random() - 0.5) * variation;
      data.push(currentTemp + randomVariation);
    }
    return data;
  };

  const chartOptions: ApexOptions = {
    chart: {
      type: 'area',
      height: 180,
      sparkline: {
        enabled: true
      },
      animations: {
        enabled: true,
        speed: 800
      }
    },
    stroke: {
      curve: 'smooth',
      width: 3
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100]
      }
    },
    colors: ['#f97316'],
    tooltip: {
      enabled: true,
      y: {
        formatter: function (val) {
          return typeof val === 'number' ? val.toFixed(1) + '°C' : String(val) + '°C';
        }
      }
    },
    xaxis: {
      labels: {
        show: false
      }
    },
    yaxis: {
      labels: {
        show: false
      },
      min: 15,
      max: 35
    }
  };

  const series = activeSensorCount > 0 ? [
    {
      name: 'Temperature',
      data: generateTrendData(temperature)
    }
  ] : [];

  return (
    <div className="bg-white rounded-lg border-2 border-orange-200 shadow-sm hover:shadow-md transition p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mr-3">
            <Thermometer className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700">Soil Temperature</h3>
            <p className="text-xs text-gray-500">Average reading</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full`} style={{ backgroundColor: `${tempStatus.color}20`, color: tempStatus.color }}>
            {tempStatus.label}
          </span>
        </div>
      </div>

      <div className="my-4">
        <p className="text-4xl font-bold text-orange-700 text-center">
          {activeSensorCount > 0 ? temperature.toFixed(1) : '—'}
          <span className="text-xl text-gray-500 ml-1">°C</span>
        </p>
        <p className="text-xs text-gray-500 text-center mt-1">Optimal: 20-30°C</p>
      </div>

      {activeSensorCount > 0 ? (
        <Chart
          options={chartOptions}
          series={series}
          type="area"
          height={100}
        />
      ) : (
        <div className="flex items-center justify-center h-24 text-gray-400">
          <div className="text-center">
            <Thermometer className="w-8 h-8 mx-auto mb-1 opacity-20" />
            <p className="text-xs">No data</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemperatureCard;