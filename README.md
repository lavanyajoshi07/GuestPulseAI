# ReviewLens AI - Homestay Review Analysis Platform

An AI-powered review analysis tool for homestay and eco-tourism businesses. Analyze guest reviews in seconds to detect sentiment, categorize feedback, and generate professional responses.

## 📋 Project Overview

ReviewLens AI helps homestay owners:
- **Analyze reviews** from multiple platforms (Google, Booking.com, Airbnb, social media)
- **Detect sentiment** (Positive, Neutral, Negative)
- **Categorize feedback** (Food, Cleanliness, Location, Host, Value, Experience)
- **Generate professional responses** using AI
- **View historical insights** and trends

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 + React 19 + TypeScript
- **Backend:** Next.js API Routes
- **Database:** MongoDB Atlas with Mongoose
- **AI:** Google Gemini API
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Deployment:** Vercel

## 📁 Project Structure

```
reviewlens-ai/
├── app/
│   ├── layout.tsx                 # Root layout with Navbar
│   ├── page.tsx                   # Home page
│   ├── analyzer/page.tsx          # Review analyzer page
│   ├── history/page.tsx           # Review history page
│   ├── dashboard/page.tsx         # Statistics dashboard
│   └── api/
│       ├── analyze/route.ts       # Analyze review endpoint
│       ├── reviews/route.ts       # Get all reviews endpoint
│       └── dashboard/route.ts     # Get stats endpoint
├── components/
│   ├── Navbar.tsx                 # Navigation component
│   ├── ReviewForm.tsx             # Review input form (Day 2)
│   ├── ResultCard.tsx             # Analysis result display (Day 2)
│   ├── DashboardCards.tsx         # Stats cards (Day 5)
│   ├── DashboardChart.tsx         # Charts (Day 5)
│   └── ReviewTable.tsx            # History table (Day 6)
├── lib/
│   ├── mongodb.ts                 # MongoDB connection
│   └── gemini.ts                  # Gemini AI integration
├── models/
│   └── Review.ts                  # Mongoose Review schema
├── types/
│   └── index.ts                   # TypeScript type definitions
└── .env.local                      # Environment variables
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account
- Google Gemini API key

### Step 1: Clone & Install

```bash
# Install dependencies
pnpm install
```

### Step 2: Configure Environment Variables

Create `.env.local` in the project root:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/reviewlens

# Google Gemini API
GEMINI_API_KEY=your-gemini-api-key-here

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Get MongoDB Connection String

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (Free tier is fine)
3. Go to Database → Connect
4. Choose "Drivers"
5. Copy the connection string
6. Replace username and password in the string
7. Add `/reviewlens` at the end (database name)

### Step 4: Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com)
2. Click "Get API Key"
3. Create a new API key for this project
4. Copy and paste into `.env.local`

### Step 5: Run Development Server

```bash
pnpm dev
```

The frontend app will be available at `http://localhost:3000`.

### Step 6: Run the Backend Server (New)

The backend runs on Express.js at port 5000. It handles all reviews, analysis, and dashboard statistics APIs.

```bash
# Navigate to the backend directory
cd backend

# Install dependencies (if not already done)
npm install

# Start the backend server in development mode
npm run dev

# Or run with Node directly
node server.js
```

The backend server will run on `http://localhost:5000`. Next.js proxy rewrites are already configured in [next.config.mjs](file:///c:/projects/GuestPulseAI/next.config.mjs) to forward all `/api` traffic seamlessly.

## ✅ Day 1 Verification Checklist

- [ ] Project installed successfully
- [ ] Environment variables configured
- [ ] MongoDB connection verified in console
- [ ] Home page loads at http://localhost:3000
- [ ] Navbar navigation works
- [ ] All page routes accessible (Analyzer, History, Dashboard)
- [ ] No console errors

## 📝 Database Schema

### Reviews Collection

```typescript
{
  _id: ObjectId,
  reviewText: String,           // Guest review text
  sentiment: String,            // "Positive" | "Neutral" | "Negative"
  category: String,             // "Food" | "Cleanliness" | "Location" | "Host" | "Value" | "Experience"
  aiResponse: String,           // AI-generated management response
  createdAt: Date,              // Creation timestamp
  updatedAt: Date               // Last update timestamp
}
```

## 🔗 API Endpoints (Coming in Days 3-4)

### POST /api/analyze
Analyze a single review

**Request:**
```json
{
  "reviewText": "Amazing stay with wonderful hosts!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sentiment": "Positive",
    "category": "Host",
    "response": "Thank you so much for your kind words..."
  }
}
```

### GET /api/reviews
Fetch all analyzed reviews

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "reviewText": "...",
      "sentiment": "Positive",
      "category": "Food",
      "aiResponse": "...",
      "createdAt": "2026-06-15T10:30:00Z"
    }
  ]
}
```

### GET /api/dashboard
Fetch dashboard statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "totalReviews": 50,
    "positive": 35,
    "neutral": 10,
    "negative": 5,
    "sentimentBreakdown": {...},
    "categoryBreakdown": {...}
  }
}
```

## 📅 Development Timeline

- **Day 1** ✅ Setup & Configuration
- **Day 2** - Build UI Components
- **Day 3** - Create API Endpoints
- **Day 4** - Integrate Gemini AI
- **Day 5** - Build Dashboard
- **Day 6** - Build History & Search
- **Day 7** - Deploy & Documentation

## 🧪 Testing

### Manual Testing Checklist

1. **HomePage Load**
   - Visit `http://localhost:3000`
   - Check all sections load
   - Click "Start Analyzing" button

2. **Navigation**
   - Click all navbar links
   - Verify page routes work
   - Check active route highlighting

3. **Console Check**
   - Open browser DevTools
   - Check for any errors
   - Verify no TypeScript issues

4. **Database Connection** (when APIs are ready)
   - Check server console for "[MongoDB] Connected successfully"
   - No connection errors

## 📚 Gemini Prompt Format

The system uses this prompt for analysis:

```
You are a hospitality review analyzer.

Analyze the guest review and return ONLY valid JSON with no markdown, no explanations, and no extra text.

Return this exact JSON format:
{
  "sentiment": "Positive | Neutral | Negative",
  "category": "Food | Cleanliness | Location | Host | Value | Experience",
  "response": "Professional response suggestion"
}
```

## 🎨 UI Design Principles

- **Clean & Modern:** Minimal design with focus on functionality
- **Mobile Responsive:** Works seamlessly on all devices
- **Easy to Understand:** Beginner-friendly interface
- **Accessible:** Proper semantic HTML and ARIA labels
- **Fast:** Optimized for performance

## 📦 Deployment

### Deploy to Vercel

```bash
# Push to GitHub
git add .
git commit -m "ReviewLens AI v1.0"
git push origin main

# Connect to Vercel
# 1. Go to vercel.com
# 2. Import project from GitHub
# 3. Add environment variables
# 4. Deploy
```

## 🔐 Environment Security

**Never commit `.env.local` to Git!**

- Add to `.gitignore` (already done)
- Use Vercel's environment variables UI
- Rotate API keys regularly
- Keep MongoDB credentials secure

## 📞 Support

For issues or questions:
1. Check console errors
2. Verify environment variables
3. Check MongoDB connection string
4. Verify Gemini API key is valid

## 🔐 Week 6 Authentication & Security Module

The platform uses a unified, production-ready authentication and security module across both the Next.js target and the custom Express backend target.

### 1. Authentication Flow
- **Registration:** 
  - Validates user input (Name, Email, Password length $\ge 8$, strong password complexity, trims whitespace).
  - Returns `409 Conflict` if the account already exists. Showcases `AlreadyRegisteredDialog` with a "Go to Login" action.
  - Hashing is performed using `bcrypt` (10-12 salt rounds).
- **Login:**
  - Validates login credentials.
  - Returns `404 Not Found` if the email is unregistered, showing a `RegisterFirstDialog` with a "Create Account" action.
  - Returns `401 Unauthorized` on incorrect passwords without revealing password accuracy on non-existent accounts.
- **Logout:** Clears client tokens/cookies and executes a POST request to `/api/auth/logout` to clear secure server-side HttpOnly cookies before redirecting to `/login`.

### 2. JWT Protection
- Reusable JWT validation middleware (`withAuth` wrapper in Next.js, `authenticateToken` in Express) secures all analytical REST endpoints.
- Requires valid headers (`Authorization: Bearer <token>`) or fallback HttpOnly secure cookies (`auth_token`).
- Returns HTTP `401 Unauthorized` for both missing and invalid tokens.

### 3. Google OAuth Flow
- Users can click **Continue with Google** on both login and registration forms.
- **Register Flow:** If the Google account is already registered, logs them in seamlessly and displays a green-pulsing glassmorphic toast `"Welcome back! You are already registered."`. If new, creates the user and redirects them to the dashboard.
- **Login Flow:** If the Google account is registered, logs them in. If not registered, blocks authorization, redirects them back, and displays `"No account exists with this Google account. Please register first."`.

### 4. Rate Limiting & Input Validation
- Endpoints `POST /api/auth/login` and `POST /api/auth/register` are protected with a rate limit of **5 attempts per 15 minutes**. Returns `429 Too Many Requests` when exceeded.
- Server-side validations are performed using **Zod** (Next.js serverless routes) and **express-validator** (Express).

### 5. Security & Middlewares
- **CORS:** Restricts connections to authorized origins (e.g., matching the frontend host in production, localhost in development).
- **Helmet:** Express endpoints are protected with standard security headers (installed and configured via `helmet` package).
- **Secure Cookies:** JWTs are stored in secure, HttpOnly, sameSite cookies.

### 6. Environment Variables
Ensure the following variables are present in your `.env.local` file:
```env
# NextAuth & JWT Secrets
JWT_SECRET=your-32-byte-base64-secret
AUTH_SECRET=your-32-byte-base64-secret

# Google OAuth Credentials
AUTH_GOOGLE_ID=google-client-id.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=google-client-secret
```

### 7. Run Locally
1. Start Next.js development server:
   ```bash
   pnpm dev
   ```
2. Start Express backend:
   ```bash
   cd backend
   npm run dev
   ```

---

## 📜 License

This is an educational internship project. Built for learning purposes.

