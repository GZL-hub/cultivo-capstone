import React, { useState, useEffect } from 'react';
import {
  IAlert,
  AlertSeverity,
  AlertType,
  AlertStats,
  getAlertsByFarm,
  markAlertAsRead,
  resolveAlert,
  deleteAlert,
  getAlertStats
} from '../../services/alertService';
import { getFarms } from '../../services/farmService';
import authService from '../../services/authService';
import { Bell, AlertCircle, Loader, Filter, Plus } from 'lucide-react';
import AlertsHeader from './components/AlertsHeader';
import AlertsStats from './components/AlertsStats';
import AlertsFilters from './components/AlertsFilters';
import AlertsList from './components/AlertsList';
import EmptyAlertsState from './components/EmptyAlertsState';

const Alerts = () => {
  const [alerts, setAlerts] = useState<IAlert[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<{
    severity?: AlertSeverity;
    type?: AlertType;
    isResolved?: boolean;
  }>({});
  const [showFilters, setShowFilters] = useState(false);
  const [farmId, setFarmId] = useState<string | null>(null);
  const [farmName, setFarmName] = useState<string>('');

  // Fetch user's farm on mount
  useEffect(() => {
    fetchUserFarm();
  }, []);

  // Fetch alerts when farmId changes or filter changes
  useEffect(() => {
    if (farmId) {
      fetchAlerts();
      fetchStats();
    }
  }, [farmId, filter]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!farmId) return;

    const intervalId = setInterval(() => {
      fetchAlerts(true);
      fetchStats();
    }, 30000);

    return () => clearInterval(intervalId);
  }, [farmId, filter]);

  const fetchUserFarm = async () => {
    try {
      setLoading(true);
      setError(null);

      const currentUser = authService.getCurrentUser();
      if (!currentUser || !currentUser.id) {
        setError('Please log in to view alerts');
        setLoading(false);
        return;
      }

      const farmsData = await getFarms();

      if (farmsData.length === 0) {
        setError('No farm registered. Please create a farm first.');
        setLoading(false);
        return;
      }

      setFarmId(farmsData[0]._id);
      setFarmName(farmsData[0].name);
    } catch (err: any) {
      console.error('Error fetching farm:', err);
      setError(err.response?.data?.error || 'Failed to load farm');
      setLoading(false);
    }
  };

  const fetchAlerts = async (isBackgroundRefresh = false) => {
    if (!farmId) return;

    try {
      if (!isBackgroundRefresh) {
        setLoading(true);
      }
      const response = await getAlertsByFarm(farmId, {
        ...filter,
        limit: 100
      });
      setAlerts(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching alerts:', err);
      setError(err.response?.data?.error || 'Failed to fetch alerts');
    } finally {
      if (!isBackgroundRefresh) {
        setLoading(false);
      }
    }
  };

  const fetchStats = async () => {
    if (!farmId) return;

    try {
      const statsData = await getAlertStats(farmId);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleMarkAsRead = async (alertId: string) => {
    try {
      await markAlertAsRead(alertId);
      setAlerts(alerts.map(a => a._id === alertId ? { ...a, isRead: true } : a));
      fetchStats();
    } catch (err) {
      console.error('Error marking alert as read:', err);
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      await resolveAlert(alertId);
      setAlerts(alerts.map(a => a._id === alertId ? { ...a, isResolved: true } : a));
      fetchStats();
    } catch (err) {
      console.error('Error resolving alert:', err);
    }
  };

  const handleDelete = async (alertId: string) => {
    if (!window.confirm('Are you sure you want to delete this alert?')) return;

    try {
      await deleteAlert(alertId);
      setAlerts(alerts.filter(a => a._id !== alertId));
      fetchStats();
    } catch (err) {
      console.error('Error deleting alert:', err);
    }
  };

  const handleClearFilters = () => {
    setFilter({});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
        <span className="ml-3 text-gray-600">Loading alerts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <AlertCircle className={`w-12 h-12 mx-auto mb-3 ${
            error.includes('No farm registered') ? 'text-yellow-500' : 'text-red-500'
          }`} />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {error.includes('No farm registered') ? 'No Farm Found' : 'Error'}
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          {error.includes('No farm registered') ? (
            <button
              onClick={() => window.location.href = '/farm-management'}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Create Farm
            </button>
          ) : (
            <button
              onClick={fetchUserFarm}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto flex flex-col bg-background">
      {/* Header */}
      <AlertsHeader
        farmName={farmName}
        alertCount={alerts.length}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Statistics */}
        {stats && <AlertsStats stats={stats} />}

        {/* Filters */}
        {showFilters && (
          <AlertsFilters
            filter={filter}
            onFilterChange={setFilter}
            onClearFilters={handleClearFilters}
          />
        )}

        {/* Alerts List */}
        {alerts.length === 0 ? (
          <EmptyAlertsState hasFilters={Object.keys(filter).length > 0} />
        ) : (
          <AlertsList
            alerts={alerts}
            onMarkAsRead={handleMarkAsRead}
            onResolve={handleResolve}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
};

export default Alerts;