import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  text: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore?: number;
  category: 'cleanliness' | 'communication' | 'location' | 'amenities' | 'host' | 'value' | 'other';
  keyPoints?: string[];
  suggestedResponse: string;
  analysis?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    text: {
      type: String,
      required: [true, 'Review text is required'],
      trim: true,
      minlength: [10, 'Review must be at least 10 characters long'],
    },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      required: [true, 'Sentiment is required'],
      lowercase: true,
    },
    sentimentScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.75,
    },
    category: {
      type: String,
      enum: ['cleanliness', 'communication', 'location', 'amenities', 'host', 'value', 'other'],
      required: [true, 'Category is required'],
      lowercase: true,
    },
    keyPoints: {
      type: [String],
      default: [],
    },
    suggestedResponse: {
      type: String,
      required: [true, 'Suggested response is required'],
    },
    analysis: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation
const Review =
  mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
