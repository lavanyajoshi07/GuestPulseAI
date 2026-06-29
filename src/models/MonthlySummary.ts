import mongoose, { Schema, Document } from 'mongoose';

export interface IMonthlySummary extends Document {
  homestayId: mongoose.Types.ObjectId;
  yearMonth: string; // e.g. "2026-06" or "all"
  aiSummary: string;
  reviewCount: number;
  lastGeneratedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MonthlySummarySchema = new Schema<IMonthlySummary>(
  {
    homestayId: {
      type: Schema.Types.ObjectId,
      ref: 'Homestay',
      required: [true, 'Homestay ID is required'],
      index: true,
    },
    yearMonth: {
      type: String,
      required: [true, 'Year/Month key is required'],
      default: 'all',
    },
    aiSummary: {
      type: String,
      required: [true, 'AI Summary is required'],
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    lastGeneratedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

MonthlySummarySchema.index({ homestayId: 1, yearMonth: 1 }, { unique: true });

const MonthlySummary =
  mongoose.models.MonthlySummary ||
  mongoose.model<IMonthlySummary>('MonthlySummary', MonthlySummarySchema);

export default MonthlySummary;
