import React, { useState, useEffect } from 'react';
import { getSensorReadings, getSensorStats, ISensorReadingDocument, SensorStats } from '../../../services/sensorService';
import { Calendar, TrendingUp, Loader } from 'lucide-react';

interface SensorHistoryChartProps {
  sensorId: string;
}

type TimeRange = '24h' | '7d' | '30d';

const SensorHistoryChart: React.FC<SensorHistoryChartProps> = ({ sensorId }) => {
  const [readings, setReadings] = useState<ISensorReadingDocument[]>([]);
  const [stats, setStats] = useState<SensorStats | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [sensorId, timeRange]);

  const getDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
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

      const [readingsData, statsData] = await Promise.all([
        getSensorReadings(sensorId, { startDate, endDate, limit: 100 }),
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-blue-600 mr-3" />
        <span className="text-gray-600">Loading history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-12">
        <p>{error}</p>
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (readings.length === 0) {
    return (
      <div className="text-center text-gray-500 py-12">
        <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p>No historical data available for the selected time range</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-center space-x-2">
        {(['24h', '7d', '30d'] as TimeRange[]).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              timeRange === range
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {range === '24h' ? 'Last 24 Hours' : range === '7d' ? 'Last 7 Days' : 'Last 30 Days'}
          </button>
        ))}
      </div>

      {/* Statistics Summary */}
      {stats && (
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
      {stats && (
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

      {/* Readings Table */}
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
                      minute: '2-digit'
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
        Showing {readings.length} readings from the last {
          timeRange === '24h' ? '24 hours' : timeRange === '7d' ? '7 days' : '30 days'
        }
      </div>
    </div>
  );
};

export default SensorHistoryChart;
