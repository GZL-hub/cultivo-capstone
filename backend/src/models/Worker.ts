import mongoose, { Schema, Document } from 'mongoose';

export interface IWorker extends Document {
  id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  joinDate?: string;
  status?: 'active' | 'inactive';
  farmId: mongoose.Types.ObjectId; // Reference to the farm
  createdAt: Date;
  updatedAt: Date;
}

const WorkerSchema: Schema = new Schema(
  {
    id: { 
      type: String, 
      required: true, 
      unique: true 
    },
    name: { 
      type: String, 
      required: true 
    },
    role: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
    },
    phone: { 
      type: String 
    },
    joinDate: { 
      type: String 
    },
    status: { 
      type: String, 
      enum: ['active', 'inactive'],
      default: 'active'
    },
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: true
    }
  },
  { timestamps: true }
);

// Compound index to ensure unique workers per farm
WorkerSchema.index({ id: 1, farmId: 1 }, { unique: true });

export default mongoose.model<IWorker>('Worker', WorkerSchema);