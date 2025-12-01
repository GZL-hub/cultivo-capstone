import mongoose, { Document, Schema } from 'mongoose';

// Interface for sensor reading
export interface ISensorReading {
  timestamp: Date;
  moisture: number;
  temperature: number;
  ph: number;
  ec: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  pumpStatus: boolean;
}

// Interface for sensor document
export interface ISensor extends Document {
  deviceId: string;
  deviceName: string;
  farmId: mongoose.Types.ObjectId;
  blynkTemplateId: string;
  blynkAuthToken: string;
  isActive: boolean;
  lastReading?: ISensorReading;
  settings: {
    moistureThreshold: number;
    optimalPh: { min: number; max: number };
    optimalTemperature: { min: number; max: number };
  };
  createdAt: Date;
  updatedAt: Date;
}

// Interface for sensor reading document
export interface ISensorReadingDocument extends Document {
  sensorId: mongoose.Types.ObjectId;
  moisture: number;
  temperature: number;
  ph: number;
  ec: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  pumpStatus: boolean;
  timestamp: Date;
}

const SensorSchema = new Schema({
  deviceId: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  deviceName: {
    type: String,
    required: true,
    trim: true
  },
  farmId: {
    type: Schema.Types.ObjectId,
    ref: 'Farm',
    required: true
  },
  blynkTemplateId: {
    type: String,
    required: true
  },
  blynkAuthToken: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastReading: {
    timestamp: Date,
    moisture: Number,
    temperature: Number,
    ph: Number,
    ec: Number,
    nitrogen: Number,
    phosphorus: Number,
    potassium: Number,
    pumpStatus: Boolean
  },
  settings: {
    moistureThreshold: {
      type: Number,
      default: 30
    },
    optimalPh: {
      min: { type: Number, default: 6.0 },
      max: { type: Number, default: 7.5 }
    },
    optimalTemperature: {
      min: { type: Number, default: 20 },
      max: { type: Number, default: 30 }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
SensorSchema.index({ farmId: 1 });
SensorSchema.index({ deviceId: 1 });

const SensorReadingSchema = new Schema({
  sensorId: {
    type: Schema.Types.ObjectId,
    ref: 'Sensor',
    required: true
  },
  moisture: {
    type: Number,
    required: true
  },
  temperature: {
    type: Number,
    required: true
  },
  ph: {
    type: Number,
    required: true
  },
  ec: {
    type: Number,
    required: true
  },
  nitrogen: {
    type: Number,
    required: true
  },
  phosphorus: {
    type: Number,
    required: true
  },
  potassium: {
    type: Number,
    required: true
  },
  pumpStatus: {
    type: Boolean,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  timeseries: {
    timeField: 'timestamp',
    metaField: 'sensorId',
    granularity: 'seconds'
  }
});

// Index for time-series queries
SensorReadingSchema.index({ sensorId: 1, timestamp: -1 });

export const Sensor = mongoose.model<ISensor>('Sensor', SensorSchema);
export const SensorReading = mongoose.model<ISensorReadingDocument>('SensorReading', SensorReadingSchema);
