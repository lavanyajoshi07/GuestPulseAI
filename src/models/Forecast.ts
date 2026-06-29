import mongoose, { Schema, Document } from 'mongoose';

export interface IForecast extends Document {
  homestayId: mongoose.Types.ObjectId;
  predictedNPS: number;
  npsChange: number;
  repeatBookingProbability: number;
  loyaltyRiskLevel: 'green' | 'amber' | 'red';
  loyaltyInsights: string[];
  npsTrend: Array<{ period: string; historicalNPS?: number; predictedNPS: number }>;
  createdAt: Date;
  updatedAt: Date;
}

const ForecastSchema = new Schema<IForecast>(
  {
    homestayId: {
      type: Schema.Types.ObjectId,
      ref: 'Homestay',
      required: [true, 'Homestay ID is required'],
      index: true,
    },
    predictedNPS: {
      type: Number,
      default: 78,
    },
    npsChange: {
      type: Number,
      default: 3,
    },
    repeatBookingProbability: {
      type: Number,
      default: 72,
    },
    loyaltyRiskLevel: {
      type: String,
      enum: ['green', 'amber', 'red'],
      default: 'green',
    },
    loyaltyInsights: {
      type: [String],
      default: [],
    },
    npsTrend: {
      type: Schema.Types.Mixed,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

ForecastSchema.index({ homestayId: 1, createdAt: -1 });

const Forecast =
  mongoose.models.Forecast || mongoose.model<IForecast>('Forecast', ForecastSchema);

export default Forecast;
