#!/usr/bin/env bash
BASE=http://localhost:4000
TOKEN="REPLACE_WITH_ID_TOKEN"

# Health
curl -s $BASE/health | jq

# Anonymous login (custom token, client still must exchange via Firebase client SDK for ID token)
curl -s -X POST $BASE/api/auth/login/anonymous | jq

# Email login (hackathon simplified flow)
curl -s -X POST $BASE/api/auth/login/email -H 'Content-Type: application/json' -d '{"email":"user@example.com"}' | jq

# Post SOS
curl -s -X POST $BASE/api/sos -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"userId":"UID","lat":12.34,"lng":56.78,"message":"Help needed","timestamp":'"$(date +%s%3N)"'}' | jq

# Nearby SOS
curl -s "$BASE/api/sos/nearby?lat=12.34&lng=56.78&radius=10" -H "Authorization: Bearer $TOKEN" | jq

# Sync chat messages
curl -s -X POST $BASE/api/chat/sync -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"messages":[{"fromUser":"UID","toUser":"OTHER","message":"Hello","timestamp":'"$(date +%s%3N)"'}]}' | jq

# Admin all messages (requires admin email token)
curl -s $BASE/api/admin/messages/all -H "Authorization: Bearer $TOKEN" | jq
