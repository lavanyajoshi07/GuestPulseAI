// Mock Data Generator for ReviewLens AI

import type { ReviewAnalysis } from '@/types';

interface MockReview {
  text: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  category: 'cleanliness' | 'communication' | 'location' | 'amenities' | 'host' | 'value' | 'other';
  keyPoints: string[];
  suggestedResponse: string;
  createdAt: Date;
}

const positiveReviews = [
  {
    text: 'Amazing stay! The accommodations were clean, spacious, and beautifully decorated. The host was incredibly responsive and helpful. Location is perfect for exploring the area. Highly recommended!',
    category: 'cleanliness',
    keyPoints: ['Clean rooms', 'Friendly host', 'Great location'],
    suggestedResponse: 'Thank you for the wonderful review! We are thrilled you enjoyed your stay. We look forward to hosting you again soon!',
  },
  {
    text: 'Outstanding experience from start to finish. The property exceeded our expectations. Amazing value for money. The host went above and beyond to make our stay memorable.',
    category: 'value',
    keyPoints: ['Excellent value', 'Helpful host', 'Exceeded expectations'],
    suggestedResponse: 'We appreciate your kind words! Thank you for choosing us. We hope to welcome you back on your next visit!',
  },
  {
    text: 'Perfect location! Close to all attractions and restaurants. The amenities were fantastic. Very comfortable beds. Will definitely come back!',
    category: 'location',
    keyPoints: ['Great location', 'Comfortable', 'Convenient'],
    suggestedResponse: 'Thank you for staying with us! We are glad you enjoyed the location and amenities. See you next time!',
  },
  {
    text: 'The communication with the host was seamless. Check-in was smooth and hassle-free. The property was immaculate and well-maintained. Great experience!',
    category: 'communication',
    keyPoints: ['Clear communication', 'Easy check-in', 'Well-maintained'],
    suggestedResponse: 'Thank you for your positive feedback! We pride ourselves on clear communication and guest satisfaction.',
  },
  {
    text: 'Wonderful accommodations with all the amenities we needed. The host was very friendly and accommodating. The neighborhood is beautiful and safe. Highly satisfied!',
    category: 'amenities',
    keyPoints: ['Complete amenities', 'Friendly host', 'Safe area'],
    suggestedResponse: 'Thank you for the excellent review! We are delighted you found everything you needed during your stay.',
  },
];

const neutralReviews = [
  {
    text: 'The place was okay. Nothing special but decent for the price. The host was helpful but took some time to respond. Bathroom could use some updates.',
    category: 'amenities',
    keyPoints: ['Basic amenities', 'Average quality', 'Could improve'],
    suggestedResponse: 'Thank you for your feedback. We appreciate your suggestions and will work on improvements.',
  },
  {
    text: 'Average stay. The room was clean but small. Location was convenient. Host was somewhat helpful. Would be okay for a short stay.',
    category: 'location',
    keyPoints: ['Small space', 'Convenient', 'Adequate service'],
    suggestedResponse: 'We appreciate your feedback. Thank you for staying with us!',
  },
  {
    text: 'Met expectations. The communication was timely. Place was as described. Nothing exceptional but satisfactory.',
    category: 'communication',
    keyPoints: ['As described', 'Timely responses', 'Satisfactory'],
    suggestedResponse: 'Thank you for your review. We are glad the property met your expectations.',
  },
  {
    text: 'Decent experience. The cleanliness was good. Some minor issues but overall acceptable. Host addressed concerns when raised.',
    category: 'cleanliness',
    keyPoints: ['Clean', 'Minor issues', 'Responsive'],
    suggestedResponse: 'We appreciate your feedback and are glad we could address your concerns.',
  },
];

const negativeReviews = [
  {
    text: 'Disappointing stay. The place was not as clean as expected. There were broken items and the host was slow to respond. Not worth the price.',
    category: 'cleanliness',
    keyPoints: ['Not clean', 'Broken items', 'Slow response'],
    suggestedResponse: 'We sincerely apologize for your disappointing experience. We take your feedback seriously and will address these issues immediately.',
  },
  {
    text: 'Poor communication from the host. Questions were answered very slowly. Check-in was difficult. Would not recommend.',
    category: 'communication',
    keyPoints: ['Slow responses', 'Difficult check-in', 'Poor service'],
    suggestedResponse: 'We apologize for the communication issues. We value your feedback and are committed to improving our service.',
  },
  {
    text: 'Overpriced for what you get. The amenities are outdated. The neighborhood is noisier than expected. Not a good value.',
    category: 'value',
    keyPoints: ['Too expensive', 'Outdated', 'Noisy area'],
    suggestedResponse: 'We appreciate your feedback. We are working on upgrades to provide better value for our guests.',
  },
  {
    text: 'The location description was misleading. Much noisier area than advertised. Lots of construction noise. Was not happy.',
    category: 'location',
    keyPoints: ['Misleading', 'Noisy', 'Construction'],
    suggestedResponse: 'We apologize for not meeting your expectations. We appreciate you bringing this to our attention.',
  },
  {
    text: 'Very disappointed with the host. Rude behavior and unwilling to help. The property had several issues that were ignored.',
    category: 'host',
    keyPoints: ['Unfriendly', 'Unhelpful', 'Issues ignored'],
    suggestedResponse: 'We sincerely apologize for your negative experience. We take this seriously and would like to discuss this further.',
  },
];

// Generate array of mock reviews spread over 7 days
export function generateMockReviews(): MockReview[] {
  const now = new Date();
  const mockReviews: MockReview[] = [];

  // Add some positive reviews (recent)
  positiveReviews.forEach((review, index) => {
    const daysAgo = Math.floor(Math.random() * 7);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(Math.floor(Math.random() * 24));
    date.setMinutes(Math.floor(Math.random() * 60));

    mockReviews.push({
      ...review,
      sentiment: 'positive',
      createdAt: date,
    });
  });

  // Add some neutral reviews
  neutralReviews.forEach((review, index) => {
    const daysAgo = Math.floor(Math.random() * 7);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(Math.floor(Math.random() * 24));
    date.setMinutes(Math.floor(Math.random() * 60));

    mockReviews.push({
      ...review,
      sentiment: 'neutral',
      createdAt: date,
    });
  });

  // Add some negative reviews
  negativeReviews.forEach((review, index) => {
    const daysAgo = Math.floor(Math.random() * 7);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(Math.floor(Math.random() * 24));
    date.setMinutes(Math.floor(Math.random() * 60));

    mockReviews.push({
      ...review,
      sentiment: 'negative',
      createdAt: date,
    });
  });

  // Shuffle reviews
  return mockReviews.sort(() => Math.random() - 0.5);
}
