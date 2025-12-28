# Twilio Error Codes Reference

Quick-lookup table for Twilio error codes encountered in n8n workflows.

## SMS/MMS Errors (21xxx, 30xxx)

### Authentication & Permission

| Code | Message | Cause | Resolution |
|------|---------|-------|------------|
| 20003 | Permission Denied | Invalid Account SID or Auth Token | Verify credentials in Twilio console |
| 20404 | Resource Not Found | Account/resource doesn't exist | Check Account SID is correct |
| 20429 | Too Many Requests | Rate limited | Implement exponential backoff |

### Phone Number Validation

| Code | Message | Cause | Resolution |
|------|---------|-------|------------|
| 21211 | Invalid 'To' Phone Number | Bad format or non-existent | Use E.164 format: +14155551234 |
| 21212 | Invalid 'From' Phone Number | Not a verified Twilio number | Verify in Twilio console |
| 21214 | To number not reachable | Carrier/network issue | Check if number is real |
| 21217 | Phone number not verified | Trial account restriction | Verify recipient in console |
| 21219 | 'To' phone disabled | Number blocked by Twilio | Contact Twilio support |
| 21220 | Invalid 'To' Phone Number | Cannot call this number | Verify number is callable |
| 21614 | 'To' number not SMS-capable | Landline or VoIP | Use mobile number |
| 21617 | Message body required | Empty message parameter | Provide message content |

### Geographic & Compliance

| Code | Message | Cause | Resolution |
|------|---------|-------|------------|
| 21408 | Permission to send SMS denied | Geographic restriction | Enable country in console |
| 21215 | Account not allowed to call | Voice geo-permission | Enable calling region |
| 21610 | Message blocked by opt-out | Recipient sent STOP | Cannot override - respect opt-out |
| 30007 | Carrier Violation | Spam/compliance issue | Review message content/frequency |

### Delivery Failures

| Code | Message | Cause | Resolution |
|------|---------|-------|------------|
| 30001 | Queue Overflow | Too many messages | Slow down sending rate |
| 30002 | Account Suspended | Billing/compliance | Contact Twilio |
| 30003 | Unreachable | Destination unavailable | Retry later |
| 30004 | Message Blocked | Carrier spam filter | Adjust message content |
| 30005 | Unknown Destination | Number doesn't exist | Verify recipient number |
| 30006 | Landline Destination | Cannot SMS landlines | Use mobile numbers |
| 30008 | Unknown Error | Transient failure | Retry with backoff |
| 30010 | Message Price Exceeds Max | Cost limit reached | Increase max price or check route |

## Voice/Call Errors (13xxx, 21xxx)

### TwiML Errors

| Code | Message | Cause | Resolution |
|------|---------|-------|------------|
| 13224 | Invalid TwiML | Malformed XML | Validate TwiML syntax |
| 13225 | TwiML Download Error | Webhook URL unreachable | Check URL is HTTPS and accessible |
| 13226 | TwiML Parse Error | Invalid TwiML structure | Fix XML formatting |
| 13227 | TwiML Redirect Error | Redirect URL failed | Verify redirect target |

### Call Initiation

| Code | Message | Cause | Resolution |
|------|---------|-------|------------|
| 21201 | No 'To' number specified | Missing To parameter | Provide destination number |
| 21202 | 'To' number invalid | Bad phone format | Use E.164 format |
| 21203 | International calling disabled | Geo-permission | Enable in console |
| 21205 | Cannot make call from this number | Number not voice-capable | Use voice-enabled number |
| 21210 | 'From' number not verified | Trial limitation | Verify caller ID |

## WhatsApp Errors

| Code | Message | Cause | Resolution |
|------|---------|-------|------------|
| 63001 | Channel Not Installed | WhatsApp not configured | Set up WhatsApp sender |
| 63003 | Invalid WhatsApp Number | Bad format | Use whatsapp:+1234567890 |
| 63007 | Recipient hasn't opted in | No consent | Wait for user to message first |
| 63016 | Message failed to send | WhatsApp delivery issue | Check content type |

## Quick Diagnostic Flow

```
Error received →
├─ 2xxxx? → Authentication/validation issue
│   └─ Check: credentials, phone format, permissions
├─ 3xxxx? → Delivery failure
│   └─ Check: carrier issues, spam filters, retry
├─ 13xxx? → TwiML/Voice issue
│   └─ Check: webhook URL, TwiML syntax
└─ 63xxx? → WhatsApp specific
    └─ Check: sender setup, opt-in status
```

## n8n Error Handling Pattern

```javascript
// In Code node after Twilio node
const error = $input.item.json.error;
if (error) {
  const code = error.code;

  // Retryable errors
  const retryable = [30003, 30008, 20429];
  if (retryable.includes(code)) {
    return { retry: true, delay: 5000 };
  }

  // Fatal errors - don't retry
  const fatal = [21211, 21212, 21610, 30002];
  if (fatal.includes(code)) {
    return { retry: false, alert: true };
  }
}
```

## References

- Full error dictionary: https://www.twilio.com/docs/api/errors
- Debugging guide: https://www.twilio.com/docs/messaging/guides/debugging-common-issues
- Status callbacks: https://www.twilio.com/docs/sms/tutorials/how-to-confirm-delivery
