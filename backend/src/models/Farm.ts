import mongoose, { Document, Schema } from 'mongoose';

export interface IFarm extends Document {
  name: string;
  type: string;
  operationDate: string;
  areaSize: string;
  coordinates?: string;
  farmBoundary?: {
    type: string;
    coordinates: number[][][];
  };
  owner: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FarmSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true
  },
  operationDate: {
    type: String,
    required: true
  },
  areaSize: {
    type: String,
    required: true
  },
  coordinates: {
    type: String,
    required: false
  },
  farmBoundary: {
    type: Schema.Types.Mixed,
    required: false,
    default: undefined
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

export default mongoose.model<IFarm>('Farm', FarmSchema);