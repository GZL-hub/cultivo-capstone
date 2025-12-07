import React, { useState, useEffect } from 'react';
import { getSensorReadings, getSensorStats, ISensorReadingDocument, SensorStats } from '../../../services/sensorService';
import { Calendar, TrendingUp, Loader } from 'lucide-react';

interface SensorHistoryChartProps {
  sensorId: string;
}

type TimeRange = '10min' | '30min' | '1hour' | '1day' | '7days' | '30days' | 'all';

const SensorHistoryChart: React.FC<SensorHistoryChartProps> = ({ sensorId }) => {
  const [readings, setReadings] = useState<ISensorReadingDocument[]>([]);
  const [stats, setStats] = useState<SensorStats | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [sensorId, timeRange]);

  const getDateRange = () => {
    // If "all" is selected, return undefined to fetch all historical data
    if (timeRange === 'all') {
      return { startDate: undefined, endDate: undefined };
    }

    const endDate = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case '10min':
        startDate.setMinutes(startDate.getMinutes() - 10);
        break;
      case '30min':
        startDate.setMinutes(startDate.getMinutes() - 30);
        break;
      case '1hour':
        startDate.setHours(startDate.getHours() - 1);
        break;
      case '1day':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
    }

    return { startDate: startDate.toISOString(), endDate: endDate.toISOString() };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const { startDate, endDate } = getDateRange();

      // Build options object, only include dates if they're defined
      const readingsOptions: any = { limit: 1000 };
      if (startDate) readingsOptions.startDate = startDate;
      if (endDate) readingsOptions.endDate = endDate;

      // Add aggregation based on time range to reduce data bloat
      switch (timeRange) {
        case '10min':
        case '30min':
        case '1hour':
          // No aggregation for short ranges - show all raw data
          break;
        case '1day':
          readingsOptions.aggregation = '5min'; // 5-minute averages
          break;
        case '7days':
          readingsOptions.aggregation = '1hour'; // 1-hour averages
          break;
        case '30days':
          readingsOptions.aggregation = '4hour'; // 4-hour averages
          break;
        case 'all':
          readingsOptions.aggregation = '1day'; // Daily averages
          break;
      }

      const [readingsData, statsData] = await Promise.all([
        getSensorReadings(sensorId, readingsOptions),
        getSensorStats(sensorId, startDate, endDate)
      ]);

      setReadings(readingsData.data);
      setStats(statsData);
    } catch (err: any) {
      console.error('Error fetching history:', err);
      setError('Failed to load history data');
    } finally {
      setLoading(false);
    }
  };

  const getTimeRangeLabel = (range: TimeRange) => {
    switch (range) {
      case '10min': return 'Last 10 Minutes';
      case '30min': return 'Last 30 Minutes';
      case '1hour': return 'Last 1 Hour';
      case '1day': return 'Last 24 Hours';
      case '7days': return 'Last 7 Days';
      case '30days': return 'Last 30 Days';
      case 'all': return 'All Time';
    }
  };

  const getAggregationInfo = () => {
    switch (timeRange) {
      case '1day': return '5-minute averages';
      case '7days': return '1-hour averages';
      case '30days': return '4-hour averages';
      case 'all': return 'Daily averages';
      default: return 'Raw data (30s intervals)';
    }
  };

  return (
    <div className="space-y-6">
      {/* Time Range Selector - Always visible */}
      <div className="space-y-2">
        <div className="flex flex-wrap justify-center gap-2">
          {(['10min', '30min', '1hour', '1day', '7days', '30days', 'all'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-2 rounded-lg font-semibold text-sm transition ${
                timeRange === range
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {getTimeRangeLabel(range)}
            </button>
          ))}
        </div>
        <div className="text-center text-xs text-gray-500">
          Showing: {getAggregationInfo()}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-green-600 mr-3" />
          <span className="text-gray-600">Loading history...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center text-red-600 py-12">
          <p>{error}</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* No Data State */}
      {!loading && !error && readings.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p>No historical data available for the selected time range</p>
          <p className="text-sm text-gray-400 mt-2">
            Try selecting a different time range or wait for sensor data to be collected
          </p>
        </div>
      )}

      {/* Statistics Summary */}
      {stats && stats.count > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Avg Moisture</p>
            <p className="text-2xl font-bold text-blue-600">{stats.avgMoisture.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.minMoisture.toFixed(1)}% - {stats.maxMoisture.toFixed(1)}%
            </p>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Avg Temp</p>
            <p className="text-2xl font-bold text-orange-600">{stats.avgTemperature.toFixed(1)}°C</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.minTemperature.toFixed(1)}°C - {stats.maxTemperature.toFixed(1)}°C
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Avg pH</p>
            <p className="text-2xl font-bold text-purple-600">{stats.avgPh.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.minPh.toFixed(2)} - {stats.maxPh.toFixed(2)}
            </p>
          </div>

          <div className="bg-teal-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Avg EC</p>
            <p className="text-2xl font-bold text-teal-600">{stats.avgEc.toFixed(0)}</p>
            <p className="text-xs text-gray-500 mt-1">µS/cm</p>
          </div>
        </div>
      )}

      {/* NPK Averages */}
      {stats && stats.count > 0 && (
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-3">Average NPK Levels</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Nitrogen</p>
              <p className="text-xl font-bold text-green-700">{stats.avgNitrogen.toFixed(1)}</p>
              <p className="text-xs text-gray-500">mg/kg</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Phosphorus</p>
              <p className="text-xl font-bold text-green-700">{stats.avgPhosphorus.toFixed(1)}</p>
              <p className="text-xs text-gray-500">mg/kg</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Potassium</p>
              <p className="text-xl font-bold text-green-700">{stats.avgPotassium.toFixed(1)}</p>
              <p className="text-xs text-gray-500">mg/kg</p>
            </div>
          </div>
        </div>
      )}

      {/* Readings Table - Only show when we have data */}
      {!loading && !error && readings.length > 0 && (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Time</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Moisture</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Temp</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">pH</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">EC</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">N-P-K</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Pump</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {readings.map((reading, index) => (
                    <tr key={reading._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 text-sm text-gray-800 whitespace-nowrap">
                        {new Date(reading.timestamp).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-800">
                        {reading.moisture.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-800">
                        {reading.temperature.toFixed(1)}°C
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-800">
                        {reading.ph.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-gray-800">
                        {reading.ec}
                      </td>
                      <td className="px-4 py-3 text-xs text-center text-gray-700 font-mono">
                        {reading.nitrogen}-{reading.phosphorus}-{reading.potassium}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {reading.pumpStatus ? (
                          <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                        ) : (
                          <span className="inline-block w-3 h-3 bg-gray-300 rounded-full"></span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-center text-sm text-gray-500">
            Showing {readings.length} reading{readings.length !== 1 ? 's' : ''} from {getTimeRangeLabel(timeRange).toLowerCase()}
          </div>
        </>
      )}
    </div>
  );
};

export default SensorHistoryChart;
