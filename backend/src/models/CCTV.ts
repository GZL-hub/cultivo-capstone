import mongoose, { Schema, Document } from 'mongoose';

export interface ICCTV extends Document {
  name: string;
  status: 'online' | 'offline';
  type: string;
  streamUrl: string;
  farmId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CCTVSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['online', 'offline'],
      default: 'offline'
    },
    type: {
      type: String,
      required: true
    },
    streamUrl: {
      type: String,
      required: true
    },
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model<ICCTV>('CCTV', CCTVSchema);
