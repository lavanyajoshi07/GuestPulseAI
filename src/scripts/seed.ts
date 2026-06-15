// Seed Script for ReviewLens AI - Populate Database with Mock Data

import mongoose from 'mongoose';
import Review from '../models/Review';
import { generateMockReviews } from '../lib/mockData';

const MONGODB_URI = process.env.MONGODB_URI;

async function seedDatabase() {
  try {
    // Check for MongoDB URI
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    console.log('[Seed] Connecting to MongoDB...');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed] Connected to MongoDB successfully');

    // Generate mock reviews
    console.log('[Seed] Generating mock reviews...');
    const mockReviews = generateMockReviews();
    console.log(`[Seed] Generated ${mockReviews.length} mock reviews`);

    // Option: Clear existing reviews
    const args = process.argv.slice(2);
    if (args.includes('--clear')) {
      console.log('[Seed] Clearing existing reviews...');
      await Review.deleteMany({});
      console.log('[Seed] Cleared all reviews');
    }

    // Insert mock reviews
    console.log('[Seed] Inserting mock reviews into database...');
    const inserted = await Review.insertMany(
      mockReviews.map((review) => ({
        text: review.text,
        sentiment: review.sentiment,
        category: review.category,
        keyPoints: review.keyPoints,
        suggestedResponse: review.suggestedResponse,
        sentimentScore: review.sentiment === 'positive' ? 0.8 : review.sentiment === 'negative' ? 0.3 : 0.5,
        createdAt: review.createdAt,
      }))
    );

    console.log(`[Seed] Successfully inserted ${inserted.length} reviews`);

    // Get statistics
    const total = await Review.countDocuments();
    const positiveCount = await Review.countDocuments({ sentiment: 'positive' });
    const neutralCount = await Review.countDocuments({ sentiment: 'neutral' });
    const negativeCount = await Review.countDocuments({ sentiment: 'negative' });

    console.log('[Seed] Database Statistics:');
    console.log(`  Total reviews: ${total}`);
    console.log(`  Positive: ${positiveCount}`);
    console.log(`  Neutral: ${neutralCount}`);
    console.log(`  Negative: ${negativeCount}`);

    console.log('[Seed] Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    process.exit(1);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
  }
}

// Run seeding
seedDatabase();
