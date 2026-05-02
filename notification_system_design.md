# Notification System Design

Stage 1

Goal: show notifications to a logged-in student, with clear actions and simple JSON.

Core actions
- list notifications for a student
- mark one notification as read
- mark all as read
- delete a notification
- create a notification (system use)

Base headers
- Authorization: Bearer <token>
- Content-Type: application/json

Endpoints

1) List notifications
GET /api/notifications?studentId=1042&status=unread&limit=20&cursor=2026-04-22T17:50:30Z

Response
{
  "items": [
    {
      "id": "n-123",
      "studentId": 1042,
      "type": "Placement",
      "message": "CSX Corporation hiring",
      "isRead": false,
      "createdAt": "2026-04-22T17:51:18Z"
    }
  ],
  "nextCursor": "2026-04-22T17:50:30Z"
}

2) Mark one as read
PATCH /api/notifications/n-123/read

Response
{ "id": "n-123", "isRead": true }

3) Mark all as read
PATCH /api/notifications/read-all

Request
{ "studentId": 1042 }

Response
{ "updated": 42 }

4) Delete one
DELETE /api/notifications/n-123

Response
{ "deleted": true }

5) Create notification (internal)
POST /api/notifications

Request
{
  "studentId": 1042,
  "type": "Placement",
  "message": "CSX Corporation hiring"
}

Response
{ "id": "n-123" }

Real-time updates
- Use WebSocket or Server-Sent Events: /api/notifications/stream?studentId=1042
- Server pushes new notifications as they arrive.

Stage 2

Suggested storage: relational DB (PostgreSQL) for strong filters, ordering, and indexing.

Table schema (simplified)

notifications
- id (uuid, pk)
- student_id (int)
- type (text)
- message (text)
- is_read (boolean)
- created_at (timestamp)

Indexes
- idx_notifications_student_read_created (student_id, is_read, created_at desc)
- idx_notifications_type_created (type, created_at desc)

SQL examples

List unread notifications
SELECT id, student_id, type, message, is_read, created_at
FROM notifications
WHERE student_id = 1042 AND is_read = false
ORDER BY created_at DESC
LIMIT 20;

Mark one as read
UPDATE notifications
SET is_read = true
WHERE id = 'n-123' AND student_id = 1042;

Stage 3

Given query
SELECT *
FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt DESC;

Why it is slow
- Without the right index, it scans many rows and then sorts.
- Using SELECT * pulls more columns than needed.

Fix
- Add a composite index on (student_id, is_read, created_at desc).
- Select only needed columns.

Index suggestion
CREATE INDEX idx_notifications_student_read_created
ON notifications (student_id, is_read, created_at DESC);

About adding indexes on every column
- It increases write cost and storage.
- It can slow down inserts and updates.
- It is not needed if the query patterns are known.

Query to find students with placement notifications in last 7 days
SELECT DISTINCT student_id
FROM notifications
WHERE type = 'Placement'
  AND created_at >= NOW() - INTERVAL '7 days';

Stage 4

Problem: notifications are fetched on every page load, causing DB load.

Options
1) Cache per student (Redis)
- Good: fast reads, less DB load
- Tradeoff: cache invalidation when new notifications arrive

2) Use pagination + delta sync
- Good: only fetch new notifications after last seen timestamp
- Tradeoff: client logic is a bit more complex

3) Push updates (WebSocket/SSE)
- Good: no polling, real-time
- Tradeoff: needs connection management and scaling

4) Read replicas
- Good: offload read traffic
- Tradeoff: eventual consistency and extra infra cost

Stage 5

Issues with the given notify_all pseudocode
- It is slow (sequential loop).
- No retries or error handling.
- No idempotency, so duplicates are possible.
- Email and DB save are not linked, so partial failures happen.

Better design
- Store notification in DB first (or use outbox).
- Push a job to a queue for email sending.
- Use idempotency keys per student.
- Process emails in batches with retries and backoff.

Improved flow (simple)
1) Insert notifications for all students in bulk.
2) Insert email jobs into a queue.
3) Worker sends emails in parallel with retries.
4) Failed emails are retried; permanent failures are marked.

Stage 6

Priority inbox approach
- Assign a weight: placement = 3, result = 2, event = 1.
- Combine weight with recency using a score.
- Sort by score and return top N.

Keeping top N efficient
- Use a min-heap of size N.
- For each new notification, compute score and insert if it beats the min.

This is implemented in the notification backend service.