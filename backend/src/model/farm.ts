import mongoose, { Document, Schema } from 'mongoose';

export interface IFarm extends Document {
  name: string;
  type: string;
  operationSince: string;
  areaSize: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  coordinatesText: string;
}

const FarmSchema: Schema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  operationSince: { type: String, required: true },
  areaSize: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  coordinatesText: { type: String, required: true }
}, { timestamps: true });

const Farm = mongoose.model<IFarm>('Farm', FarmSchema);
export default Farm;