import React from 'react';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { Leaf } from 'lucide-react';

interface NPKCardProps {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  activeSensorCount: number;
}

const NPKCard: React.FC<NPKCardProps> = ({ nitrogen, phosphorus, potassium, activeSensorCount }) => {
  const chartOptions: ApexOptions = {
    chart: {
      type: 'bar',
      height: 200,
      toolbar: {
        show: false
      },
      animations: {
        enabled: true,
        speed: 800
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '60%',
        borderRadius: 6,
        dataLabels: {
          position: 'top'
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return typeof val === 'number' ? val.toFixed(1) : String(val);
      },
      offsetY: -20,
      style: {
        fontSize: '12px',
        colors: ['#304758'],
        fontWeight: 600
      }
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: ['Nitrogen (N)', 'Phosphorus (P)', 'Potassium (K)'],
      labels: {
        style: {
          fontSize: '11px',
          fontWeight: 500
        }
      }
    },
    yaxis: {
      title: {
        text: 'mg/kg',
        style: {
          fontSize: '11px'
        }
      },
      labels: {
        formatter: function (val) {
          return typeof val === 'number' ? val.toFixed(0) : String(val);
        }
      }
    },
    fill: {
      opacity: 1,
      colors: ['#10b981']
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return typeof val === 'number' ? val.toFixed(1) + ' mg/kg' : String(val) + ' mg/kg';
        }
      }
    },
    grid: {
      borderColor: '#f1f1f1',
      padding: {
        top: 0,
        right: 10,
        bottom: 0,
        left: 10
      }
    },
    colors: ['#10b981']
  };

  const series = [
    {
      name: 'NPK Levels',
      data: [nitrogen, phosphorus, potassium]
    }
  ];

  const hasData = activeSensorCount > 0;

  return (
    <div className="bg-white rounded-lg border-2 border-green-200 shadow-sm hover:shadow-md transition p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mr-3">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700">NPK Levels</h3>
            <p className="text-xs text-gray-500">Soil nutrients</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">{activeSensorCount} sensors</p>
        </div>
      </div>

      {hasData ? (
        <div className="mt-4">
          <Chart
            options={chartOptions}
            series={series}
            type="bar"
            height={220}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-48 text-gray-400">
          <div className="text-center">
            <Leaf className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">No sensor data available</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NPKCard;
