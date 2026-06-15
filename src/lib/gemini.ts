import { ReviewAnalysis } from '@/types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

if (!GEMINI_API_KEY) {
  console.warn('[Gemini] API key not configured');
}

export async function analyzeReviewWithGemini(
  reviewText: string
): Promise<ReviewAnalysis> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured');
  }

  const prompt = `You are a hospitality review analyzer.

Analyze the following guest review and return ONLY valid JSON with no markdown, no explanations, and no extra text.

Review: "${reviewText}"

Return this exact JSON format:
{
  "sentiment": "positive | neutral | negative",
  "category": "cleanliness | communication | location | amenities | host | value | other",
  "response": "Professional response suggestion",
  "keyPoints": ["key point 1", "key point 2"]
}`;

  try {
    const response = await fetch(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Gemini API error: ${error.error?.message || 'Unknown error'}`
      );
    }

    const data = await response.json();
    const content =
      data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract JSON from response (handle cases with extra text)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Gemini response');
    }

    const analysis: ReviewAnalysis = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (
      !analysis.sentiment ||
      !analysis.category ||
      !analysis.response
    ) {
      throw new Error('Missing required fields in Gemini response');
    }

    // Validate enum values and normalize to lowercase
    const validSentiments = ['positive', 'neutral', 'negative'];
    const validCategories = [
      'cleanliness',
      'communication',
      'location',
      'amenities',
      'host',
      'value',
      'other',
    ];

    const normalizedSentiment = analysis.sentiment.toLowerCase();
    const normalizedCategory = analysis.category.toLowerCase();

    if (!validSentiments.includes(normalizedSentiment)) {
      throw new Error(`Invalid sentiment: ${analysis.sentiment}`);
    }

    if (!validCategories.includes(normalizedCategory)) {
      throw new Error(`Invalid category: ${analysis.category}`);
    }

    const result: ReviewAnalysis = {
      sentiment: normalizedSentiment as any,
      category: normalizedCategory as any,
      response: analysis.response,
      keyPoints: Array.isArray(analysis.keyPoints) ? analysis.keyPoints : [],
      sentimentScore: 0.75, // Default confidence score
    };

    console.log('[Gemini] Analysis successful:', result);
    return result;
  } catch (error) {
    console.error('[Gemini] Analysis failed:', error);
    throw error;
  }
}
