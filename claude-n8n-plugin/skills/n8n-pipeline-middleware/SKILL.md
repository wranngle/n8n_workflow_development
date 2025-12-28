---
name: n8n-pipeline-middleware
description: Middleware layer for AI pipeline integration. Transforms raw LLM output into normalized workflow_context and n8n_node_config for downstream Audit and Proposal agents. Use when processing multimodal data through the sales engineering pipeline.
---

# n8n Pipeline Middleware

## SYSTEM CONTEXT

```
Raw Multimodal Data → LLM → [THIS AGENT] → AI Process Audit → AI Proposal
```

This skill lubricates data flow between pipeline stages.

## ROLE

Expert n8n Workflow Architect and Data Engineer focused on:
- Ingesting raw/semi-structured LLM output
- Normalizing to industry-agnostic schema
- Outputting clean context for downstream agents

## TERMINOLOGY PROTOCOL

**MANDATORY**: Never use industry-specific terms. Always normalize:

| Domain Term | Normalized Term |
|-------------|-----------------|
| patient, client, tenant, user | `entity` |
| lawsuit, case, ticket, order | `case` |
| department, team, division | `functional_unit` |
| surgery, service, product | `service_category` |
| payment, fee, cost, price | `transaction_value` |
| doctor, lawyer, agent | `service_provider` |
| hospital, firm, agency | `organization_unit` |
| appointment, meeting, session | `scheduled_event` |
| invoice, bill, statement | `financial_document` |
| contract, agreement, policy | `binding_document` |

## INPUT SCHEMA

Accept from upstream LLM:

```json
{
  "raw_input": "string (multimodal text description)",
  "input_modality": "text_unstructured | text_semi_structured | text_structured",
  "source_domain": "string (will be normalized)",
  "process_request": "audit | proposal | both"
}
```

## OUTPUT SCHEMA

Return for downstream agents:

```json
{
  "workflow_context": {
    "entity_type": "string (normalized)",
    "process_intent": "string (normalized)",
    "input_modality": "string",
    "normalization_status": "pending_transformation | ready_for_audit | error_flagged",
    "error_route": "string | null",
    "metadata": {}
  },
  "n8n_node_config": {
    "node_type": "string",
    "node_parameters": {},
    "code_logic": "string | null",
    "routing_logic": "string | null",
    "target_endpoint": "string | null"
  },
  "downstream_context": {
    "audit_ready": true,
    "proposal_ready": true,
    "required_enrichment": [],
    "suggested_nodes": []
  }
}
```

## TRANSFORMATION LOGIC

### Step 1: Detect Input Modality

```javascript
// n8n Code Node: Classify Input
const input = $json.raw_input;

const modality = {
  text_structured: /\{.*\}|<.*>|\|.*\|/s.test(input),
  text_semi_structured: /^[\w\s]+:/.test(input) || input.includes('\n-'),
  text_unstructured: true // fallback
};

const detected = Object.entries(modality).find(([k,v]) => v)?.[0];

return { json: { ...item.json, input_modality: detected } };
```

### Step 2: Normalize Domain Terms

```javascript
// n8n Code Node: Terminology Normalization
const TERM_MAP = {
  // Entity types
  patient: 'entity', client: 'entity', tenant: 'entity', customer: 'entity',
  // Case types
  lawsuit: 'case', ticket: 'case', order: 'case', request: 'case',
  // Units
  department: 'functional_unit', team: 'functional_unit', division: 'functional_unit',
  // Services
  surgery: 'service_category', treatment: 'service_category', consultation: 'service_category',
  // Financial
  payment: 'transaction_value', fee: 'transaction_value', cost: 'transaction_value'
};

let normalized = $json.raw_input;
for (const [term, replacement] of Object.entries(TERM_MAP)) {
  normalized = normalized.replace(new RegExp(`\\b${term}\\b`, 'gi'), replacement);
}

return { json: { ...$json, normalized_input: normalized } };
```

### Step 3: Route by Process Intent

```javascript
// n8n Switch Node Configuration
{
  "rules": [
    { "value": "audit", "output": 0 },
    { "value": "proposal", "output": 1 },
    { "value": "both", "output": 2 }
  ],
  "fallbackOutput": 3
}
```

### Step 4: Generate Context Envelope

```javascript
// n8n Code Node: Build Output Schema
const workflow_context = {
  entity_type: detectEntityType($json.normalized_input),
  process_intent: $json.process_request,
  input_modality: $json.input_modality,
  normalization_status: $json.has_errors ? 'error_flagged' : 'ready_for_audit',
  error_route: $json.has_errors ? 'error_handler_webhook' : null,
  metadata: {
    original_domain: $json.source_domain,
    timestamp: new Date().toISOString(),
    pipeline_stage: 'middleware_complete'
  }
};

const n8n_node_config = {
  node_type: determineNodeType($json),
  node_parameters: buildParameters($json),
  target_endpoint: $json.process_request === 'audit'
    ? 'audit_agent_webhook'
    : 'proposal_agent_webhook'
};

return {
  json: {
    workflow_context,
    n8n_node_config,
    downstream_context: {
      audit_ready: true,
      proposal_ready: $json.process_request !== 'audit',
      required_enrichment: [],
      suggested_nodes: []
    }
  }
};
```

## ERROR HANDLING

```javascript
// Error routing structure
{
  "error_types": {
    "normalization_failed": "route to manual_review_queue",
    "modality_unknown": "route to classification_enrichment",
    "context_incomplete": "route to context_gathering_agent"
  },
  "fallback": "route to human_escalation_webhook"
}
```

## EXAMPLE TRANSFORMATIONS

### Input: Dental Clinic Scheduling
```json
{
  "raw_input": "Dental clinic needs patient scheduling workflow audit",
  "source_domain": "healthcare",
  "process_request": "audit"
}
```

### Output:
```json
{
  "workflow_context": {
    "entity_type": "service_provider_small_business",
    "process_intent": "resource_scheduling",
    "input_modality": "text_unstructured",
    "normalization_status": "ready_for_audit"
  },
  "n8n_node_config": {
    "node_type": "Code",
    "code_logic": "return {json: {standardized_request: $json.input, timestamp: new Date()}}"
  }
}
```

### Input: Legal Contract Analysis
```json
{
  "raw_input": "Law firm requires contract analysis for proposal generation",
  "source_domain": "legal",
  "process_request": "proposal"
}
```

### Output:
```json
{
  "workflow_context": {
    "entity_type": "professional_services_firm",
    "process_intent": "document_analysis",
    "input_modality": "text_structured",
    "normalization_status": "ready_for_audit"
  },
  "n8n_node_config": {
    "node_type": "HTTP Request",
    "target_endpoint": "proposal_agent_webhook"
  }
}
```

## INTEGRATION HOOKS

### Upstream (from LLM):
- Webhook trigger accepts POST with raw_input
- Validates required fields before processing

### Downstream (to Audit/Proposal):
- HTTP Request nodes call agent webhooks
- Include full workflow_context in body
- Set appropriate headers for agent identification

## FRICTION POINTS ADDRESSED

| Friction | Lubrication |
|----------|-------------|
| Industry jargon varies | Terminology protocol normalizes all |
| Input structure varies | Modality detection classifies automatically |
| Downstream expects schema | Output schema is fixed, predictable |
| Errors block pipeline | Error routing keeps flow moving |
| Context gets lost | Metadata preserves original domain info |
