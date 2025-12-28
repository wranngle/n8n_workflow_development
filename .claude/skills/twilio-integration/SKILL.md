# Twilio Integration Skill

**Version**: 1.0.0
**Last Updated**: 2025-12-27
**Triggers**: twilio, sms, text message, phone call, whatsapp, mms, voice call, send text

---

## PURPOSE

This skill provides instant, comprehensive access to Twilio integration patterns for n8n workflow development. When Twilio is implicated in any workflow, this skill ensures correct configuration, proper error handling, and production-ready implementations.

**Design Philosophy**: "Blindfolded mechanic reaching for tools" - every Twilio pattern, error code, and configuration is organized for instant retrieval without fumbling through documentation.

---

## QUICK REFERENCE CARD

### n8n Twilio Node Configuration

```json
{
  "type": "n8n-nodes-base.twilio",
  "typeVersion": 1,
  "parameters": {
    "resource": "sms",           // "sms" | "call"
    "operation": "send",         // "send" (SMS) | "make" (Call)
    "from": "+18882662193",      // YOUR Twilio number (E.164)
    "to": "={{ $json.phone }}",  // Recipient (E.164)
    "message": "Your message",   // SMS content or TwiML
    "toWhatsapp": false,         // true for WhatsApp
    "options": {
      "statusCallback": "https://your-webhook.com/status"
    }
  },
  "credentials": {
    "twilioApi": {
      "id": "YOUR_CREDENTIAL_ID",
      "name": "Twilio Account"
    }
  }
}
```

### Phone Number Format (CRITICAL)

```
CORRECT:  +14155551234   (E.164 format with country code)
WRONG:    (415) 555-1234  (formatted)
WRONG:    415-555-1234    (missing country code)
WRONG:    4155551234      (missing + and country code)
```

### WhatsApp Format

```
From: whatsapp:+14155238886  (Twilio WhatsApp number)
To:   whatsapp:+15551234567  (Recipient)
```

---

## KNOWLEDGE SOURCES

### Primary Documentation (Context7)

| Library ID | Purpose | Snippets | Benchmark |
|------------|---------|----------|-----------|
| `/twilio/twilio-node` | Node.js SDK | 113 | 87.9 |
| `/websites/twilio_voice` | Voice/TwiML | 8,071 | 83.4 |
| `/llmstxt/twilio_llms_txt` | General API | 453 | 42.6 |
| `/websites/twilio` | Official Docs | 113 | 21.6 |
| `/websites/twilio_sendgrid` | Email (SendGrid) | 4,124 | 71.1 |

### Official Documentation URLs

| Resource | URL |
|----------|-----|
| Error Dictionary | https://www.twilio.com/docs/api/errors |
| SMS Debugging | https://www.twilio.com/docs/messaging/guides/debugging-common-issues |
| REST API Best Practices | https://www.twilio.com/docs/usage/rest-api-best-practices |
| Troubleshooting SMS | https://help.twilio.com/articles/223181868 |
| TwiML Reference | https://www.twilio.com/docs/voice/twiml |

### n8n Resources

| Tool | Command |
|------|---------|
| Node essentials | `mcp__n8n-mcp__get_node_essentials({nodeType: "nodes-base.twilio"})` |
| Full schema | `mcp__n8n-mcp__get_node_info({nodeType: "nodes-base.twilio"})` |
| Documentation | `mcp__n8n-mcp__get_node_documentation({nodeType: "nodes-base.twilio"})` |
| Templates | `mcp__n8n-mcp__search_templates({query: "twilio"})` |

---

## CREDENTIAL MANAGEMENT

### n8n Credential Schema (twilioApi)

```json
{
  "name": "Twilio Account",
  "type": "twilioApi",
  "data": {
    "accountSid": "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "authToken": "your_auth_token_here",
    "apiKeySid": "",      // Leave empty for standard auth
    "apiKeySecret": ""    // Leave empty for standard auth
  }
}
```

### Creating Credential via API

```bash
POST https://n8n.example.com/api/v1/credentials
Content-Type: application/json

{
  "name": "Twilio SMS",
  "type": "twilioApi",
  "data": {
    "accountSid": "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "authToken": "your_auth_token_here",
    "apiKeySid": "",
    "apiKeySecret": ""
  }
}
```

**IMPORTANT**: n8n requires ALL credential fields even if empty. Always include `apiKeySid` and `apiKeySecret` as empty strings for standard Account SID/Auth Token authentication.

---

## OPERATIONS REFERENCE

### SMS Operations

#### Send SMS

```json
{
  "resource": "sms",
  "operation": "send",
  "from": "+18882662193",
  "to": "+15551234567",
  "message": "Hello from n8n!",
  "toWhatsapp": false
}
```

#### Send MMS (with Media)

```json
{
  "resource": "sms",
  "operation": "send",
  "from": "+18882662193",
  "to": "+15551234567",
  "message": "Check out this image!",
  "mediaUrl": ["https://example.com/image.jpg"]
}
```

**Note**: MMS requires additional configuration in n8n. Use HTTP Request node for media messages:

```json
{
  "method": "POST",
  "url": "https://api.twilio.com/2010-04-01/Accounts/{{$credentials.accountSid}}/Messages.json",
  "authentication": "genericCredentialType",
  "genericAuthType": "httpBasicAuth",
  "sendBody": true,
  "bodyParameters": {
    "parameters": [
      {"name": "From", "value": "+18882662193"},
      {"name": "To", "value": "+15551234567"},
      {"name": "Body", "value": "Check this out!"},
      {"name": "MediaUrl", "value": "https://example.com/image.jpg"}
    ]
  }
}
```

#### Send WhatsApp

```json
{
  "resource": "sms",
  "operation": "send",
  "from": "whatsapp:+14155238886",
  "to": "whatsapp:+15551234567",
  "message": "Hello from WhatsApp!",
  "toWhatsapp": true
}
```

### Voice Operations

#### Make Call (Text-to-Speech)

```json
{
  "resource": "call",
  "operation": "make",
  "from": "+18882662193",
  "to": "+15551234567",
  "message": "Hello, this is an automated call from Wranngle.",
  "twiml": false
}
```

#### Make Call (TwiML)

```json
{
  "resource": "call",
  "operation": "make",
  "from": "+18882662193",
  "to": "+15551234567",
  "message": "<Response><Say voice=\"alice\">Hello from Twilio</Say><Pause length=\"1\"/><Say>Goodbye!</Say></Response>",
  "twiml": true
}
```

---

## ERROR CODES REFERENCE

### Common SMS Errors

| Code | Name | Cause | Fix |
|------|------|-------|-----|
| 21211 | Invalid 'To' Phone Number | Phone format wrong | Use E.164 format (+1...) |
| 21212 | Invalid 'From' Phone Number | Not a valid Twilio number | Verify number in console |
| 21408 | Permission Denied | Geographic restriction | Enable region in console |
| 21610 | Message blocked | Recipient opted out | Cannot override - respect opt-out |
| 21614 | 'To' number not valid mobile | Landline number | Can only SMS to mobile |
| 21617 | Message body required | Empty message | Provide message content |
| 30003 | Unreachable | Carrier issue | Retry later |
| 30004 | Message blocked | Spam filter | Adjust content |
| 30005 | Unknown destination | Invalid number | Verify number exists |
| 30006 | Landline or unreachable | Not SMS capable | Verify mobile number |
| 30007 | Carrier violation | Spam/compliance | Review content/frequency |
| 30008 | Unknown error | Transient | Retry with backoff |

### Common Voice Errors

| Code | Name | Cause | Fix |
|------|------|-------|-----|
| 13224 | Invalid TwiML | Malformed XML | Validate TwiML syntax |
| 13225 | TwiML Download Error | URL unreachable | Check webhook URL |
| 21215 | Geographic Permission | Region blocked | Enable in console |
| 21220 | Invalid 'To' for call | Bad phone format | Use E.164 format |

### Authentication Errors

| Code | Name | Cause | Fix |
|------|------|-------|-----|
| 20003 | Permission Denied | Invalid credentials | Check SID/Token |
| 20404 | Resource Not Found | Wrong account/resource | Verify account SID |
| 20429 | Too Many Requests | Rate limited | Implement backoff |

---

## PATTERNS & TEMPLATES

### Pattern 1: Webhook SMS Tool (ElevenLabs/Voice Agent)

```json
{
  "name": "SMS Webhook Tool",
  "nodes": [
    {
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "httpMethod": "POST",
        "path": "send-sms",
        "responseMode": "responseNode"
      }
    },
    {
      "type": "n8n-nodes-base.set",
      "parameters": {
        "assignments": {
          "assignments": [
            {
              "name": "phone_number",
              "value": "={{ $json.body.phone_number || $json.phone_number }}"
            },
            {
              "name": "message",
              "value": "={{ $json.body.message || $json.message }}"
            }
          ]
        }
      }
    },
    {
      "type": "n8n-nodes-base.twilio",
      "parameters": {
        "resource": "sms",
        "operation": "send",
        "from": "+18882662193",
        "to": "={{ $json.phone_number }}",
        "message": "={{ $json.message }}"
      }
    },
    {
      "type": "n8n-nodes-base.respondToWebhook",
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { success: true, sid: $json.sid } }}"
      }
    }
  ]
}
```

### Pattern 2: Status Callback Handler

```json
{
  "name": "Twilio Status Webhook",
  "nodes": [
    {
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "httpMethod": "POST",
        "path": "twilio-status"
      }
    },
    {
      "type": "n8n-nodes-base.switch",
      "parameters": {
        "rules": {
          "values": [
            {"outputKey": "delivered", "conditions": {"conditions": [{"leftValue": "={{ $json.MessageStatus }}", "rightValue": "delivered", "operator": {"operation": "equals"}}]}},
            {"outputKey": "failed", "conditions": {"conditions": [{"leftValue": "={{ $json.MessageStatus }}", "rightValue": "failed", "operator": {"operation": "equals"}}]}},
            {"outputKey": "undelivered", "conditions": {"conditions": [{"leftValue": "={{ $json.MessageStatus }}", "rightValue": "undelivered", "operator": {"operation": "equals"}}]}}
          ]
        }
      }
    }
  ]
}
```

### Pattern 3: Retry with Exponential Backoff

```javascript
// Code node for retry logic
const maxRetries = 3;
const currentRetry = $json.retryCount || 0;

if (currentRetry >= maxRetries) {
  return {
    success: false,
    error: "Max retries exceeded",
    lastError: $json.lastError
  };
}

const delay = Math.pow(2, currentRetry) * 1000; // 1s, 2s, 4s

return {
  phone: $json.phone,
  message: $json.message,
  retryCount: currentRetry + 1,
  retryDelay: delay,
  shouldRetry: true
};
```

---

## N8N TEMPLATES (Pre-built)

| ID | Name | Use Case |
|----|------|----------|
| 5078 | Twilio Tool MCP Server | AI agent SMS/Call tools |
| 3912 | RetellAI Phone Agent | Outbound call automation |
| 4949 | WhatsApp Booking System | Appointment scheduling |
| 3657 | Voiceflow + Twilio | Multi-channel voice bot |
| 4368 | Real Estate Voice Agent | Lead qualification calls |

**Retrieve template**: `mcp__n8n-mcp__get_template({templateId: 5078})`

---

## DEBUGGING CHECKLIST

When Twilio operations fail, check in order:

1. **Phone Format**
   - [ ] Using E.164 format? (+1...)
   - [ ] Country code included?
   - [ ] No spaces, dashes, or parentheses?

2. **Credentials**
   - [ ] Account SID starts with "AC"?
   - [ ] Auth Token is correct (not API Key)?
   - [ ] Credential attached to node?

3. **Number Verification**
   - [ ] From number is YOUR Twilio number?
   - [ ] To number is a real mobile number?
   - [ ] From and To are different?

4. **Geographic Permissions**
   - [ ] Destination country enabled in Twilio console?
   - [ ] Number has SMS capability?

5. **Content Compliance**
   - [ ] Message not empty?
   - [ ] No spam-trigger words?
   - [ ] Respecting opt-outs?

6. **Webhook Issues**
   - [ ] Webhook URL is HTTPS?
   - [ ] URL is publicly accessible?
   - [ ] Response within 15 seconds?

---

## TWIML QUICK REFERENCE

### Say (Text-to-Speech)

```xml
<Response>
  <Say voice="alice" language="en-US">Hello, welcome to our service.</Say>
</Response>
```

**Voices**: alice, man, woman, Polly.* (AWS voices)

### Gather (Collect Input)

```xml
<Response>
  <Gather input="dtmf speech" timeout="5" numDigits="1" action="/handle-input">
    <Say>Press 1 for sales, 2 for support.</Say>
  </Gather>
  <Say>We didn't receive any input. Goodbye!</Say>
</Response>
```

### Dial (Connect Call)

```xml
<Response>
  <Dial callerId="+18882662193" timeout="30" record="record-from-answer">
    <Number>+15551234567</Number>
  </Dial>
</Response>
```

### Record

```xml
<Response>
  <Say>Please leave a message after the beep.</Say>
  <Record maxLength="60" action="/handle-recording" />
</Response>
```

### Play (Audio File)

```xml
<Response>
  <Play>https://example.com/audio.mp3</Play>
</Response>
```

---

## INTEGRATION WITH N8N-WORKFLOW-DEV

When the master skill (`n8n-workflow-dev`) detects Twilio involvement:

1. **INVOKE THIS SKILL** at Step 11 (Node Configuration)
2. **USE** node essentials for correct parameter mapping
3. **VALIDATE** phone numbers are E.164 format
4. **CHECK** credentials exist or create them
5. **APPLY** appropriate error handling pattern

### Detection Keywords

```javascript
const twilioKeywords = [
  'twilio', 'sms', 'text message', 'send text',
  'phone call', 'voice call', 'make call',
  'whatsapp', 'mms', 'messaging'
];
```

---

## MEMORY INTEGRATION

When Twilio credentials are provided, store immediately:

```javascript
mcp__memory__create_entities([{
  name: "Twilio Credentials - {PROJECT}",
  entityType: "Credential",
  observations: [
    "Account SID: ACxxxxxxxxxx",
    "Auth Token: xxxxxxxxxx",
    "Phone Number: +1xxxxxxxxxx",
    "n8n Credential ID: {ID}"
  ]
}]);
```

---

## RELATED SKILLS

- `n8n-workflow-dev` - Master workflow orchestrator
- `n8n-node-configuration` - General node config patterns
- `n8n-expression-syntax` - Expression validation
- `n8n-validation-expert` - Error interpretation

---

*This skill enables production-ready Twilio integrations with the precision of a master craftsman.*
