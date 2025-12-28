# Sarah AI Receptionist - Complete Setup Guide

## Created Resources

### ElevenLabs Agent
- **Name**: Sarah - Wranngle Receptionist
- **Agent ID**: `agent_8001kdgp7qbyf4wvhs540be78vew`
- **Voice**: Sarah (EXAVITQu4vr4xnSDxMaL)
- **LLM**: gpt-4o
- **Status**: Created, needs tool configuration

### n8n Workflow
- **Name**: Sarah SMS Tool - ElevenLabs Webhook
- **Workflow ID**: `qcQSo3be6qe79zBn`
- **Webhook URL**: `https://n8n.wranngle.com/webhook/sarah-send-sms`
- **Status**: Created, needs activation + Twilio credential

---

## Step 1: Activate n8n Workflow

1. Go to: https://n8n.wranngle.com/workflow/qcQSo3be6qe79zBn
2. Add Twilio credentials to the "Send SMS via Twilio" node
3. Toggle workflow to **Active**
4. Test webhook URL: `POST https://n8n.wranngle.com/webhook/sarah-send-sms`

### Test Payload
```json
{
  "phone_number": "+15551234567",
  "first_name": "Test"
}
```

---

## Step 2: Configure ElevenLabs Tool

Go to: https://elevenlabs.io/app/conversational-ai/agents

1. Click on **Sarah - Wranngle Receptionist**
2. Navigate to **Tools** section
3. Click **Add Tool** → **Webhook**

### Tool Configuration

| Field | Value |
|-------|-------|
| **Name** | `send_sms` |
| **Description** | Sends a booking link via SMS to the caller's phone number |
| **Method** | POST |
| **URL** | `https://n8n.wranngle.com/webhook/sarah-send-sms` |

### Parameters

Add these parameters:

| Name | Type | Description | Required |
|------|------|-------------|----------|
| `first_name` | string | The caller's first name | Yes |
| `phone_number` | string | Phone number from conversation (auto-populated) | No |
| `caller_id` | string | Caller's phone number from Twilio | No |

### Headers (Optional)
```
Content-Type: application/json
```

---

## Step 3: Assign Phone Number

1. In ElevenLabs agent settings, go to **Phone Numbers**
2. Assign: `+18882662193` (phnum_1901kdgev877fep99ex5fc5abb3m)
3. Save changes

---

## Step 4: Test the Agent

### Option A: Web Widget Test
1. In ElevenLabs, click **Test Agent**
2. Say: "I'm interested in learning more about your AI agents"
3. When prompted, give name and agree to SMS
4. Verify SMS arrives

### Option B: Phone Call Test
1. Call: +1 (888) 266-2193
2. Have conversation with Sarah
3. Agree to receive booking link
4. Verify SMS arrives

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Caller Phone  │────▶│   ElevenLabs    │────▶│   n8n Workflow  │
│   +1-555-xxx    │     │   Sarah Agent   │     │   sarah-send-sms│
└─────────────────┘     └─────────────────┘     └─────────────────┘
                              │                        │
                              │ Tool: send_sms         │ Twilio API
                              │ {first_name, phone}    │
                              ▼                        ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │   Webhook POST  │────▶│   SMS Delivered │
                        │   to n8n        │     │   to Caller     │
                        └─────────────────┘     └─────────────────┘
```

---

## Troubleshooting

### SMS Not Sending
1. Check n8n workflow is **Active**
2. Verify Twilio credentials are configured
3. Check n8n execution logs for errors

### Tool Not Triggering
1. Verify tool name matches system prompt: `send_sms`
2. Check webhook URL is correct
3. Test webhook manually with curl:
```bash
curl -X POST https://n8n.wranngle.com/webhook/sarah-send-sms \
  -H "Content-Type: application/json" \
  -d '{"first_name": "Test", "phone_number": "+15551234567"}'
```

### Agent Not Responding
1. Check agent is not in draft mode
2. Verify phone number is assigned
3. Check ElevenLabs subscription quota

---

## Files Reference

| File | Purpose |
|------|---------|
| `sarah-sms-tool.json` | n8n workflow JSON |
| `sarah-agent-setup.md` | This setup guide |
| `.claude/directives/integrations/elevenlabs/patterns/sarah-receptionist-prompt.md` | Optimized system prompt |

---

*Created: 2025-12-27*
*Agent ID: agent_8001kdgp7qbyf4wvhs540be78vew*
*Workflow ID: qcQSo3be6qe79zBn*
