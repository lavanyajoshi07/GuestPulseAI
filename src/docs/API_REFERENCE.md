# ReviewLens AI - API Reference

Complete API documentation for all endpoints.

## Base URL

```
http://localhost:3000/api
```

---

## POST /analyze

Analyze a guest review using AI and save the analysis to the database.

### Request

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "review": "Amazing stay! The room was clean and the host was very helpful."
  }'
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `review` | string | Yes | The review text (10-2000 characters) |

### Response (Success - 200)

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "sentiment": "positive",
    "sentimentScore": 0.85,
    "category": "host",
    "keyPoints": [
      "Clean room",
      "Helpful host"
    ],
    "suggestedResponse": "Thank you for the wonderful review! We appreciate your kind words...",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Response (Error - 400)

```json
{
  "success": false,
  "error": "Review text must be at least 10 characters long",
  "code": "TEXT_TOO_SHORT",
  "field": "review",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Possible Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `TEXT_TOO_SHORT` | 400 | Review text is too short |
| `TEXT_TOO_LONG` | 400 | Review text is too long |
| `AI_ERROR` | 503 | AI analysis failed |
| `DATABASE_ERROR` | 500 | Database operation failed |

---

## GET /reviews

Fetch all reviews with optional filtering and pagination.

### Request

```bash
# Get all reviews
curl http://localhost:3000/api/reviews

# With pagination
curl http://localhost:3000/api/reviews?skip=0&limit=10

# Filter by sentiment
curl http://localhost:3000/api/reviews?sentiment=positive

# Filter by category
curl http://localhost:3000/api/reviews?category=host

# Combined filters
curl http://localhost:3000/api/reviews?sentiment=positive&category=cleanliness&skip=0&limit=10
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `skip` | integer | 0 | Number of reviews to skip (pagination) |
| `limit` | integer | 10 | Number of reviews to return (max 100) |
| `sentiment` | string | - | Filter by sentiment (positive/neutral/negative) |
| `category` | string | - | Filter by category (cleanliness/communication/location/amenities/host/value/other) |

### Response (Success - 200)

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "text": "Amazing stay! The room was clean and the host was very helpful.",
      "sentiment": "positive",
      "sentimentScore": 0.85,
      "category": "host",
      "keyPoints": ["Clean room", "Helpful host"],
      "suggestedResponse": "Thank you for the wonderful review!...",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "skip": 0,
    "limit": 10,
    "total": 42,
    "hasMore": true
  }
}
```

### Response (Error - 400)

```json
{
  "success": false,
  "error": "Limit must be between 1 and 100",
  "code": "INVALID_LIMIT",
  "field": "limit",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Possible Errors

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_SKIP` | 400 | Skip value is invalid |
| `INVALID_LIMIT` | 400 | Limit value is invalid |
| `INVALID_SENTIMENT` | 400 | Sentiment value is invalid |
| `INVALID_CATEGORY` | 400 | Category value is invalid |
| `DATABASE_ERROR` | 500 | Database query failed |

---

## GET /dashboard

Fetch dashboard statistics and analytics data.

### Request

```bash
curl http://localhost:3000/api/dashboard
```

### Response (Success - 200)

```json
{
  "success": true,
  "data": {
    "totalReviews": 42,
    "positiveReviews": 28,
    "neutralReviews": 10,
    "negativeReviews": 4,
    "averageSentimentScore": 0.78,
    "mostCommonCategory": "host",
    "categoryBreakdown": [
      {
        "category": "host",
        "count": 15
      },
      {
        "category": "cleanliness",
        "count": 12
      },
      {
        "category": "amenities",
        "count": 8
      }
    ],
    "sentimentTrend": [
      {
        "date": "2024-01-10",
        "positive": 4,
        "neutral": 1,
        "negative": 0
      },
      {
        "date": "2024-01-11",
        "positive": 5,
        "neutral": 2,
        "negative": 1
      }
    ]
  }
}
```

### Response (Error - 500)

```json
{
  "success": false,
  "error": "Failed to fetch dashboard statistics",
  "code": "DATABASE_ERROR",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Error Handling

All endpoints return standard error responses with the following structure:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "field": "field_name (optional)",
  "timestamp": "ISO timestamp"
}
```

### HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | Request successful |
| 400 | Validation error (bad input) |
| 429 | Rate limit exceeded |
| 500 | Server error |
| 503 | Service temporarily unavailable |

---

## Data Types

### Sentiment

Valid values: `positive`, `neutral`, `negative`

### Category

Valid values: `cleanliness`, `communication`, `location`, `amenities`, `host`, `value`, `other`

### Review Object

```json
{
  "_id": "string (MongoDB ObjectId)",
  "text": "string (10-2000 chars)",
  "sentiment": "string (positive|neutral|negative)",
  "sentimentScore": "number (0-1)",
  "category": "string",
  "keyPoints": ["string array"],
  "suggestedResponse": "string",
  "createdAt": "ISO datetime",
  "updatedAt": "ISO datetime (optional)"
}
```

---

## Rate Limiting

Current implementation: None (plan for future)

---

## Pagination

Use `skip` and `limit` parameters for pagination:

- `skip`: Number of items to skip (default: 0)
- `limit`: Number of items to return (default: 10, max: 100)

Example for page 2 with 10 items per page:
```
GET /reviews?skip=10&limit=10
```

---

## Examples

### Complete Workflow

1. **Analyze a review**
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"review": "Wonderful stay with excellent service!"}'
```

2. **Fetch positive reviews**
```bash
curl "http://localhost:3000/api/reviews?sentiment=positive"
```

3. **Get dashboard stats**
```bash
curl http://localhost:3000/api/dashboard
```

---

## Testing

For manual testing, see `DAY3_TESTING.md`.
