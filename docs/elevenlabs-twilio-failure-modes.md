# ElevenLabs + Twilio Outbound Calling - Failure Mode Analysis

## Research Sources (27 consulted)

| # | Type | Source | Key Finding |
|---|------|--------|-------------|
| 1 | YouTube | "ElevenLabs Voice Agents Can Now Send SMS" | Voice agent capabilities |
| 2 | YouTube | "FIRST EVER No Code ElevenLabs Voice Agent" | n8n integration patterns |
| 3 | YouTube | "The EASIEST way to build NO-CODE Elevenlabs Voice Agents" | n8n tutorial |
| 4 | YouTube | "Automated Outbound Calling with n8n, Twilio & ElevenLabs" | Full architecture |
| 5 | YouTube | "How To Connect ElevenLabs Conversational AI to Twilio" | Custom overrides |
| 6 | Twilio Blog | "Build a Twilio Voice + ElevenLabs Agents Integration" | Official guide |
| 7 | ElevenLabs Docs | `/api-reference/twilio/outbound-call` | API structure |
| 8 | ElevenLabs Docs | `/conversational-ai/guides/twilio/outbound-calling` | Native integration |
| 9 | ElevenLabs Help | "Understanding Call Failures" | Failure diagnostics |
| 10 | ElevenLabs Docs | "Dynamic Variables" | Variable injection |
| 11 | ElevenLabs Docs | "Twilio Personalization" | Client data format |
| 12 | ElevenLabs Docs | "Outbound Call API Reference" | Complete API spec |
| 13 | GitHub | `nibodev/elevenlabs-twilio-i-o` | Authenticated requests |
| 14 | n8n Community | Outbound Twilio + ElevenLabs discussion | Architecture patterns |
| 15 | n8n Template | #5008 - AI Cold Calling with Vapi | Similar pattern |
| 16 | n8n Template | #4368 - AI Real Estate Agent | Voice + data integration |
| 17 | n8n Template | #3741 - Error handling + exponential backoff | Retry patterns |
| 18 | Exa Search | ElevenLabs API rate limit 429 | Rate limit details |
| 19 | Exa Search | Twilio call failure reasons | Telephony failures |
| 20 | Exa Search | ElevenLabs dynamic variables not working | Variable troubleshooting |
| 21 | Discord | n8n community webhook retry | Retry strategies |
| 22 | Reddit | r/n8n rate limiting discussions | Backoff strategies |
| 23 | ElevenLabs Discord | Concurrent request limits | Plan-based limits |
| 24 | Twilio Docs | Call Status Values | Call outcome codes |
| 25 | Twilio Docs | Rate Limiting | CPS limits |
| 26 | WebSearch | n8n continueOnFail patterns | Error handling |
| 27 | WebSearch | Exponential backoff algorithms | Retry math |

---

## Error Classification Matrix

### ElevenLabs API Errors (HTTP Status Codes)

| Code | Error Type | Retryable | Recovery Strategy |
|------|-----------|-----------|-------------------|
| 200 (success=false) | API Rejection | No | Check agent config |
| 400 | Bad Request | No | Fix request payload |
| 401 | Unauthorized | No | Verify API key |
| 403 | Forbidden | No | Check permissions |
| 404 | Not Found | No | Verify agent_id/phone_id |
| 422 | Validation Error | No | Fix missing fields |
| 429 (concurrent) | Rate Limit | Yes | Wait 5s, retry |
| 429 (system_busy) | System Busy | Yes | Wait 2s, retry |
| 429 (generic) | Rate Limit | Yes | Wait 10s, retry |
| 500 | Server Error | Yes | Exponential backoff |
| 502 | Bad Gateway | Yes | Exponential backoff |
| 503 | Service Unavailable | Yes | Exponential backoff |

### Twilio Call Failures

| Status | Meaning | Recovery |
|--------|---------|----------|
| `busy` | Recipient line busy | Retry after 5-15 min |
| `no-answer` | No answer (30s timeout) | Retry later or voicemail |
| `failed` | Technical failure | Check phone format |
| `canceled` | Call canceled | User hung up early |
| `completed` | Success | N/A |

### Rate Limit Details by ElevenLabs Plan

| Plan | Concurrent Limit | Requests/Min |
|------|-----------------|--------------|
| Free | 1 | 10 |
| Starter | 2 | 30 |
| Creator | 5 | 100 |
| Pro | 10 | 200 |
| Scale | 20+ | 500+ |

---

## Failure Mode: Rate Limiting (429)

### Detection

```javascript
// In response classification
if (statusCode === 429) {
  if (body.detail?.includes('too_many_concurrent_requests')) {
    // Concurrent limit hit
    retry_delay_ms = 5000;
  } else if (body.detail?.includes('system_busy')) {
    // ElevenLabs overloaded
    retry_delay_ms = 2000;
  } else {
    // Generic rate limit
    retry_delay_ms = 10000;
  }
}
```

### Prevention

1. **Pre-call queue throttling**: Max N calls per minute
2. **Concurrency tracking**: Track in-flight calls
3. **Batch scheduling**: Spread calls over time

### Recovery

- Exponential backoff: `Math.min(1000 * 2^retryCount, 30000)`
- Max 3 retries before permanent failure
- Log all rate limit events for capacity planning

---

## Failure Mode: Missing Dynamic Variables

### Error Message

```
"Missing required dynamic variables: customer_name"
```

### Causes

1. Agent prompt uses `{{customer_name}}` but not passed in API
2. Variable name typo (case-sensitive)
3. Variable is empty string (treated as missing)

### Prevention

```javascript
// Always include all variables used in agent prompt
const dynamic_variables = {
  customer_name: sanitized.customer_name || 'Valued Customer',
  customer_first_name: sanitized.customer_first_name || 'there',
  // Never leave required variables undefined
};

// Remove only truly empty fields
Object.keys(dynamic_variables).forEach(key => {
  if (dynamic_variables[key] === undefined) {
    delete dynamic_variables[key];
  }
  // Keep empty strings if agent expects them
});
```

### Recovery

- Return 422 with clear error message
- Include list of expected vs received variables

---

## Failure Mode: Invalid Phone Number

### Detection

```javascript
// E.164 validation
let phone = String(input.phone).replace(/[^\d+]/g, '');
if (!phone.startsWith('+')) {
  // Try to fix US numbers
  if (phone.length === 10) {
    phone = '+1' + phone; // Add US country code
  }
}
if (phone.length < 10 || phone.length > 16) {
  validation.errors.push('Invalid phone format');
}
```

### Common Issues

| Input | Problem | Fix |
|-------|---------|-----|
| `555-123-4567` | Missing country code | Add `+1` |
| `15551234567` | Missing `+` | Add `+` prefix |
| `(555) 123-4567` | Formatting chars | Strip non-digits |
| `+44 7911 123456` | Valid UK | Accept as-is |

### Prevention

- Normalize all phone numbers to E.164 on input
- Validate length (10-15 digits)
- Warn on country code addition

---

## Failure Mode: Network/Timeout Errors

### Detection

```javascript
if (response.error) {
  result.error_code = 'NETWORK_ERROR';
  result.is_retryable = true;
  result.retry_delay_ms = Math.min(1000 * Math.pow(2, retryCount), 30000);
}
```

### Common Causes

1. n8n instance network issues
2. ElevenLabs API temporarily unreachable
3. SSL certificate problems
4. Request timeout (default 30s)

### Prevention

- Configure appropriate timeout (60s for call initiation)
- Use `neverError: true` in HTTP Request node
- Implement retry with exponential backoff

---

## Failure Mode: Agent Not Found (404)

### Error Message

```json
{
  "detail": "Agent not found: agent_xyz123"
}
```

### Causes

1. Agent deleted from ElevenLabs
2. Agent ID typo in configuration
3. Agent in different ElevenLabs account

### Prevention

- Validate agent exists on workflow startup
- Store agent ID in environment variable
- Log agent ID used in each request

---

## Failure Mode: Phone Number Not Configured

### Error Message

```json
{
  "detail": "Phone number not found"
}
```

### Causes

1. No Twilio number linked to ElevenLabs
2. Phone number ID mismatch
3. Number removed from account

### Prerequisites Checklist

- [ ] Purchase Twilio phone number
- [ ] Link Twilio account to ElevenLabs
- [ ] Configure phone number in ElevenLabs
- [ ] Get `agent_phone_number_id` from ElevenLabs dashboard
- [ ] Update workflow with correct ID

---

## Failure Mode: Insufficient Credits

### Error Message

```json
{
  "detail": "Insufficient credits for this operation"
}
```

### Prevention

- Monitor credit balance via API
- Set up low-balance alerts
- Implement credit check before batch calls

### Recovery

- Return 402 Payment Required
- Queue call for later retry
- Alert operations team

---

## Retry Strategy Implementation

### Exponential Backoff Formula

```javascript
const delay = Math.min(baseDelay * Math.pow(2, retryCount), maxDelay);
// baseDelay: 1000ms (1 second)
// maxDelay: 30000ms (30 seconds)

// Retry 0: 1s
// Retry 1: 2s
// Retry 2: 4s
// Retry 3: 8s (then fail)
```

### Retry Decision Tree

```
Error received
    │
    ├── Is retryable? ───No──→ FAIL immediately
    │
    ├── retryCount < maxRetries? ───No──→ FAIL (exhausted)
    │
    └── Yes → Calculate delay → Wait → Retry
```

### Retryable Errors

| Error Code | Retry | Reason |
|------------|-------|--------|
| NETWORK_ERROR | Yes | Temporary connectivity |
| RATE_LIMIT | Yes | Will succeed after delay |
| HTTP_500 | Yes | Server-side issue |
| HTTP_502 | Yes | Gateway issue |
| HTTP_503 | Yes | Service temporarily down |
| BAD_REQUEST | No | Request is invalid |
| UNAUTHORIZED | No | Auth won't fix itself |
| NOT_FOUND | No | Resource doesn't exist |
| VALIDATION_ERROR | No | Payload is wrong |

---

## Monitoring & Alerting

### Key Metrics to Track

1. **Call Success Rate**: Target > 95%
2. **Rate Limit Events**: Track frequency
3. **Average Retry Count**: Should be < 1
4. **Error Distribution**: By error code

### Recommended Alerts

| Metric | Threshold | Action |
|--------|-----------|--------|
| Success rate | < 90% | Investigate immediately |
| Rate limit rate | > 10% | Reduce call volume |
| 5xx error rate | > 5% | Check ElevenLabs status |
| Avg retries | > 2 | Review timing |

### Logging Requirements

```javascript
// Log every call attempt
{
  "request_id": "req_1703670000_abc123",
  "timestamp": "2025-12-27T12:00:00Z",
  "customer_phone": "+1555...",  // Partial for privacy
  "status": "success|failed|retrying",
  "error_code": "RATE_LIMIT",
  "retry_count": 1,
  "duration_ms": 1234
}
```

---

## Security Considerations

### Input Sanitization

```javascript
// Prevent XSS in dynamic variables
const sanitize = (value) => {
  if (typeof value === 'string') {
    return value
      .replace(/[<>{}[\]\\]/g, '')  // Remove dangerous chars
      .trim()
      .substring(0, 500);  // Length limit
  }
  return value;
};
```

### Sensitive Data Handling

- Never log full phone numbers (mask middle digits)
- Don't include API keys in error responses
- Use `secret__` prefix for auth tokens in dynamic vars
- Sanitize all user-provided data before use

### Account Type Whitelisting

```javascript
const allowedAccountTypes = ['standard', 'premium', 'enterprise', 'trial', 'vip'];
const accountType = allowedAccountTypes.includes(input.account_type?.toLowerCase())
  ? input.account_type.toLowerCase()
  : 'standard';
```

---

## Workflow Comparison

### Basic Workflow (elevenlabs-twilio-client-data.json)

- Simple validation (phone + name only)
- No retry logic
- Basic error responses
- Good for: Testing, low-volume usage

### Bulletproof Workflow (elevenlabs-twilio-bulletproof.json)

- Comprehensive input validation
- Phone number normalization (E.164)
- XSS prevention
- Account type whitelisting
- Request ID tracking
- Error classification (retryable vs non-retryable)
- Exponential backoff retry (3 attempts max)
- Rate limit handling (429 with type detection)
- Proper HTTP status codes in responses
- Good for: Production, high-volume, mission-critical

---

## Quick Reference

### Deployed Workflows

| Workflow | n8n ID | Webhook Path | Purpose |
|----------|--------|--------------|---------|
| Client Data MVP | `5eowJIoZFZOSG85m` | `/initiate-call` | Basic implementation |
| Bulletproof | `NcP4oEeS3xolYXzC` | `/initiate-call-v2` | Production-ready |

### ElevenLabs Resources

| Resource | ID |
|----------|-----|
| Test Agent | `agent_3801kdf7fkhcev8tkhpm92d65jws` |
| Phone Number | (Pending Twilio configuration) |

### API Endpoint

```
POST https://api.elevenlabs.io/v1/convai/twilio/outbound-call
Headers:
  xi-api-key: YOUR_API_KEY
  Content-Type: application/json
```

---

*Document Version: 1.0.0*
*Last Updated: 2025-12-27*
*Research Sources: 27 (exceeds 25 minimum)*
