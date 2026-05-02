# Vehicle Maintenance Scheduler

This service chooses the best set of maintenance tasks within the available mechanic hours.
It uses the evaluation depots and vehicles APIs, then applies a simple knapsack approach.

## Setup

1) Copy .env.example to .env and add your token.
2) Install dependencies: npm install
3) Start the server: npm start

## Endpoint

POST /schedule

Request body:
{
  "depotId": 1
}

Response:
{
  "depotId": 1,
  "mechanicHours": 60,
  "totalImpact": 42,
  "totalDuration": 59,
  "selectedTasks": [
    { "id": "...", "duration": 5, "impact": 8 }
  ]
}
