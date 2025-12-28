# ElevenLabs + Twilio Client Initiation Data MVP Framework

## Research Sources (12 consulted)

| # | Type | Source | Key Finding |
|---|------|--------|-------------|
| 1 | YouTube | "ElevenLabs Voice Agents Can Now Send SMS" | Voice agent capabilities |
| 2 | YouTube | "FIRST EVER No Code ElevenLabs Voice Agent" | n8n integration patterns |
| 3 | YouTube | "The EASIEST way to build NO-CODE Elevenlabs Voice Agents" | n8n tutorial |
| 4 | YouTube | "Automated Outbound Calling with n8n, Twilio & ElevenLabs" | Full architecture |
| 5 | YouTube | "How To Connect ElevenLabs Conversational AI to Twilio" | Custom overrides |
| 6 | Twilio Blog | "Build a Twilio Voice + ElevenLabs Agents Integration" | Official guide |
| 7 | ElevenLabs Docs | `/api-reference/twilio/outbound-call` | `conversation_initiation_client_data` |
| 8 | ElevenLabs Docs | `/conversational-ai/guides/twilio/outbound-calling` | Native integration |
| 9 | GitHub | `nibodev/elevenlabs-twilio-i-o` | Authenticated requests for vars |
| 10 | n8n Community | Outbound Twilio + ElevenLabs discussion | Architecture patterns |
| 11 | n8n Template | #5008 - AI Cold Calling with Vapi | Similar pattern |
| 12 | n8n Template | #4368 - AI Real Estate Agent | Voice + data integration |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CLIENT INITIATION DATA FLOW                               │
│                                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   CRM/DB    │───▶│    n8n      │───▶│   Twilio    │───▶│ ElevenLabs  │  │
│  │  (Source)   │    │ (Orchestr.) │    │   (Voice)   │    │   (Agent)   │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
│        │                  │                  │                  │          │
│        │                  │                  │                  │          │
│   customer_id        HTTP POST          TwiML +            Agent uses      │
│   name, phone        to Twilio       Media Stream        dynamic_vars      │
│   context data      + client_data    with params         in prompts       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Key API Structure

### `conversation_initiation_client_data` Object

```json
{
  "agent_id": "your-agent-id",
  "agent_phone_number_id": "your-phone-id",
  "to_number": "+1234567890",
  "conversation_initiation_client_data": {
    "user_id": "customer_12345",
    "dynamic_variables": {
      "customer_name": "John Smith",
      "account_number": "ACC-78901",
      "appointment_date": "2025-01-15",
      "previous_purchase": "Widget Pro",
      "loyalty_tier": "Gold",
      "custom_greeting": "Welcome back, valued customer!"
    },
    "conversation_config_override": {
      "agent": {
        "first_message": "Hi {{customer_name}}, I'm calling about your appointment on {{appointment_date}}."
      }
    }
  }
}
```

### Using Variables in Agent Prompts

In ElevenLabs agent configuration, reference variables with double braces:
- `{{customer_name}}` - Customer's name
- `{{account_number}}` - Their account ID
- `{{appointment_date}}` - Scheduled date
- Any custom key from `dynamic_variables`

---

## n8n Workflow Pattern

### Trigger Options

1. **Webhook** - External system triggers call
2. **Schedule** - Batch calling at set times
3. **Google Sheets** - New row triggers call
4. **Database** - Query for pending calls

### Core Nodes

```
[Trigger]
    → [Get Customer Data] (Sheets/DB/API)
    → [Build Client Data Payload] (Code node)
    → [HTTP Request to Twilio/ElevenLabs]
    → [Log Call Initiated] (Sheets/DB)
    → [Webhook: Call Completed]
    → [Process Results] (AI summarize)
    → [Update CRM]
```

### HTTP Request Configuration

**Endpoint**: `https://api.elevenlabs.io/v1/convai/twilio/outbound-call`

**Headers**:
```
xi-api-key: YOUR_ELEVENLABS_API_KEY
Content-Type: application/json
```

**Body** (from Code node):
```javascript
const customer = $input.first().json;

return {
  agent_id: "{{ $env.ELEVENLABS_AGENT_ID }}",
  agent_phone_number_id: "{{ $env.ELEVENLABS_PHONE_ID }}",
  to_number: customer.phone,
  conversation_initiation_client_data: {
    user_id: customer.id,
    dynamic_variables: {
      customer_name: customer.name,
      account_number: customer.account_id,
      appointment_date: customer.next_appointment,
      order_status: customer.last_order_status,
      loyalty_points: customer.points,
      preferred_language: customer.language || "English"
    }
  }
};
```

---

## MVP Implementation Phases

### Phase 1: Basic Outbound with Static Data
- [ ] Create ElevenLabs agent with variable placeholders
- [ ] Configure Twilio phone number
- [ ] n8n workflow: Manual trigger → HTTP call with hardcoded data
- [ ] Verify agent receives and uses variables

### Phase 2: Dynamic Data from Sheets
- [ ] Google Sheets with customer data columns
- [ ] n8n: New row trigger → Build payload → Make call
- [ ] Log call status back to sheet

### Phase 3: Inbound + Context Lookup
- [ ] Webhook receives inbound call notification
- [ ] Look up caller in database
- [ ] Return client_data to agent for personalized handling

### Phase 4: Full CRM Integration
- [ ] Bidirectional sync with CRM (Pipedrive, HubSpot, etc.)
- [ ] Call recordings stored
- [ ] AI-generated summaries logged
- [ ] Follow-up tasks created

---

## ElevenLabs Agent Configuration

### System Prompt Template

```
You are a professional assistant for {{company_name}}.

CUSTOMER CONTEXT:
- Name: {{customer_name}}
- Account: {{account_number}}
- Tier: {{loyalty_tier}}
- Last Purchase: {{previous_purchase}}

CALL PURPOSE: {{call_purpose}}

INSTRUCTIONS:
1. Greet the customer by name
2. Reference their account status appropriately
3. Address the specific purpose of this call
4. Be concise and professional
5. If they have questions outside your scope, offer to transfer

AVAILABLE ACTIONS:
- Schedule appointment
- Provide order status
- Answer product questions
- Transfer to human agent
```

### First Message Override

```
Hi {{customer_name}}, this is {{agent_name}} from {{company_name}}.
{{call_purpose_intro}}
```

---

## Testing Checklist

- [ ] Agent responds to test call
- [ ] Variables appear in conversation
- [ ] First message is personalized
- [ ] Call logs capture outcome
- [ ] Webhook receives completion data
- [ ] n8n processes post-call data

---

## Security Considerations

1. **API Key Protection**: Store in n8n credentials, not workflow
2. **Phone Number Validation**: Validate format before calling
3. **Rate Limiting**: Implement delays between batch calls
4. **Data Sanitization**: Clean customer data before injection
5. **PII Handling**: Don't log sensitive data in plain text

---

## Cost Estimation

| Component | Cost Model |
|-----------|------------|
| ElevenLabs | Per-minute voice + agent time |
| Twilio | Per-minute telephony |
| n8n | Per-execution (cloud) or self-hosted |

**Typical call**: ~$0.15-0.30/minute combined

---

## Next Steps

1. Create test ElevenLabs agent with variable placeholders
2. Purchase/configure Twilio number
3. Build n8n workflow from template
4. Test with single hardcoded call
5. Expand to dynamic data source
6. Add post-call processing

---

*Framework Version: 1.0.0*
*Last Updated: 2025-12-27*
