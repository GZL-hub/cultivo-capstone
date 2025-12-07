import React from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Zap } from 'lucide-react';

interface ECCardProps {
  ec: number;
  activeSensorCount: number;
}

const ECCard: React.FC<ECCardProps> = ({ ec, activeSensorCount }) => {
  const getECStatus = (ec: number) => {
    if (ec < 200) return { color: '#ef4444', label: 'Low' };
    if (ec > 2000) return { color: '#f59e0b', label: 'High' };
    return { color: '#10b981', label: 'Normal' };
  };

  const ecStatus = getECStatus(ec);

  const chartOptions: ApexOptions = {
    chart: {
      type: 'radialBar',
      height: 280,
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
          size: '70%',
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
            fontSize: '14px',
            fontWeight: 500
          },
          value: {
            formatter: function (val) {
              // Convert percentage back to EC value (max 3000 µS/cm)
              if (typeof val === 'number') {
                const ecValue = (val / 100) * 3000;
                return ecValue.toFixed(0);
              }
              return String(val);
            },
            color: '#111827',
            fontSize: '28px',
            fontWeight: 700,
            show: true,
            offsetY: 10
          }
        }
      }
    },
    fill: {
      colors: [ecStatus.color],
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'horizontal',
        shadeIntensity: 0.5,
        gradientToColors: [ecStatus.color],
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100]
      }
    },
    stroke: {
      lineCap: 'round'
    },
    labels: ['EC (µS/cm)']
  };

  // Convert EC value to percentage (assuming max 3000 µS/cm)
  const ecPercentage = activeSensorCount > 0 ? Math.min((ec / 3000) * 100, 100) : 0;
  const series = [ecPercentage];

  return (
    <div className="bg-white rounded-lg border-2 border-teal-200 shadow-sm hover:shadow-md transition p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mr-3">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700">Electrical Conductivity</h3>
            <p className="text-xs text-gray-500">Nutrient concentration</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full`} style={{ backgroundColor: `${ecStatus.color}20`, color: ecStatus.color }}>
            {ecStatus.label}
          </span>
        </div>
      </div>

      {activeSensorCount > 0 ? (
        <Chart
          options={chartOptions}
          series={series}
          type="radialBar"
          height={280}
        />
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-400">
          <div className="text-center">
            <Zap className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No sensor data available</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ECCard;
