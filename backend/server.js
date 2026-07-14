require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { users, reviews } = require('./data');

const app = express();
app.use(helmet());
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// CORS configuration (allow only the frontend origin in production)
const frontendOrigin = process.env.NODE_ENV === 'production'
  ? (process.env.FRONTEND_URL || 'https://guestpulseai.vercel.app')
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: frontendOrigin,
  credentials: true
}));
app.use(express.json());

// Rate Limiter for Auth endpoints (max 5 login attempts per 15 min)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    error: 'Too many attempts, please try again after 15 minutes',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation rules
const registerValidation = [
  body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[^a-zA-Z0-9]/).withMessage('Password must contain at least one special character'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }
    next();
  }
];

const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }
    next();
  }
];


// Passport.js configuration
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

app.use(passport.initialize());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'mock-google-id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock-google-secret',
    callbackURL: "/api/auth/google/callback",
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, profile, done) {
    const email = profile.emails?.[0]?.value?.toLowerCase();
    if (!email) {
      return done(new Error("No email found in Google account"));
    }
    const flow = req.query.state || 'login';
    let user = users.find(u => u.email.toLowerCase() === email);

    if (flow === 'register') {
      if (user) {
        req.oauth_message = 'already_registered';
      } else {
        user = {
          _id: 'mock-user-' + Date.now(),
          name: profile.displayName || 'Google User',
          email: email,
          createdAt: new Date()
        };
        users.push(user);
      }
      return done(null, user);
    } else {
      if (user) {
        return done(null, user);
      } else {
        req.oauth_error = 'register_required';
        return done(null, false, { message: 'register_required' });
      }
    }
  }
));

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || 'mock-github-id',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || 'mock-github-secret',
    callbackURL: "/api/auth/github/callback",
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, profile, done) {
    const email = profile.emails?.[0]?.value?.toLowerCase() || `${profile.username}@github.com`;
    const flow = req.query.state || 'login';
    let user = users.find(u => u.email.toLowerCase() === email);

    if (flow === 'register') {
      if (user) {
        req.oauth_message = 'already_registered';
      } else {
        user = {
          _id: 'mock-user-' + Date.now(),
          name: profile.displayName || profile.username || 'GitHub User',
          email: email,
          createdAt: new Date()
        };
        users.push(user);
      }
      return done(null, user);
    } else {
      if (user) {
        return done(null, user);
      } else {
        req.oauth_error = 'register_required';
        return done(null, false, { message: 'register_required' });
      }
    }
  }
));

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token is required',
      code: 'AUTH_MISSING'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        code: 'AUTH_INVALID'
      });
    }
    req.user = user;
    next();
  });
};

// Help helper for Gemini API / Mock fallback
async function analyzeReview(reviewText) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    console.log('[Gemini] Analyzing with real Gemini API key');
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    
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
      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          return {
            sentiment: (analysis.sentiment || 'positive').toLowerCase(),
            category: (analysis.category || 'other').toLowerCase(),
            response: analysis.response || 'Thank you for your feedback.',
            keyPoints: Array.isArray(analysis.keyPoints) ? analysis.keyPoints : [],
            sentimentScore: 0.85
          };
        }
      }
    } catch (err) {
      console.error('[Gemini] Real analysis failed, falling back to mock:', err.message);
    }
  }

  // Fallback Mock Analysis
  console.log('[Mock Store] Analyzing review using mock fallback rules');
  const lowerReview = reviewText.toLowerCase();
  let sentiment = 'positive';
  let category = 'other';
  let keyPoints = ['Decent stay'];
  let response = 'Thank you for your feedback! We are glad you enjoyed your stay.';

  if (lowerReview.includes('dirty') || lowerReview.includes('cleanliness') || lowerReview.includes('spotless') || lowerReview.includes('clean')) {
    category = 'cleanliness';
    keyPoints = ['Spotless rooms', 'Clean stay'];
  } else if (lowerReview.includes('location') || lowerReview.includes('close') || lowerReview.includes('convenient')) {
    category = 'location';
    keyPoints = ['Great location', 'Close to attractions'];
  } else if (lowerReview.includes('host') || lowerReview.includes('responsive') || lowerReview.includes('communication') || lowerReview.includes('helpful')) {
    category = 'communication';
    keyPoints = ['Responsive host', 'Excellent communication'];
  } else if (lowerReview.includes('value') || lowerReview.includes('price') || lowerReview.includes('money')) {
    category = 'value';
    keyPoints = ['Good value for money'];
  } else if (lowerReview.includes('amenities') || lowerReview.includes('bed') || lowerReview.includes('wifi')) {
    category = 'amenities';
    keyPoints = ['Great amenities'];
  }

  if (lowerReview.includes('bad') || lowerReview.includes('poor') || lowerReview.includes('disappointing') || lowerReview.includes('terrible') || lowerReview.includes('rude') || lowerReview.includes('noisy')) {
    sentiment = 'negative';
    response = 'We sincerely apologize for the issues you encountered during your stay. We are looking into this immediately to improve.';
  } else if (lowerReview.includes('okay') || lowerReview.includes('average') || lowerReview.includes('decent') || lowerReview.includes('nothing special')) {
    sentiment = 'neutral';
    response = 'Thank you for your feedback. We appreciate your suggestions and will use them to improve our services.';
  }

  return {
    sentiment,
    category,
    response,
    keyPoints,
    sentimentScore: sentiment === 'positive' ? 0.85 : sentiment === 'neutral' ? 0.55 : 0.2
  };
}

// -------------------------------------------------------------
// Authentication Endpoints
// -------------------------------------------------------------

app.post('/api/auth/register', authLimiter, registerValidation, (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(409).json({ 
      success: false, 
      error: 'An account with this email already exists. Please continue with Login.',
      code: 'EMAIL_ALREADY_EXISTS' 
    });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  const newUser = {
    _id: 'mock-user-' + Date.now(),
    name,
    email: email.toLowerCase(),
    passwordHash,
    createdAt: new Date()
  };

  users.push(newUser);

  const token = jwt.sign({ userId: newUser._id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

  res.status(201).json({
    success: true,
    token,
    user: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email
    },
    message: 'User registered successfully'
  });
});

app.post('/api/auth/login', authLimiter, loginValidation, (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(404).json({ 
      success: false, 
      error: 'Account not found. Please register first.',
      code: 'ACCOUNT_NOT_FOUND' 
    });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.passwordHash);
  if (!isPasswordValid) {
    return res.status(401).json({ success: false, error: 'Invalid email or password.' });
  }

  const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

  res.status(200).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    },
    message: 'Login successful'
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

// Google OAuth endpoints
app.get('/api/auth/google', (req, res, next) => {
  const flow = req.query.flow || 'login';
  passport.authenticate('google', { 
    scope: ['profile', 'email'], 
    state: flow,
    session: false 
  })(req, res, next);
});

app.get('/api/auth/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    const clientUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    if (req.oauth_error === 'register_required') {
      res.cookie('oauth_error', 'register_required', { maxAge: 60000, path: '/' });
      return res.redirect(`${clientUrl}/auth/login`);
    }

    if (err || !user) {
      return res.redirect(`${clientUrl}/auth/login?error=AccessDenied`);
    }

    if (req.oauth_message === 'already_registered') {
      res.cookie('oauth_message', 'already_registered', { maxAge: 60000, path: '/' });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`${clientUrl}/auth/login?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: user._id,
      name: user.name,
      email: user.email
    }))}`);
  })(req, res, next);
});

// GitHub OAuth endpoints
app.get('/api/auth/github', (req, res, next) => {
  const flow = req.query.flow || 'login';
  passport.authenticate('github', { 
    scope: ['user:email'], 
    state: flow,
    session: false 
  })(req, res, next);
});

app.get('/api/auth/github/callback', (req, res, next) => {
  passport.authenticate('github', { session: false }, (err, user, info) => {
    const clientUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    if (req.oauth_error === 'register_required') {
      res.cookie('oauth_error', 'register_required', { maxAge: 60000, path: '/' });
      return res.redirect(`${clientUrl}/auth/login`);
    }

    if (err || !user) {
      return res.redirect(`${clientUrl}/auth/login?error=AccessDenied`);
    }

    if (req.oauth_message === 'already_registered') {
      res.cookie('oauth_message', 'already_registered', { maxAge: 60000, path: '/' });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`${clientUrl}/auth/login?token=${token}&user=${encodeURIComponent(JSON.stringify({
      id: user._id,
      name: user.name,
      email: user.email
    }))}`);
  })(req, res, next);
});

// -------------------------------------------------------------
// Reviews CRUD & Search Endpoints
// -------------------------------------------------------------

// Search reviews by query text (must be defined BEFORE /api/reviews/:id to prevent matching ':id' route)
app.get('/api/reviews/search', (req, res) => {
  const q = req.query.q || '';
  const searchStr = q.toLowerCase();

  const filtered = reviews.filter(r => 
    r.text.toLowerCase().includes(searchStr) || 
    r.keyPoints.some(kp => kp.toLowerCase().includes(searchStr))
  );

  res.status(200).json({
    success: true,
    data: filtered
  });
});

// Get reviews (with sentiment/category filters and limit/skip pagination)
app.get('/api/reviews', (req, res) => {
  let list = [...reviews];
  const sentiment = req.query.sentiment;
  const category = req.query.category;
  
  if (sentiment) {
    list = list.filter(r => r.sentiment.toLowerCase() === sentiment.toLowerCase());
  }

  if (category) {
    list = list.filter(r => r.category.toLowerCase() === category.toLowerCase());
  }

  const skip = parseInt(req.query.skip || '0');
  const limit = parseInt(req.query.limit || '10');

  const total = list.length;
  const paginated = list.slice(skip, skip + limit);

  res.status(200).json({
    success: true,
    data: paginated,
    pagination: {
      skip,
      limit,
      total,
      hasMore: skip + limit < total
    }
  });
});

// Get single review
app.get('/api/reviews/:id', (req, res) => {
  const review = reviews.find(r => r._id === req.params.id);
  if (!review) {
    return res.status(404).json({ success: false, error: 'Review not found' });
  }

  res.status(200).json({
    success: true,
    data: review
  });
});

// Analyze review (for frontend compatibility)
app.post('/api/analyze', async (req, res) => {
  const reviewText = req.body.review || req.body.reviewText;

  if (!reviewText || typeof reviewText !== 'string' || reviewText.trim().length < 10) {
    return res.status(400).json({
      success: false,
      error: 'Review text must be at least 10 characters long',
      code: 'TEXT_TOO_SHORT',
      field: 'review'
    });
  }

  try {
    const analysis = await analyzeReview(reviewText);

    const newReview = {
      _id: 'mock-review-' + Date.now(),
      text: reviewText,
      sentiment: analysis.sentiment,
      sentimentScore: analysis.sentimentScore,
      category: analysis.category,
      keyPoints: analysis.keyPoints,
      suggestedResponse: analysis.response,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save to in-memory store
    reviews.unshift(newReview);

    // Frontend ResultCard expects an AnalysisResult object directly, which matches Next.js response structure
    res.status(200).json({
      _id: newReview._id,
      sentiment: newReview.sentiment,
      sentimentScore: newReview.sentimentScore,
      category: newReview.category,
      keyPoints: newReview.keyPoints,
      suggestedResponse: newReview.suggestedResponse,
      createdAt: newReview.createdAt,
      analysis: analysis // attach detailed analysis for compatibility
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create review (standard REST POST)
app.post('/api/reviews', async (req, res) => {
  const reviewText = req.body.text || req.body.review || req.body.reviewText;

  if (!reviewText || typeof reviewText !== 'string' || reviewText.trim().length < 10) {
    return res.status(400).json({ success: false, error: 'Review text must be at least 10 characters long' });
  }

  try {
    const analysis = await analyzeReview(reviewText);

    const newReview = {
      _id: 'mock-review-' + Date.now(),
      text: reviewText,
      sentiment: analysis.sentiment,
      sentimentScore: analysis.sentimentScore,
      category: analysis.category,
      keyPoints: analysis.keyPoints,
      suggestedResponse: analysis.response,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    reviews.unshift(newReview);

    res.status(201).json({
      success: true,
      data: newReview
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update review
app.put('/api/reviews/:id', (req, res) => {
  const index = reviews.findIndex(r => r._id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Review not found' });
  }

  const current = reviews[index];
  const updated = {
    ...current,
    text: req.body.text || current.text,
    sentiment: req.body.sentiment || current.sentiment,
    sentimentScore: req.body.sentimentScore !== undefined ? req.body.sentimentScore : current.sentimentScore,
    category: req.body.category || current.category,
    keyPoints: req.body.keyPoints || current.keyPoints,
    suggestedResponse: req.body.suggestedResponse || current.suggestedResponse,
    updatedAt: new Date()
  };

  reviews[index] = updated;

  res.status(200).json({
    success: true,
    data: updated
  });
});

// Delete review
app.delete('/api/reviews/:id', (req, res) => {
  const index = reviews.findIndex(r => r._id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Review not found' });
  }

  reviews.splice(index, 1);
  res.status(204).end(); // No content
});

// -------------------------------------------------------------
// Dashboard Statistics Endpoint
// -------------------------------------------------------------

app.get('/api/dashboard', (req, res) => {
  const totalReviews = reviews.length;

  if (totalReviews === 0) {
    return res.status(200).json({
      success: true,
      data: {
        totalReviews: 0,
        positiveReviews: 0,
        neutralReviews: 0,
        negativeReviews: 0,
        averageSentimentScore: 0,
        mostCommonCategory: 'other',
        categoryBreakdown: [],
        sentimentTrend: []
      }
    });
  }

  const positiveReviews = reviews.filter(r => r.sentiment === 'positive').length;
  const neutralReviews = reviews.filter(r => r.sentiment === 'neutral').length;
  const negativeReviews = reviews.filter(r => r.sentiment === 'negative').length;
  
  // Calculate average score
  let totalScore = 0;
  reviews.forEach(r => {
    totalScore += (r.sentimentScore || 0.75);
  });
  const averageSentimentScore = totalReviews > 0 ? Number((totalScore / totalReviews).toFixed(2)) : 0;

  // Category breakdown
  const categoryCounts = {};
  reviews.forEach(r => {
    const cat = r.category || 'other';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const categoryBreakdown = Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const mostCommonCategory = categoryBreakdown[0]?.category || 'other';

  // Sentiment Trend (last 7 days)
  const trendMap = {};
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    trendMap[dateString] = {
      date: dateString,
      positive: 0,
      neutral: 0,
      negative: 0
    };
  }

  reviews.forEach(r => {
    let dateStr;
    try {
      dateStr = new Date(r.createdAt).toISOString().split('T')[0];
    } catch (e) {
      dateStr = new Date().toISOString().split('T')[0];
    }
    if (trendMap[dateStr]) {
      const sent = r.sentiment.toLowerCase();
      if (sent === 'positive') trendMap[dateStr].positive++;
      else if (sent === 'neutral') trendMap[dateStr].neutral++;
      else if (sent === 'negative') trendMap[dateStr].negative++;
    }
  });

  const sentimentTrend = Object.values(trendMap);

  res.status(200).json({
    success: true,
    data: {
      totalReviews,
      positiveReviews,
      neutralReviews,
      negativeReviews,
      averageSentimentScore,
      mostCommonCategory,
      categoryBreakdown,
      sentimentTrend
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Error Middleware]:', err.stack);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    code: 'SERVER_ERROR',
    timestamp: new Date()
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`[Express Backend] Server running on port ${PORT}`);
});
