import React from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  Droplets,
  Camera,
  Users,
  Server,
  Check,
  Trash2
} from 'lucide-react';
import { IAlert, AlertSeverity, AlertType } from '../../../services/alertService';

interface AlertCardProps {
  alert: IAlert;
  onMarkAsRead: (alertId: string) => void;
  onResolve: (alertId: string) => void;
  onDelete: (alertId: string) => void;
}

const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onMarkAsRead,
  onResolve,
  onDelete
}) => {
  const getSeverityStyle = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          iconColor: 'text-red-600',
          textColor: 'text-red-800',
          badgeBg: 'bg-red-100',
          badgeText: 'text-red-700'
        };
      case AlertSeverity.WARNING:
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          textColor: 'text-yellow-800',
          badgeBg: 'bg-yellow-100',
          badgeText: 'text-yellow-700'
        };
      case AlertSeverity.INFO:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          iconColor: 'text-blue-600',
          textColor: 'text-blue-800',
          badgeBg: 'bg-blue-100',
          badgeText: 'text-blue-700'
        };
    }
  };

  const getSeverityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case AlertSeverity.CRITICAL:
        return AlertTriangle;
      case AlertSeverity.WARNING:
        return AlertCircle;
      case AlertSeverity.INFO:
        return Info;
    }
  };

  const getTypeIcon = (type: AlertType) => {
    switch (type) {
      case AlertType.SENSOR:
        return Droplets;
      case AlertType.CAMERA:
        return Camera;
      case AlertType.WORKER:
        return Users;
      case AlertType.SYSTEM:
        return Server;
    }
  };

  const formatTimestamp = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const style = getSeverityStyle(alert.severity);
  const SeverityIcon = getSeverityIcon(alert.severity);
  const TypeIcon = getTypeIcon(alert.type);

  return (
    <div
      className={`${style.bg} ${style.border} border-l-4 rounded-lg p-4 ${
        alert.isRead ? 'opacity-75' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start flex-1">
          <div className="flex-shrink-0 mr-3">
            <SeverityIcon className={`w-6 h-6 ${style.iconColor}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-semibold ${style.textColor}`}>{alert.title}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${style.badgeBg} ${style.badgeText}`}>
                {alert.severity}
              </span>
              {alert.isResolved && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  Resolved
                </span>
              )}
              {!alert.isRead && (
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </div>
            <p className="text-gray-700 text-sm mb-2">{alert.message}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center">
                <TypeIcon className="w-3 h-3 mr-1" />
                {alert.type}
              </div>
              {alert.sourceName && (
                <span className="font-medium">{alert.sourceName}</span>
              )}
              <span>{formatTimestamp(alert.createdAt)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {!alert.isRead && (
            <button
              onClick={() => onMarkAsRead(alert._id)}
              className="p-2 hover:bg-white rounded-lg transition-colors"
              title="Mark as read"
            >
              <Check className="w-4 h-4 text-gray-600" />
            </button>
          )}
          {!alert.isResolved && (
            <button
              onClick={() => onResolve(alert._id)}
              className="p-2 hover:bg-white rounded-lg transition-colors"
              title="Resolve alert"
            >
              <CheckCircle className="w-4 h-4 text-green-600" />
            </button>
          )}
          <button
            onClick={() => onDelete(alert._id)}
            className="p-2 hover:bg-white rounded-lg transition-colors"
            title="Delete alert"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertCard;