#!/bin/bash
# Test: RingCentral - Get Call Log
# Method: GET
# Docs: https://developers.ringcentral.com/guide/voice/call-log

set -e

source ../../env/.env.ringcentral
source .token.sh 2>/dev/null || { echo "Run 01-auth-test.sh first"; exit 1; }

echo "Testing Call Log API..."

# Get call log from last 7 days
DATE_FROM=$(date -d "-7 days" -u +"%Y-%m-%dT00:00:00.000Z" 2>/dev/null || date -v-7d -u +"%Y-%m-%dT00:00:00.000Z")
DATE_TO=$(date -u +"%Y-%m-%dT23:59:59.999Z")

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X GET \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  "$BASE_URL/account/~/extension/~/call-log?dateFrom=$DATE_FROM&dateTo=$DATE_TO&view=Detailed&perPage=5")

# Split response and status
HTTP_BODY=$(echo "$RESPONSE" | sed '$d')
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)

if [ "$HTTP_CODE" -ne 200 ]; then
  echo "❌ FAIL: Expected 200, got $HTTP_CODE"
  echo "$HTTP_BODY" | jq '.' 2>/dev/null || echo "$HTTP_BODY"
  exit 1
fi

# Check for records array
RECORD_COUNT=$(echo "$HTTP_BODY" | jq '.records | length')

echo "✅ PASS: Call Log retrieved"
echo "Records found: $RECORD_COUNT"
echo ""
echo "Sample record structure:"
echo "$HTTP_BODY" | jq '.records[0] | {id, sessionId, startTime, duration, direction, from, to, result}' 2>/dev/null | head -20
