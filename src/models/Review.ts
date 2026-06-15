import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  reviewText: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  category: 'Food' | 'Cleanliness' | 'Location' | 'Host' | 'Value' | 'Experience';
  aiResponse: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    reviewText: {
      type: String,
      required: [true, 'Review text is required'],
      trim: true,
      minlength: [10, 'Review must be at least 10 characters long'],
    },
    sentiment: {
      type: String,
      enum: ['Positive', 'Neutral', 'Negative'],
      required: [true, 'Sentiment is required'],
    },
    category: {
      type: String,
      enum: ['Food', 'Cleanliness', 'Location', 'Host', 'Value', 'Experience'],
      required: [true, 'Category is required'],
    },
    aiResponse: {
      type: String,
      required: [true, 'AI response is required'],
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
