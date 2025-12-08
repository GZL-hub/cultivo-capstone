import mongoose, { Document, Schema } from 'mongoose';

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

// Interface for alert document
export interface IAlert extends Document {
  farmId: mongoose.Types.ObjectId;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  sourceId?: mongoose.Types.ObjectId; // ID of sensor, camera, or worker
  sourceName?: string; // Name of the source device/entity
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
  resolvedAt?: Date;
  resolvedBy?: mongoose.Types.ObjectId; // User who resolved it
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema = new Schema({
  farmId: {
    type: Schema.Types.ObjectId,
    ref: 'Farm',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: Object.values(AlertType),
    required: true
  },
  severity: {
    type: String,
    enum: Object.values(AlertSeverity),
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  sourceId: {
    type: Schema.Types.ObjectId,
    refPath: 'type'
  },
  sourceName: {
    type: String,
    trim: true
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  isResolved: {
    type: Boolean,
    default: false,
    index: true
  },
  resolvedAt: {
    type: Date
  },
  resolvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
AlertSchema.index({ farmId: 1, createdAt: -1 });
AlertSchema.index({ farmId: 1, isResolved: 1, severity: 1 });
AlertSchema.index({ farmId: 1, isRead: 1 });

export const Alert = mongoose.model<IAlert>('Alert', AlertSchema);
