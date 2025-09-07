# ResQlinK Firestore Schema

## Collections

### SOSMessages
| Field | Type | Notes |
|-------|------|-------|
| id | string | Document ID (auto) |
| userId | string | UID from Firebase Auth |
| lat | number | Latitude (-90..90) |
| lng | number | Longitude (-180..180) |
| message | string | Max 280 chars |
| timestamp | number | ms epoch |

### ChatMessages
| Field | Type | Notes |
|-------|------|-------|
| id | string | Document ID (auto/batch) |
| fromUser | string | Sender UID |
| toUser | string | Receiver UID |
| message | string | Max 500 chars |
| timestamp | number | ms epoch |

## Access Patterns
- Nearby SOS: client sends position & radius to backend; backend filters last N (<=500) docs.
- Chat sync: client batches unsent messages to `/api/chat/sync`.
- Admin console: `/api/admin/messages/all` (backend protected via email allow list).

## Index Suggestions
Create composite indexes if needed for advanced queries. Current design uses timestamp ordering.
