const bcrypt = require('bcryptjs');

// Default user
const salt = bcrypt.genSaltSync(10);
const passwordHash = bcrypt.hashSync('Password123', salt);

const mockUsers = [
  {
    _id: 'mock-user-1',
    name: 'John Doe',
    email: 'john@example.com',
    passwordHash,
    createdAt: new Date()
  }
];

const mockReviews = [
  {
    _id: 'mock-review-1',
    text: 'Amazing stay! The accommodations were clean, spacious, and beautifully decorated. The host was incredibly responsive and helpful. Location is perfect for exploring the area. Highly recommended!',
    sentiment: 'positive',
    sentimentScore: 0.85,
    category: 'cleanliness',
    keyPoints: ['Clean rooms', 'Friendly host', 'Great location'],
    suggestedResponse: 'Thank you for the wonderful review! We are thrilled you enjoyed your stay. We look forward to hosting you again soon!',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    _id: 'mock-review-2',
    text: 'Outstanding experience from start to finish. The property exceeded our expectations. Amazing value for money. The host went above and beyond to make our stay memorable.',
    sentiment: 'positive',
    sentimentScore: 0.9,
    category: 'value',
    keyPoints: ['Excellent value', 'Helpful host', 'Exceeded expectations'],
    suggestedResponse: 'We appreciate your kind words! Thank you for choosing us. We hope to welcome you back on your next visit!',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    _id: 'mock-review-3',
    text: 'Perfect location! Close to all attractions and restaurants. The amenities were fantastic. Very comfortable beds. Will definitely come back!',
    sentiment: 'positive',
    sentimentScore: 0.88,
    category: 'location',
    keyPoints: ['Great location', 'Comfortable', 'Convenient'],
    suggestedResponse: 'Thank you for staying with us! We are glad you enjoyed the location and amenities. See you next time!',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    _id: 'mock-review-4',
    text: 'The communication with the host was seamless. Check-in was smooth and hassle-free. The property was immaculate and well-maintained. Great experience!',
    sentiment: 'positive',
    sentimentScore: 0.95,
    category: 'communication',
    keyPoints: ['Clear communication', 'Easy check-in', 'Well-maintained'],
    suggestedResponse: 'Thank you for your positive feedback! We pride ourselves on clear communication and guest satisfaction.',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
  },
  {
    _id: 'mock-review-5',
    text: 'Wonderful accommodations with all the amenities we needed. The host was very friendly and accommodating. The neighborhood is beautiful and safe. Highly satisfied!',
    sentiment: 'positive',
    sentimentScore: 0.87,
    category: 'amenities',
    keyPoints: ['Complete amenities', 'Friendly host', 'Safe area'],
    suggestedResponse: 'Thank you for the excellent review! We are delighted you found everything you needed during your stay.',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  },
  {
    _id: 'mock-review-6',
    text: 'The place was okay. Nothing special but decent for the price. The host was helpful but took some time to respond. Bathroom could use some updates.',
    sentiment: 'neutral',
    sentimentScore: 0.55,
    category: 'amenities',
    keyPoints: ['Basic amenities', 'Average quality', 'Could improve'],
    suggestedResponse: 'Thank you for your feedback. We appreciate your suggestions and will work on improvements.',
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
  },
  {
    _id: 'mock-review-7',
    text: 'Average stay. The room was clean but small. Location was convenient. Host was somewhat helpful. Would be okay for a short stay.',
    sentiment: 'neutral',
    sentimentScore: 0.5,
    category: 'location',
    keyPoints: ['Small space', 'Convenient', 'Adequate service'],
    suggestedResponse: 'We appreciate your feedback. Thank you for staying with us!',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
  },
  {
    _id: 'mock-review-8',
    text: 'Met expectations. The communication was timely. Place was as described. Nothing exceptional but satisfactory.',
    sentiment: 'neutral',
    sentimentScore: 0.6,
    category: 'communication',
    keyPoints: ['As described', 'Timely responses', 'Satisfactory'],
    suggestedResponse: 'Thank you for your review. We are glad the property met your expectations.',
    createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 36 * 60 * 60 * 1000)
  },
  {
    _id: 'mock-review-9',
    text: 'Decent experience. The cleanliness was good. Some minor issues but overall acceptable. Host addressed concerns when raised.',
    sentiment: 'neutral',
    sentimentScore: 0.52,
    category: 'cleanliness',
    keyPoints: ['Clean', 'Minor issues', 'Responsive'],
    suggestedResponse: 'We appreciate your feedback and are glad we could address your concerns.',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000)
  },
  {
    _id: 'mock-review-10',
    text: 'Disappointing stay. The place was not as clean as expected. There were broken items and the host was slow to respond. Not worth the price.',
    sentiment: 'negative',
    sentimentScore: 0.2,
    category: 'cleanliness',
    keyPoints: ['Not clean', 'Broken items', 'Slow response'],
    suggestedResponse: 'We sincerely apologize for your disappointing experience. We take your feedback seriously and will address these issues immediately.',
    createdAt: new Date(Date.now() - 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 60 * 60 * 1000)
  },
  {
    _id: 'mock-review-11',
    text: 'Poor communication from the host. Questions were answered very slowly. Check-in was difficult. Would not recommend.',
    sentiment: 'negative',
    sentimentScore: 0.15,
    category: 'communication',
    keyPoints: ['Slow responses', 'Difficult check-in', 'Poor service'],
    suggestedResponse: 'We apologize for the communication issues. We value your feedback and are committed to improving our service.',
    createdAt: new Date(Date.now() - 3 * 3600 * 1000),
    updatedAt: new Date(Date.now() - 3 * 3600 * 1000)
  },
  {
    _id: 'mock-review-12',
    text: 'Overpriced for what you get. The amenities are outdated. The neighborhood is noisier than expected. Not a good value.',
    sentiment: 'negative',
    sentimentScore: 0.25,
    category: 'value',
    keyPoints: ['Too expensive', 'Outdated', 'Noisy area'],
    suggestedResponse: 'We appreciate your feedback. We are working on upgrades to provide better value for our guests.',
    createdAt: new Date(Date.now() - 5 * 3600 * 1000),
    updatedAt: new Date(Date.now() - 5 * 3600 * 1000)
  }
];

module.exports = {
  users: mockUsers,
  reviews: mockReviews
};
