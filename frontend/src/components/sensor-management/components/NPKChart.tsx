import React from 'react';
import { ISensor } from '../../../services/sensorService';
import { TrendingUp, TrendingDown, Minus, Leaf } from 'lucide-react';

interface NPKChartProps {
  sensor: ISensor;
}

// Optimal NPK ranges for common crops (mg/kg)
const NPK_RANGES = {
  nitrogen: { low: 20, optimal: 50, high: 100 },
  phosphorus: { low: 10, optimal: 30, high: 60 },
  potassium: { low: 50, optimal: 150, high: 300 }
};

const NPKChart: React.FC<NPKChartProps> = ({ sensor }) => {
  if (!sensor.lastReading) {
    return (
      <div className="text-center text-gray-500 py-12">
        <p>No NPK data available</p>
      </div>
    );
  }

  const { nitrogen, phosphorus, potassium } = sensor.lastReading;

  const getNutrientStatus = (value: number, ranges: { low: number; optimal: number; high: number }) => {
    if (value < ranges.low) return { status: 'low', color: 'red', icon: TrendingDown };
    if (value <= ranges.optimal) return { status: 'optimal', color: 'green', icon: Minus };
    if (value <= ranges.high) return { status: 'good', color: 'blue', icon: TrendingUp };
    return { status: 'high', color: 'yellow', icon: TrendingUp };
  };

  const getProgressPercentage = (value: number, ranges: { low: number; optimal: number; high: number }) => {
    const max = ranges.high * 1.2; // Add 20% buffer for visualization
    return Math.min((value / max) * 100, 100);
  };

  const nitrogenStatus = getNutrientStatus(nitrogen, NPK_RANGES.nitrogen);
  const phosphorusStatus = getNutrientStatus(phosphorus, NPK_RANGES.phosphorus);
  const potassiumStatus = getNutrientStatus(potassium, NPK_RANGES.potassium);

  const NutrientBar = ({
    label,
    value,
    unit,
    status,
    ranges,
    description,
    color
  }: {
    label: string;
    value: number;
    unit: string;
    status: { status: string; color: string; icon: any };
    ranges: { low: number; optimal: number; high: number };
    description: string;
    color: string;
  }) => {
    const StatusIcon = status.icon;
    const percentage = getProgressPercentage(value, ranges);

    const getBarColor = () => {
      switch (status.color) {
        case 'red': return 'bg-red-500';
        case 'yellow': return 'bg-yellow-500';
        case 'blue': return 'bg-blue-500';
        case 'green': return 'bg-green-500';
        default: return 'bg-gray-500';
      }
    };

    const getBackgroundColor = () => {
      switch (status.color) {
        case 'red': return 'bg-red-100';
        case 'yellow': return 'bg-yellow-100';
        case 'blue': return 'bg-blue-100';
        case 'green': return 'bg-green-100';
        default: return 'bg-gray-100';
      }
    };

    return (
      <div className={`p-4 rounded-lg ${getBackgroundColor()}`}>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="text-lg font-semibold text-gray-800">{label}</h4>
            <p className="text-xs text-gray-600">{description}</p>
          </div>
          <div className="flex items-center">
            <StatusIcon className={`w-5 h-5 text-${status.color}-600 mr-2`} />
            <span className="text-2xl font-bold text-gray-800">{value}</span>
            <span className="text-sm text-gray-600 ml-1">{unit}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${getBarColor()} transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
          {/* Range Markers */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-gray-400"
            style={{ left: `${getProgressPercentage(ranges.low, ranges)}%` }}
          />
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-gray-600"
            style={{ left: `${getProgressPercentage(ranges.optimal, ranges)}%` }}
          />
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-gray-400"
            style={{ left: `${getProgressPercentage(ranges.high, ranges)}%` }}
          />
        </div>

        {/* Range Labels */}
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Low: {ranges.low}</span>
          <span>Optimal: {ranges.optimal}</span>
          <span>High: {ranges.high}</span>
        </div>

        {/* Status Text */}
        <div className="mt-2 text-sm">
          <span className={`font-semibold text-${status.color}-700`}>
            Status: {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <Leaf className="w-12 h-12 text-green-600 mx-auto mb-2" />
        <h3 className="text-2xl font-bold text-gray-800">NPK Nutrient Analysis</h3>
        <p className="text-gray-600 mt-1">Essential nutrients for plant growth</p>
      </div>

      {/* Nitrogen */}
      <NutrientBar
        label="Nitrogen (N)"
        value={nitrogen}
        unit="mg/kg"
        status={nitrogenStatus}
        ranges={NPK_RANGES.nitrogen}
        description="Promotes leafy growth and overall plant vigor"
        color={nitrogenStatus.color}
      />

      {/* Phosphorus */}
      <NutrientBar
        label="Phosphorus (P)"
        value={phosphorus}
        unit="mg/kg"
        status={phosphorusStatus}
        ranges={NPK_RANGES.phosphorus}
        description="Essential for root development and flowering"
        color={phosphorusStatus.color}
      />

      {/* Potassium */}
      <NutrientBar
        label="Potassium (K)"
        value={potassium}
        unit="mg/kg"
        status={potassiumStatus}
        ranges={NPK_RANGES.potassium}
        description="Strengthens plants and improves disease resistance"
        color={potassiumStatus.color}
      />

      {/* Overall Assessment */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h4 className="font-semibold text-gray-800 mb-2">Overall Assessment</h4>
        <div className="space-y-2 text-sm text-gray-700">
          {nitrogen < NPK_RANGES.nitrogen.low && (
            <p>• <span className="font-semibold text-red-600">Low Nitrogen:</span> Consider adding nitrogen-rich fertilizer to promote growth.</p>
          )}
          {phosphorus < NPK_RANGES.phosphorus.low && (
            <p>• <span className="font-semibold text-red-600">Low Phosphorus:</span> Add phosphorus fertilizer to improve root development.</p>
          )}
          {potassium < NPK_RANGES.potassium.low && (
            <p>• <span className="font-semibold text-red-600">Low Potassium:</span> Increase potassium levels for better plant health.</p>
          )}
          {nitrogen >= NPK_RANGES.nitrogen.low &&
           phosphorus >= NPK_RANGES.phosphorus.low &&
           potassium >= NPK_RANGES.potassium.low && (
            <p className="text-green-700">• <span className="font-semibold">Good Balance:</span> Nutrient levels are within acceptable ranges.</p>
          )}
          {nitrogen > NPK_RANGES.nitrogen.high && (
            <p>• <span className="font-semibold text-yellow-600">High Nitrogen:</span> May cause excessive vegetative growth. Monitor closely.</p>
          )}
          {phosphorus > NPK_RANGES.phosphorus.high && (
            <p>• <span className="font-semibold text-yellow-600">High Phosphorus:</span> Could interfere with other nutrient uptake.</p>
          )}
          {potassium > NPK_RANGES.potassium.high && (
            <p>• <span className="font-semibold text-yellow-600">High Potassium:</span> Excessive levels may affect magnesium and calcium absorption.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NPKChart;
