import mongoose, { Schema, Document } from 'mongoose';

export interface IPropertyComparison {
  propertyName: string;
  satisfactionRate: number;
  topCategory: string;
  status: 'Best Performer' | 'Needs Attention' | 'Average';
}

export interface IBenchmark extends Document {
  homestayId: mongoose.Types.ObjectId;
  industryAverageSatisfaction: number;
  ownerSatisfaction: number;
  regionalCleanlinessScore: number;
  regionalHostScore: number;
  competitiveInsights: string[];
  propertyComparisons: IPropertyComparison[];
  createdAt: Date;
  updatedAt: Date;
}

const PropertyComparisonSchema = new Schema<IPropertyComparison>({
  propertyName: { type: String, required: true },
  satisfactionRate: { type: Number, required: true },
  topCategory: { type: String, required: true },
  status: { type: String, enum: ['Best Performer', 'Needs Attention', 'Average'], required: true },
});

const BenchmarkSchema = new Schema<IBenchmark>(
  {
    homestayId: {
      type: Schema.Types.ObjectId,
      ref: 'Homestay',
      required: [true, 'Homestay ID is required'],
      index: true,
    },
    industryAverageSatisfaction: {
      type: Number,
      default: 78,
    },
    ownerSatisfaction: {
      type: Number,
      default: 88,
    },
    regionalCleanlinessScore: {
      type: Number,
      default: 82,
    },
    regionalHostScore: {
      type: Number,
      default: 85,
    },
    competitiveInsights: {
      type: [String],
      default: [],
    },
    propertyComparisons: {
      type: [PropertyComparisonSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

BenchmarkSchema.index({ homestayId: 1, createdAt: -1 });

const Benchmark =
  mongoose.models.Benchmark || mongoose.model<IBenchmark>('Benchmark', BenchmarkSchema);

export default Benchmark;
