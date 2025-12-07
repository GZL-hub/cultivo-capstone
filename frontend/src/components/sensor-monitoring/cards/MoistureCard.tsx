import React from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Droplets } from 'lucide-react';

interface MoistureCardProps {
  moisture: number;
  activeSensorCount: number;
}

const MoistureCard: React.FC<MoistureCardProps> = ({ moisture, activeSensorCount }) => {
  const getMoistureStatus = (moisture: number) => {
    if (moisture < 30) return { color: '#ef4444', label: 'Low' };
    if (moisture < 50) return { color: '#f59e0b', label: 'Moderate' };
    return { color: '#10b981', label: 'Good' };
  };

  const moistureStatus = getMoistureStatus(moisture);

  const chartOptions: ApexOptions = {
    chart: {
      type: 'radialBar',
      height: 200,
      offsetY: -10,
      animations: {
        enabled: true,
        speed: 800
      }
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: {
          margin: 0,
          size: '65%',
          background: '#fff',
          position: 'front',
          dropShadow: {
            enabled: true,
            top: 3,
            left: 0,
            blur: 4,
            opacity: 0.15
          }
        },
        track: {
          background: '#e5e7eb',
          strokeWidth: '100%',
          margin: 0
        },
        dataLabels: {
          show: true,
          name: {
            offsetY: -10,
            show: true,
            color: '#6b7280',
            fontSize: '12px',
            fontWeight: 500
          },
          value: {
            formatter: function (val) {
              return typeof val === 'number' ? val.toFixed(1) + '%' : String(val) + '%';
            },
            color: '#111827',
            fontSize: '24px',
            fontWeight: 700,
            show: true,
            offsetY: 5
          }
        }
      }
    },
    fill: {
      colors: [moistureStatus.color],
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'horizontal',
        shadeIntensity: 0.5,
        gradientToColors: [moistureStatus.color],
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100]
      }
    },
    stroke: {
      lineCap: 'round'
    },
    labels: ['Moisture']
  };

  const series = activeSensorCount > 0 ? [moisture] : [0];

  return (
    <div className="bg-white rounded-lg border-2 border-blue-200 shadow-sm hover:shadow-md transition p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mr-3">
            <Droplets className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700">Soil Moisture</h3>
            <p className="text-xs text-gray-500">Average level</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full`} style={{ backgroundColor: `${moistureStatus.color}20`, color: moistureStatus.color }}>
            {moistureStatus.label}
          </span>
        </div>
      </div>

      {activeSensorCount > 0 ? (
        <Chart
          options={chartOptions}
          series={series}
          type="radialBar"
          height={200}
        />
      ) : (
        <div className="flex items-center justify-center h-48 text-gray-400">
          <div className="text-center">
            <Droplets className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No sensor data available</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoistureCard;