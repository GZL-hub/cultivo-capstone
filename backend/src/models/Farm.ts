import mongoose, { Document, Schema } from 'mongoose';

export interface IFarm extends Document {
  name: string;
  type: string;
  operationDate: string;
  areaSize: string;
  coordinates: string;
  farmBoundary: {
    type: string;
    coordinates: number[][][];
  };
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
    required: true
  },
  farmBoundary: {
    type: {
      type: String,
      enum: ['Polygon'],
      required: true
    },
    coordinates: {
      type: [[[Number]]], // Array of arrays of arrays of numbers
      required: true
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

export default mongoose.model<IFarm>('Farm', FarmSchema);