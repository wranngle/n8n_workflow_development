# Technical Research Report

**Business Process**: Sync RingCentral calls to PipeDrive CRM
**Research Date**: 2025-12-20
**Researcher Confidence**: HIGH (85%)

---

## Executive Summary

This integration syncs call logs from RingCentral VoIP to PipeDrive CRM activities. Moderately complex due to RingCentral lacking a native n8n node (MIF=true), requiring HTTP Request nodes with OAuth2 authentication. PipeDrive has full native node support. Similar workflows exist in templates, and both APIs are well-documented with webhook support.

---

## Detected Integrations

| Integration | Native Node | Auth Type | Docs Available | Confidence |
|-------------|-------------|-----------|----------------|------------|
| RingCentral | No (MIF) | OAuth2 + JWT | Yes | 90% |
| PipeDrive | Yes | API Token | Yes | 95% |

---

## Complexity Analysis

### Overall Score: 6/10 → moderate

| Factor | Score (1-10) | Rationale |
|--------|--------------|-----------|
| API Complexity | 5 | Both APIs well-documented, standard REST |
| Auth Complexity | 7 | RingCentral OAuth2 + JWT is non-trivial |
| Data Transformation | 5 | Phone normalization, outcome mapping |
| Error Handling Needs | 6 | Retry logic for webhooks, deduplication |
| Documentation Quality | 8 | Excellent docs for both platforms |

### Estimated Workflow Structure

```
[Schedule 15m] → [Get RC Token] → [Fetch Calls] → [Has Records?]
                                                       ↓ Yes
                                    [Split] → [Transform] → [Create Activity]
                                       ↓ No
                                   [No Calls]
```

**Estimated Nodes**: 8

---

## Labor Factors

| Factor | Impact | Notes |
|--------|--------|-------|
| Native n8n support | Medium | PipeDrive native, RingCentral needs HTTP |
| Auth setup time | High | RingCentral OAuth requires app registration |
| Testing complexity | Medium | Need test RingCentral account with calls |
| Maintenance burden | Low | Stable APIs, webhook-based sync |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| RingCentral token expiry | M | M | Implement token refresh before calls |
| Phone number matching fails | M | L | Use E.164 normalization, fuzzy matching |
| Duplicate call logs | L | M | Store RC session ID in custom field |
| Recording download timeout | L | L | Delay fetch 30s, retry 3x |

---

## Uncertainties Resolved

### RingCentral Native Node Availability

**Confidence**: 95%

**Question**: Does n8n have a native RingCentral node that would simplify auth?

**Researcher's Answer**: No. Confirmed via `mcp__n8n-mcp__search_nodes` - no results for "ringcentral". Community has requested this (Ideas portal #49969779) but no timeline. Must use HTTP Request with OAuth2 credentials.

**Recommendation**: Build using HTTP Request node with genericCredentialType=OAuth2. This is a proven pattern for VoIP integrations.

---

### Webhook vs Polling Architecture

**Confidence**: 80%

**Question**: Should we use webhooks for real-time sync or polling for simplicity?

**Researcher's Answer**: RingCentral supports webhooks (`/subscription` endpoint for `telephony.session-end`), but they require validation endpoint setup and add complexity. For a 15-minute sync interval, polling the Call Log Sync API is simpler and sufficient.

**Recommendation**: Start with polling (lower complexity). Add webhooks later if real-time sync becomes a requirement.

---

### Contact Matching Strategy

**Confidence**: 75%

**Question**: How to match incoming calls to PipeDrive contacts reliably?

**Researcher's Answer**: Phone numbers must be normalized to E.164 format before matching. PipeDrive's person search API accepts partial matches. Strategy: exact E.164 match → partial (last 10 digits) → caller name fallback → create new contact.

**Recommendation**: Implement E.164 normalization in Code node using `libphonenumber` pattern. Accept 80% auto-match rate, log unmatched for manual review.

---

## Similar Workflows Found

| Source | Name/ID | Relevance | Reusable Elements |
|--------|---------|-----------|-------------------|
| Built in session | ringcentral-to-pipedrive | 100% | Full workflow exists in repo |
| Zapier | RingCentral→PipeDrive | 60% | Trigger pattern |
| Make.com | RingCentral modules | 50% | Auth flow reference |

---

## Effort Recommendation

**Tier**: moderate

**Rationale**:
- 6/10 complexity score driven by RingCentral OAuth setup (MIF=true)
- 8 nodes estimated, within moderate range
- Both APIs well-documented with examples
- Similar workflow already built as reference

**Caveats**:
- Could upgrade to "complex" if real-time webhooks required
- Could downgrade to "trivial" if native RingCentral node released
- Assumes client has RingCentral developer account access
