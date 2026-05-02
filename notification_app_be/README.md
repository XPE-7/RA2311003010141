# Notification Backend

This service exposes a priority inbox endpoint that returns the top notifications.
Priority is based on type weight (placement > result > event) and recency.

## Setup

1) Copy .env.example to .env and add your token.
2) Install dependencies: npm install
3) Start the server: npm start

## Endpoint

GET /notifications/priority?limit=10

Response:
{
  "count": 10,
  "items": [
    {
      "id": "...",
      "type": "Placement",
      "message": "...",
      "timestamp": "2026-04-22 17:51:18",
      "score": 3000000000000
    }
  ]
}
