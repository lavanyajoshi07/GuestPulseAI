import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  homestayId: mongoose.Types.ObjectId;
  platform: string;
  reviewText: string;
  text: string; // virtual field
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore?: number;
  category: 'food' | 'cleanliness' | 'location' | 'host' | 'value' | 'experience';
  keywords: string[];
  keyPoints?: string[]; // for backward compatibility
  summary: string;
  suggestedResponse: string;
  improvementSuggestion?: string;
  analysis?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    homestayId: {
      type: Schema.Types.ObjectId,
      ref: 'Homestay',
      required: [true, 'Homestay ID is required'],
      index: true,
    },
    platform: {
      type: String,
      default: 'manual',
      trim: true,
    },
    reviewText: {
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
      enum: ['food', 'cleanliness', 'location', 'host', 'value', 'experience'],
      required: [true, 'Category is required'],
      lowercase: true,
    },
    keywords: {
      type: [String],
      default: [],
    },
    keyPoints: {
      type: [String],
      default: [],
    },
    summary: {
      type: String,
      required: [true, 'Summary is required'],
    },
    suggestedResponse: {
      type: String,
      default: '',
    },
    improvementSuggestion: {
      type: String,
      default: '',
    },
    analysis: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field for "text" mapping to "reviewText" for backward compatibility
ReviewSchema.virtual('text')
  .get(function (this: IReview) {
    return this.reviewText;
  })
  .set(function (this: IReview, val: string) {
    this.reviewText = val;
  });

// Compound index for tenant isolation and date sorting performance
ReviewSchema.index({ homestayId: 1, createdAt: -1 });

// Prevent model recompilation
const Review =
  mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;

