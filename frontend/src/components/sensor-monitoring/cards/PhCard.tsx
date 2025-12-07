import React from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { FlaskConical } from 'lucide-react';

interface PhCardProps {
  ph: number;
  activeSensorCount: number;
}

const PhCard: React.FC<PhCardProps> = ({ ph, activeSensorCount }) => {
  const getPhStatus = (ph: number) => {
    if (ph < 6.0 || ph > 7.5) return { color: '#f59e0b', label: 'Watch' };
    return { color: '#10b981', label: 'Optimal' };
  };

  const getPhColor = (ph: number) => {
    // Red (acidic) to Blue (alkaline) gradient
    if (ph <= 4) return '#dc2626'; // Strong red
    if (ph <= 5) return '#ef4444'; // Red
    if (ph <= 6) return '#f97316'; // Orange-red
    if (ph <= 7) return '#fbbf24'; // Yellow (neutral)
    if (ph <= 8) return '#22c55e'; // Green
    if (ph <= 9) return '#06b6d4'; // Cyan
    if (ph <= 10) return '#3b82f6'; // Blue
    return '#2563eb'; // Strong blue
  };

  const phStatus = getPhStatus(ph);
  const phColor = getPhColor(ph);

  // pH scale visualization (0-14)
  const chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      height: 100,
      sparkline: {
        enabled: false
      },
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '100%',
        borderRadius: 4,
        distributed: true
      }
    },
    colors: [phColor],
    dataLabels: {
      enabled: false
    },
    xaxis: {
      min: 0,
      max: 14,
      labels: {
        show: true,
        style: {
          fontSize: '10px'
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      show: false
    },
    grid: {
      show: false,
      padding: {
        top: -15,
        bottom: -15,
        left: 0,
        right: 0
      }
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function (val) {
          return typeof val === 'number' ? 'pH: ' + val.toFixed(2) : 'pH: ' + String(val);
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'horizontal',
        shadeIntensity: 0.5,
        gradientToColors: [phColor],
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100]
      }
    }
  };

  const series = activeSensorCount > 0 ? [
    {
      name: 'pH Level',
      data: [ph]
    }
  ] : [];

  return (
    <div className="bg-white rounded-lg border-2 border-purple-200 shadow-sm hover:shadow-md transition p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mr-3">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700">Soil pH Level</h3>
            <p className="text-xs text-gray-500">Acidity measure</p>
          </div>
        </div>
        <div className="text-right">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full`} style={{ backgroundColor: `${phStatus.color}20`, color: phStatus.color }}>
            {phStatus.label}
          </span>
        </div>
      </div>

      <div className="my-4">
        <p className="text-4xl font-bold text-center" style={{ color: phColor }}>
          {activeSensorCount > 0 ? ph.toFixed(2) : '—'}
        </p>
        <p className="text-xs text-gray-500 text-center mt-1">Optimal: 6.0-7.5</p>
      </div>

      {activeSensorCount > 0 ? (
        <>
          <Chart
            options={chartOptions}
            series={series}
            type="bar"
            height={60}
          />
          <div className="flex items-center justify-between text-xs mt-2 px-2">
            <span className="text-red-600 font-semibold">Acidic (0)</span>
            <span className="text-yellow-500 font-semibold">Neutral (7)</span>
            <span className="text-blue-600 font-semibold">Alkaline (14)</span>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-24 text-gray-400">
          <div className="text-center">
            <FlaskConical className="w-8 h-8 mx-auto mb-1 opacity-20" />
            <p className="text-xs">No data</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhCard;