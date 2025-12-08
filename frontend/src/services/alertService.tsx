import api from './api';

// Alert severity levels
export enum AlertSeverity {
  CRITICAL = 'critical',
  WARNING = 'warning',
  INFO = 'info'
}

// Alert types based on source
export enum AlertType {
  SENSOR = 'sensor',
  CAMERA = 'camera',
  WORKER = 'worker',
  SYSTEM = 'system'
}

export interface IAlert {
  _id: string;
  farmId: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  sourceId?: string;
  sourceName?: string;
  metadata?: {
    reading?: {
      value: number;
      threshold: number;
      unit: string;
    };
    [key: string]: any;
  };
  isRead: boolean;
  isResolved: boolean;
  resolvedAt?: Date | string;
  resolvedBy?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface AlertStats {
  bySeverity: {
    critical?: number;
    warning?: number;
    info?: number;
  };
  byType: {
    sensor?: number;
    camera?: number;
    worker?: number;
    system?: number;
  };
  total: number;
  unread: number;
  unresolved: number;
}

export interface AlertQueryParams {
  isResolved?: boolean;
  isRead?: boolean;
  severity?: AlertSeverity;
  type?: AlertType;
  limit?: number;
  offset?: number;
}

// Get all alerts for a farm
export const getAlertsByFarm = async (
  farmId: string,
  params?: AlertQueryParams
): Promise<{ data: IAlert[]; pagination: { total: number; limit: number; offset: number } }> => {
  const queryParams = new URLSearchParams();

  if (params?.isResolved !== undefined) {
    queryParams.append('isResolved', String(params.isResolved));
  }
  if (params?.isRead !== undefined) {
    queryParams.append('isRead', String(params.isRead));
  }
  if (params?.severity) {
    queryParams.append('severity', params.severity);
  }
  if (params?.type) {
    queryParams.append('type', params.type);
  }
  if (params?.limit) {
    queryParams.append('limit', String(params.limit));
  }
  if (params?.offset) {
    queryParams.append('offset', String(params.offset));
  }

  const queryString = queryParams.toString();
  const url = `/farms/${farmId}/alerts${queryString ? `?${queryString}` : ''}`;

  const response = await api.get(url);
  return response.data;
};

// Get single alert by ID
export const getAlertById = async (alertId: string): Promise<IAlert> => {
  const response = await api.get(`/alerts/${alertId}`);
  return response.data.data;
};

// Create a new alert
export const createAlert = async (
  farmId: string,
  alertData: {
    type: AlertType;
    severity: AlertSeverity;
    title: string;
    message: string;
    sourceId?: string;
    sourceName?: string;
    metadata?: any;
  }
): Promise<IAlert> => {
  const response = await api.post(`/farms/${farmId}/alerts`, alertData);
  return response.data.data;
};

// Mark alert as read
export const markAlertAsRead = async (alertId: string): Promise<IAlert> => {
  const response = await api.patch(`/alerts/${alertId}/read`);
  return response.data.data;
};

// Mark multiple alerts as read
export const markAlertsAsRead = async (farmId: string, alertIds: string[]): Promise<{ modifiedCount: number }> => {
  const response = await api.post(`/farms/${farmId}/alerts/mark-read`, { alertIds });
  return response.data.data;
};

// Resolve an alert
export const resolveAlert = async (alertId: string): Promise<IAlert> => {
  const response = await api.patch(`/alerts/${alertId}/resolve`);
  return response.data.data;
};

// Delete an alert
export const deleteAlert = async (alertId: string): Promise<void> => {
  await api.delete(`/alerts/${alertId}`);
};

// Get alert statistics
export const getAlertStats = async (farmId: string): Promise<AlertStats> => {
  const response = await api.get(`/farms/${farmId}/alerts/stats`);
  return response.data.data;
};
