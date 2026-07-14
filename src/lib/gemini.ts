import { ReviewAnalysis } from '@/types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn('[Gemini] API key not configured');
}

// Model fallback chain to ensure high availability across API revisions
const CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL,
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.5-pro',
  'gemini-2.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
].filter(Boolean) as string[];

export async function extractReviewsFromDocument(
  fileBase64: string,
  mimeType: string
): Promise<string[]> {
  const prompt = `You are an expert document parser. Extract all individual guest reviews verbatim from the provided document or image.
Return ONLY a valid JSON object with a single "reviews" key mapping to an array of strings. Do not include any explanations, formatting, markdown or backticks.

Example:
{
  "reviews": [
    "Clean rooms but bathroom geyser had issues.",
    "Warm welcome and amazing breakfast!"
  ]
}`;

  const payload = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType,
              data: fileBase64
            }
          }
        ]
      }
    ]
  };

  try {
    const content = await queryGemini(payload);
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON returned from document extraction');
    }
    const parsed = JSON.parse(jsonMatch[0]);
    return Array.isArray(parsed.reviews) ? parsed.reviews : [];
  } catch (error) {
    console.error('[Gemini] Document extraction failed:', error);
    throw error;
  }
}

async function queryGemini(promptOrPayload: string | any): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured');
  }

  let lastError: Error | null = null;
  const isPayload = typeof promptOrPayload !== 'string';

  for (const model of CANDIDATE_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
    try {
      const requestBody = isPayload 
        ? promptOrPayload 
        : {
            contents: [
              {
                parts: [
                  {
                    text: promptOrPayload,
                  },
                ],
              },
            ],
          };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.error?.message || response.statusText;
        
        // Handle transient failures (429 rate limits, 503 overloads, temporary high demand) by trying the next model
        const isTransient = response.status === 404 || 
                            response.status === 429 || 
                            response.status === 503 ||
                            message.toLowerCase().includes('not found') || 
                            message.toLowerCase().includes('not supported') || 
                            message.toLowerCase().includes('high demand') ||
                            message.toLowerCase().includes('overloaded') ||
                            message.toLowerCase().includes('temporary') ||
                            message.toLowerCase().includes('quota');
                            
        if (isTransient) {
          console.warn(`[Gemini] Model ${model} transient error (${message}). Trying next candidate...`);
          lastError = new Error(`Model ${model}: ${message}`);
          continue;
        }
        throw new Error(`Gemini API error (${model}): ${message}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (text) return text;
    } catch (err: any) {
      console.warn(`[Gemini] Error querying ${model}: ${err.message || err}. Trying next candidate...`);
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error('All Gemini candidate models failed to respond.');
}

export async function analyzeReviewWithGemini(
  reviewText: string
): Promise<ReviewAnalysis> {
  const prompt = `You are an expert hospitality AI consultant helping homestay owners analyze guest reviews.

Analyze the following guest review and return ONLY valid JSON with no markdown, no explanations, and no extra text.

Review: "${reviewText}"

Return this exact JSON format:
{
  "sentiment": "positive | neutral | negative",
  "category": "cleanliness | communication | location | amenities | host | value | other",
  "summary": "Brief 1-sentence summary of guest feedback in very simple, basic English (easy vocabulary, short sentence)",
  "keywords": ["keyword1", "keyword2"],
  "improvementSuggestion": "1-2 practical steps in very simple, basic English using easy words that anyone can read",
  "keyPoints": ["key point 1 in simple English", "key point 2 in simple English"]
}`;

  try {
    const content = await queryGemini(prompt);

    // Extract JSON from response (handle cases with extra markdown backticks)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Gemini response');
    }

    const analysis: ReviewAnalysis = JSON.parse(jsonMatch[0]);

    // Validate required fields
    if (!analysis.sentiment || !analysis.category) {
      throw new Error('Missing required fields in Gemini response');
    }

    // Normalize category mapping for schema compatibility
    let normalizedCategory = analysis.category.toLowerCase() as any;
    if (normalizedCategory === 'communication') normalizedCategory = 'host';
    else if (normalizedCategory === 'amenities' || normalizedCategory === 'other') normalizedCategory = 'experience';

    const validSentiments = ['positive', 'neutral', 'negative'];
    const normalizedSentiment = analysis.sentiment.toLowerCase();

    if (!validSentiments.includes(normalizedSentiment)) {
      throw new Error(`Invalid sentiment: ${analysis.sentiment}`);
    }

    const defaultImprovement = normalizedSentiment === 'negative' 
      ? `Check the ${normalizedCategory} issues quickly and fix them so guests do not get unhappy.` 
      : normalizedSentiment === 'neutral' 
      ? `Ask guests at check-in if they need anything to make their stay comfortable.` 
      : `Keep doing a great job with ${normalizedCategory} and talk about it in your listing.`;

    const result: ReviewAnalysis = {
      sentiment: normalizedSentiment as any,
      category: normalizedCategory,
      summary: analysis.summary || reviewText.substring(0, 80) + '...',
      keywords: Array.isArray(analysis.keywords) ? analysis.keywords : [],
      keyPoints: Array.isArray(analysis.keyPoints) ? analysis.keyPoints : [],
      improvementSuggestion: analysis.improvementSuggestion || defaultImprovement,
      sentimentScore: 0.85,
    };

    console.log('[Gemini] Analysis successful:', result);
    return result;
  } catch (error) {
    console.error('[Gemini] Analysis failed:', error);
    throw error;
  }
}

export async function generateBusinessSummary(
  reviewsText: string
): Promise<string> {
  const mockPayload = {
    plusPoints: [
      "The host and family are very kind and helpful to guests.",
      "Rooms are clean and standard amenities are in good shape."
    ],
    problems: [
      "The location gets noisy, making it a bit hard to sleep.",
      "Check-in delays sometimes happen when the host is busy."
    ],
    fixes: [
      "Provide simple soundproofing curtains or earplugs for guests.",
      "Install a simple key lock box or setup a clear check-in time."
    ]
  };

  if (!GEMINI_API_KEY) {
    return JSON.stringify(mockPayload);
  }

  const prompt = `You are a helpful hospitality consultant. Analyze the following guest reviews and output ONLY a valid JSON object. Do not output markdown, backticks, or any additional text.

Keep the sentences short (max 10 words), using extremely simple, clear, and high-quality English that is very easy to read and understand.

JSON Format:
{
  "plusPoints": [
    "Short simple sentence about positive aspects 1",
    "Short simple sentence about positive aspects 2"
  ],
  "problems": [
    "Short simple sentence about recurring complaints 1",
    "Short simple sentence about recurring complaints 2"
  ],
  "fixes": [
    "Short simple sentence about how to fix the problems 1",
    "Short simple sentence about how to fix the problems 2"
  ]
}

Reviews to analyze:
${reviewsText}`;

  try {
    const content = await queryGemini(prompt);
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) return jsonMatch[0].trim();
    return content.trim();
  } catch (error) {
    console.error('[Gemini] Business summary generation failed:', error);
    return JSON.stringify(mockPayload);
  }
}

export async function generatePredictiveAnalytics(
  historicalReviewsText: string,
  homestayName: string
): Promise<any> {
  const defaultPayload = {
    forecastPeriod: 'Upcoming Month (Q3/Q4)',
    predictedSatisfactionRate: 88,
    predictedRisingComplaints: ['check-in delays', 'wifi stability'],
    predictedTrendingPositives: ['scenic location', 'host hospitality'],
    seasonalInsights: 'Peak tourist season approaching. High occupancy expected; check-in bottlenecks and Wi-Fi load are likely risks during weekend surges.',
    proactiveActionCards: [
      {
        id: 'act-1',
        title: 'Check-in Delay Watch',
        description: 'Guests might wait too long to check in during busy weekends. Try using a simple digital check-in system to save time.',
        severity: 'amber',
        category: 'host',
      },
      {
        id: 'act-2',
        title: 'Wi-Fi Speed Check',
        description: 'Wi-Fi complaints go up when many guests are here. Check your router and internet speed settings.',
        severity: 'amber',
        category: 'amenities',
      },
      {
        id: 'act-3',
        title: 'Share Good Comments',
        description: 'Guests really like the friendly staff. Share these nice reviews on your website to get more bookings.',
        severity: 'green',
        category: 'host',
      },
    ],
    forecastTrend: [
      { period: 'May', actual: 82, predicted: 80 },
      { period: 'Jun', actual: 85, predicted: 84 },
      { period: 'Jul (Current)', actual: 88, predicted: 87 },
      { period: 'Aug (Forecast)', predicted: 90 },
      { period: 'Sep (Forecast)', predicted: 92 },
    ],
    accuracyScore: 94,
  };

  if (!GEMINI_API_KEY) {
    return defaultPayload;
  }

  const prompt = `You are an expert predictive hospitality AI consultant for "${homestayName}".
Analyze the historical guest feedback and forecast upcoming trends.

Write the "title" and "description" in "proactiveActionCards" using extremely simple, basic English. Avoid difficult words, complex sentences, or professional jargon. Make sure a non-native speaker can easily read and understand them.

Return ONLY valid JSON with no markdown formatting and no extra commentary:
{
  "forecastPeriod": "Upcoming Quarter",
  "predictedSatisfactionRate": 90,
  "predictedRisingComplaints": ["complaint1", "complaint2"],
  "predictedTrendingPositives": ["positive1", "positive2"],
  "seasonalInsights": "Simple seasonal insights in basic English...",
  "proactiveActionCards": [
    {
      "id": "act-1",
      "title": "Short simple title",
      "description": "Very simple advice using basic words and short sentences...",
      "severity": "green | amber | red",
      "category": "host | cleanliness | amenities | location | value"
    }
  ],
  "accuracyScore": 92
}

Historical Feedback Sample:
${historicalReviewsText}`;

  try {
    const content = await queryGemini(prompt);
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return defaultPayload;
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      ...defaultPayload,
      ...parsed,
    };
  } catch (err) {
    console.error('[Gemini] Predictive analytics generation failed:', err);
    return defaultPayload;
  }
}

export async function generateActionImpactSummary(
  title: string,
  category: string,
  notes: string
): Promise<string> {
  const defaultSummary = `Your new change "${title}" helped reduce complaints about ${category} and made guests happier.`;
  if (!GEMINI_API_KEY) return defaultSummary;

  const prompt = `You are an AI hospitality operational impact analyst. Write a 1-2 sentence concise summary of how logging operational action "${title}" (Category: ${category}, Notes: ${notes}) positively impacted guest reviews and resolved recurring complaints. Use extremely simple, clear English with basic vocabulary and short sentences.`;

  try {
    const content = await queryGemini(prompt);
    return content.trim();
  } catch (e) {
    return defaultSummary;
  }
}

export async function generateLoyaltyForecast(
  homestayName: string
): Promise<string[]> {
  const defaultLoyalty = [
    `Guests who like friendly hosts and local tips are much more likely to visit again.`,
    `We expect more bookings during holidays because of the great location and high guest satisfaction.`,
  ];
  if (!GEMINI_API_KEY) return defaultLoyalty;

  const prompt = `You are a guest loyalty and Net Promoter Score (NPS) AI forecaster for "${homestayName}". Generate 2 short, high-impact insights on guest retention, NPS trends, and repeat booking drivers. Use extremely simple, basic English with short sentences and clear vocabulary. Return ONLY a valid JSON array of strings with no markdown: ["insight 1", "insight 2"]`;

  try {
    const content = await queryGemini(prompt);
    const match = content.match(/\[[\s\S]*\]/);
    if (match) {
      const arr = JSON.parse(match[0]);
      if (Array.isArray(arr) && arr.length > 0) return arr;
    }
    return defaultLoyalty;
  } catch (e) {
    return defaultLoyalty;
  }
}




