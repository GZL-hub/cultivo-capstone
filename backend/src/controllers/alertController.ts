import { Request, Response } from 'express';
import { Alert, AlertSeverity, AlertType } from '../models/Alert';
import Farm from '../models/Farm';
import mongoose from 'mongoose';

// Custom request type with user
interface AuthRequest extends Request {
  user?: {
    id: string;
    [key: string]: any;
  };
}

// Get all alerts for a farm
export const getAlertsByFarm = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { farmId } = req.params;
    const { isResolved, isRead, severity, type, limit = '50', offset = '0' } = req.query;

    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(farmId)) {
      res.status(400).json({ success: false, error: 'Invalid farm ID' });
      return;
    }

    // Verify farm ownership
    const farm = await Farm.findById(farmId);
    if (!farm) {
      res.status(404).json({ success: false, error: 'Farm not found' });
      return;
    }

    if (farm.owner.toString() !== req.user.id) {
      res.status(403).json({ success: false, error: 'Not authorized to access this farm' });
      return;
    }

    // Build query
    const query: any = { farmId };

    if (isResolved !== undefined) {
      query.isResolved = isResolved === 'true';
    }

    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    if (severity) {
      query.severity = severity;
    }

    if (type) {
      query.type = type;
    }

    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(offset as string));

    const total = await Alert.countDocuments(query);

    res.status(200).json({
      success: true,
      data: alerts,
      pagination: {
        total,
        limit: parseInt(limit as string),
        offset: parseInt(offset as string)
      }
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Get single alert by ID
export const getAlertById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { alertId } = req.params;

    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(alertId)) {
      res.status(400).json({ success: false, error: 'Invalid alert ID' });
      return;
    }

    const alert = await Alert.findById(alertId).populate('farmId', 'name');

    if (!alert) {
      res.status(404).json({ success: false, error: 'Alert not found' });
      return;
    }

    // Verify farm ownership
    const farm = await Farm.findById(alert.farmId);
    if (!farm) {
      res.status(404).json({ success: false, error: 'Farm not found' });
      return;
    }

    if (farm.owner.toString() !== req.user.id) {
      res.status(403).json({ success: false, error: 'Not authorized to access this alert' });
      return;
    }

    res.status(200).json({ success: true, data: alert });
  } catch (error) {
    console.error('Error fetching alert:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Create a new alert
export const createAlert = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { farmId } = req.params;
    const { type, severity, title, message, sourceId, sourceName, metadata } = req.body;

    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(farmId)) {
      res.status(400).json({ success: false, error: 'Invalid farm ID' });
      return;
    }

    // Verify farm ownership
    const farm = await Farm.findById(farmId);
    if (!farm) {
      res.status(404).json({ success: false, error: 'Farm not found' });
      return;
    }

    if (farm.owner.toString() !== req.user.id) {
      res.status(403).json({ success: false, error: 'Not authorized to create alerts for this farm' });
      return;
    }

    // Validate required fields
    if (!type || !severity || !title || !message) {
      res.status(400).json({
        success: false,
        error: 'Missing required fields: type, severity, title, message'
      });
      return;
    }

    // Validate enums
    if (!Object.values(AlertType).includes(type)) {
      res.status(400).json({ success: false, error: 'Invalid alert type' });
      return;
    }

    if (!Object.values(AlertSeverity).includes(severity)) {
      res.status(400).json({ success: false, error: 'Invalid alert severity' });
      return;
    }

    const alert = await Alert.create({
      farmId,
      type,
      severity,
      title,
      message,
      sourceId,
      sourceName,
      metadata
    });

    res.status(201).json({ success: true, data: alert });
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Mark alert as read
export const markAlertAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { alertId } = req.params;

    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(alertId)) {
      res.status(400).json({ success: false, error: 'Invalid alert ID' });
      return;
    }

    // Get alert first to check farm ownership
    const existingAlert = await Alert.findById(alertId);
    if (!existingAlert) {
      res.status(404).json({ success: false, error: 'Alert not found' });
      return;
    }

    // Verify farm ownership
    const farm = await Farm.findById(existingAlert.farmId);
    if (!farm) {
      res.status(404).json({ success: false, error: 'Farm not found' });
      return;
    }

    if (farm.owner.toString() !== req.user.id) {
      res.status(403).json({ success: false, error: 'Not authorized to modify this alert' });
      return;
    }

    const alert = await Alert.findByIdAndUpdate(
      alertId,
      { isRead: true },
      { new: true }
    );

    res.status(200).json({ success: true, data: alert });
  } catch (error) {
    console.error('Error marking alert as read:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Mark multiple alerts as read
export const markAlertsAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { farmId } = req.params;
    const { alertIds } = req.body;

    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(farmId)) {
      res.status(400).json({ success: false, error: 'Invalid farm ID' });
      return;
    }

    // Verify farm ownership
    const farm = await Farm.findById(farmId);
    if (!farm) {
      res.status(404).json({ success: false, error: 'Farm not found' });
      return;
    }

    if (farm.owner.toString() !== req.user.id) {
      res.status(403).json({ success: false, error: 'Not authorized to modify alerts for this farm' });
      return;
    }

    if (!alertIds || !Array.isArray(alertIds)) {
      res.status(400).json({ success: false, error: 'alertIds must be an array' });
      return;
    }

    const result = await Alert.updateMany(
      {
        _id: { $in: alertIds },
        farmId
      },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    console.error('Error marking alerts as read:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Resolve an alert
export const resolveAlert = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { alertId } = req.params;

    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(alertId)) {
      res.status(400).json({ success: false, error: 'Invalid alert ID' });
      return;
    }

    // Get alert first to check farm ownership
    const existingAlert = await Alert.findById(alertId);
    if (!existingAlert) {
      res.status(404).json({ success: false, error: 'Alert not found' });
      return;
    }

    // Verify farm ownership
    const farm = await Farm.findById(existingAlert.farmId);
    if (!farm) {
      res.status(404).json({ success: false, error: 'Farm not found' });
      return;
    }

    if (farm.owner.toString() !== req.user.id) {
      res.status(403).json({ success: false, error: 'Not authorized to resolve this alert' });
      return;
    }

    const alert = await Alert.findByIdAndUpdate(
      alertId,
      {
        isResolved: true,
        resolvedAt: new Date(),
        resolvedBy: req.user?.id
      },
      { new: true }
    );

    res.status(200).json({ success: true, data: alert });
  } catch (error) {
    console.error('Error resolving alert:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Delete an alert
export const deleteAlert = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { alertId } = req.params;

    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(alertId)) {
      res.status(400).json({ success: false, error: 'Invalid alert ID' });
      return;
    }

    // Get alert first to check farm ownership
    const alert = await Alert.findById(alertId);
    if (!alert) {
      res.status(404).json({ success: false, error: 'Alert not found' });
      return;
    }

    // Verify farm ownership
    const farm = await Farm.findById(alert.farmId);
    if (!farm) {
      res.status(404).json({ success: false, error: 'Farm not found' });
      return;
    }

    if (farm.owner.toString() !== req.user.id) {
      res.status(403).json({ success: false, error: 'Not authorized to delete this alert' });
      return;
    }

    await Alert.findByIdAndDelete(alertId);

    res.status(200).json({ success: true, data: { message: 'Alert deleted successfully' } });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// Get alert statistics for a farm
export const getAlertStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { farmId } = req.params;

    if (!req.user || !req.user.id) {
      res.status(401).json({ success: false, error: 'User not authenticated' });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(farmId)) {
      res.status(400).json({ success: false, error: 'Invalid farm ID' });
      return;
    }

    // Verify farm ownership
    const farm = await Farm.findById(farmId);
    if (!farm) {
      res.status(404).json({ success: false, error: 'Farm not found' });
      return;
    }

    if (farm.owner.toString() !== req.user.id) {
      res.status(403).json({ success: false, error: 'Not authorized to access this farm' });
      return;
    }

    const stats = await Alert.aggregate([
      { $match: { farmId: new mongoose.Types.ObjectId(farmId) } },
      {
        $facet: {
          bySeverity: [
            { $group: { _id: '$severity', count: { $sum: 1 } } }
          ],
          byType: [
            { $group: { _id: '$type', count: { $sum: 1 } } }
          ],
          byStatus: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                unread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } },
                unresolved: { $sum: { $cond: [{ $eq: ['$isResolved', false] }, 1, 0] } }
              }
            }
          ]
        }
      }
    ]);

    const result = {
      bySeverity: stats[0].bySeverity.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byType: stats[0].byType.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      total: stats[0].byStatus[0]?.total || 0,
      unread: stats[0].byStatus[0]?.unread || 0,
      unresolved: stats[0].byStatus[0]?.unresolved || 0
    };

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Error fetching alert stats:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};
