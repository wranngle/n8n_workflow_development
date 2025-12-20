#!/bin/bash
# Auth Test: RingCentral
# Generated: 2025-12-20
# Docs: https://developers.ringcentral.com/guide/authentication/jwt-flow

set -e

# Load credentials
source ../../env/.env.ringcentral

echo "Testing JWT authentication for RingCentral..."

# JWT Token Exchange
RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer" \
  -d "assertion=$RC_USER_JWT" \
  -u "$RC_APP_CLIENT_ID:$RC_APP_CLIENT_SECRET" \
  "$RC_SERVER_URL/restapi/oauth/token")

ACCESS_TOKEN=$(echo $RESPONSE | jq -r '.access_token')

if [ "$ACCESS_TOKEN" == "null" ] || [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ FAIL: JWT token exchange failed"
  echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
  exit 1
fi

echo "✅ PASS: JWT token obtained"
echo "Token preview: ${ACCESS_TOKEN:0:20}..."

# Save token for other tests
echo "export ACCESS_TOKEN=$ACCESS_TOKEN" > .token.sh
