import mongoose, { Schema, Document } from 'mongoose';

export interface IProactiveActionCard {
  id: string;
  title: string;
  description: string;
  severity: 'green' | 'amber' | 'red';
  category: string;
  actionTaken?: boolean;
}

export interface IPrediction extends Document {
  homestayId: mongoose.Types.ObjectId;
  forecastPeriod: string;
  predictedSatisfactionRate: number;
  predictedRisingComplaints: string[];
  predictedTrendingPositives: string[];
  seasonalInsights: string;
  proactiveActionCards: IProactiveActionCard[];
  forecastTrend: Array<{ period: string; actual?: number; predicted: number }>;
  accuracyScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProactiveActionCardSchema = new Schema<IProactiveActionCard>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: String, enum: ['green', 'amber', 'red'], required: true },
  category: { type: String, required: true },
  actionTaken: { type: Boolean, default: false },
});

const PredictionSchema = new Schema<IPrediction>(
  {
    homestayId: {
      type: Schema.Types.ObjectId,
      ref: 'Homestay',
      required: [true, 'Homestay ID is required'],
      index: true,
    },
    forecastPeriod: {
      type: String,
      default: 'upcoming_month',
    },
    predictedSatisfactionRate: {
      type: Number,
      default: 85,
    },
    predictedRisingComplaints: {
      type: [String],
      default: [],
    },
    predictedTrendingPositives: {
      type: [String],
      default: [],
    },
    seasonalInsights: {
      type: String,
      default: '',
    },
    proactiveActionCards: {
      type: [ProactiveActionCardSchema],
      default: [],
    },
    forecastTrend: {
      type: Schema.Types.Mixed,
      default: [],
    },
    accuracyScore: {
      type: Number,
      default: 92,
    },
  },
  {
    timestamps: true,
  }
);

PredictionSchema.index({ homestayId: 1, createdAt: -1 });

const Prediction =
  mongoose.models.Prediction || mongoose.model<IPrediction>('Prediction', PredictionSchema);

export default Prediction;
