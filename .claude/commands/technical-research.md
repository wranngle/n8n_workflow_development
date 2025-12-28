---
description: Research integration requirements for proposal labor estimation
---

# /technical-research - Integration Research for Proposal Estimation

Research automation/integration requirements from a business process description and output a structured markdown report for proposal labor estimation.

## Purpose

This command feeds the `wranngle-proposal-generator` with accurate technical details for effort estimation. Instead of generic "moderate" effort tiers, it provides:
- Actual complexity scores based on integration analysis
- Node count estimates based on workflow design
- Risk identification with mitigations
- Confidence-weighted uncertainty resolution

## Parameters

- `process`: Business process description (required)
  - Natural language description of what needs to be automated
  - Examples: "sync RingCentral calls to PipeDrive", "send Slack alerts on Stripe payment failures"

- `output`: Where to save the report (optional)
  - Default: `context/technical-research/{slugified-process}.md`
  - Can specify custom path

## Usage Examples

```
/technical-research process="sync RingCentral calls to PipeDrive"
/technical-research process="automate order entry from email to QuickBooks"
/technical-research process="send Slack alerts when Stripe payments fail" output="research/stripe-alerts.md"
```

---

## Execution Flow

### Step 1: Invoke Technical Researcher Agent

```javascript
Task({
  subagent_type: "technical-researcher",
  prompt: `Research this business process for proposal estimation:

"${process}"

Follow the 4-phase protocol (DETECT → RESEARCH → ANALYZE → UNCERTAINTIES).
Output the full markdown report per the template.
Be OPINIONATED - resolve uncertainties, don't just list them.`,
  description: "Research integration requirements"
})
```

### Step 2: Agent Executes Protocol

The technical-researcher agent runs:

**Phase 1: DETECT**
- Parse request for integrations
- Search n8n nodes for each
- Flag MIF (Missing Integration Flag)
- Identify trigger type

**Phase 2: RESEARCH**
- Run documentation waterfall for each integration
- Search for similar templates
- Check local knowledge bases

**Phase 3: ANALYZE**
- Score complexity factors (1-10)
- Map to effort tier
- Estimate node count
- Identify labor factors

**Phase 4: UNCERTAINTIES**
- Formulate questions
- **Preemptively answer them** with reasoning
- Provide recommendations

### Step 3: Save Report

```javascript
// Slugify process description
const slug = slugify(process);  // "sync-ringcentral-calls-to-pipedrive"

// Save to output location
Write({
  file_path: output || `context/technical-research/${slug}.md`,
  content: agentReport
})
```

---

## Output Format

The agent produces a structured markdown report:

```markdown
# Technical Research Report

**Business Process**: {description}
**Research Date**: {date}
**Researcher Confidence**: {HIGH|MEDIUM|LOW} ({percentage}%)

---

## Executive Summary
{2-3 sentences}

## Detected Integrations
| Integration | Native Node | Auth Type | Docs Available | Confidence |
|-------------|-------------|-----------|----------------|------------|

## Complexity Analysis
### Overall Score: {X}/10 → {effort_tier}
| Factor | Score | Rationale |
|--------|-------|-----------|

### Estimated Workflow Structure
{ASCII diagram}
**Estimated Nodes**: {N}

## Labor Factors
| Factor | Impact | Notes |
|--------|--------|-------|

## Risks & Mitigations
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|

## Uncertainties Resolved
### {Title}
**Confidence**: {X}%
**Question**: {what we didn't know}
**Researcher's Answer**: {preemptive answer}
**Recommendation**: {action}

## Similar Workflows Found
| Source | Name/ID | Relevance | Reusable |
|--------|---------|-----------|----------|

## Effort Recommendation
**Tier**: {trivial|moderate|complex|critical}
**Rationale**: {why}
**Caveats**: {conditions}
```

---

## Integration with Proposal Generator

The output maps to proposal generator inputs:

| Report Field | Proposal Generator Use |
|--------------|----------------------|
| `effort_tier` | → `recommended_fixes[].effort_tier` |
| `complexity_score` | → Risk assessment |
| `estimated_nodes` | → Scope validation |
| `risks` | → Proposal caveats section |
| `labor_factors` | → Milestone planning |

### Manual Review Checkpoint

The markdown report is designed for human review before feeding into the proposal generator. Reviewers should:
1. Validate the effort tier makes sense given the analysis
2. Check if uncertainties were properly resolved
3. Confirm no critical risks were missed
4. Adjust if client-specific factors apply

---

## Key Behaviors

1. **Opinionated**: The researcher makes calls, not just lists options
2. **Weighted**: Every claim has a confidence percentage
3. **Preemptive**: Uncertainties are answered, not left as questions
4. **Labor-focused**: All analysis ties to effort estimation

---

## File Locations

Reports are saved to:
```
context/technical-research/
├── sync-ringcentral-calls-to-pipedrive.md
├── automate-order-entry-email-quickbooks.md
└── slack-alerts-stripe-payment-failures.md
```

---

## Related Commands

- `/lookup-api` - Deep dive on a single API's documentation
- `/quick-node` - Fast node configuration lookup
- `/analyze-workflow` - Analyze an existing workflow
