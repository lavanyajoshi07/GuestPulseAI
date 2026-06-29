import mongoose, { Schema, Document } from 'mongoose';

export interface IAction extends Document {
  homestayId: mongoose.Types.ObjectId;
  title: string;
  category: string;
  notes: string;
  dateLogged: Date;
  complaintReductionPercent: number;
  satisfactionImprovementPercent: number;
  aiImpactSummary: string;
  createdAt: Date;
  updatedAt: Date;
}

const ActionSchema = new Schema<IAction>(
  {
    homestayId: {
      type: Schema.Types.ObjectId,
      ref: 'Homestay',
      required: [true, 'Homestay ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Action title is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
    },
    notes: {
      type: String,
      default: '',
    },
    dateLogged: {
      type: Date,
      default: Date.now,
    },
    complaintReductionPercent: {
      type: Number,
      default: 25,
    },
    satisfactionImprovementPercent: {
      type: Number,
      default: 10,
    },
    aiImpactSummary: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

ActionSchema.index({ homestayId: 1, createdAt: -1 });

const Action =
  mongoose.models.Action || mongoose.model<IAction>('Action', ActionSchema);

export default Action;
