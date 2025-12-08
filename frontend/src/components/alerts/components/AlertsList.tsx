import React from 'react';
import { IAlert } from '../../../services/alertService';
import AlertCard from './AlertCard';

interface AlertsListProps {
  alerts: IAlert[];
  onMarkAsRead: (alertId: string) => void;
  onResolve: (alertId: string) => void;
  onDelete: (alertId: string) => void;
}

const AlertsList: React.FC<AlertsListProps> = ({
  alerts,
  onMarkAsRead,
  onResolve,
  onDelete
}) => {
  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <AlertCard
          key={alert._id}
          alert={alert}
          onMarkAsRead={onMarkAsRead}
          onResolve={onResolve}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default AlertsList;