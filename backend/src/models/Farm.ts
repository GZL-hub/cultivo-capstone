import mongoose, { Document, Schema } from 'mongoose';

// Farm document interface
export interface IFarm extends Document {
  name: string;
  type: string;
  operationDate: string;
  areaSize: string;
  coordinates: string;
  owner: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Farm schema
const FarmSchema: Schema = new Schema(
  {
    name: { 
      type: String, 
      required: [true, 'Farm name is required'],
      trim: true 
    },
    type: { 
      type: String, 
      required: [true, 'Farm type is required'],
      trim: true 
    },
    operationDate: { 
      type: String, 
      required: [true, 'Operation date is required'] 
    },
    areaSize: { 
      type: String, 
      required: [true, 'Area size is required'] 
    },
    coordinates: { 
      type: String, 
      required: [true, 'Coordinates are required'] 
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false // You can make this required later when you have user authentication
    }
  },
  { 
    timestamps: true 
  }
);

export default mongoose.model<IFarm>('Farm', FarmSchema);