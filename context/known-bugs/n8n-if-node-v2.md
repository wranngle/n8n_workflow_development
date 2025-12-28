# n8n IF Node v2.2 Known Bug

## Issue Summary
The n8n IF node with `typeVersion: 2` and `typeValidation: "strict"` has documented bugs where string comparisons may route incorrectly to the TRUE branch regardless of actual comparison result.

## GitHub Issues
* [#12237](https://github.com/n8n-io/n8n/issues/12237) IF node returns true/false wrongly
* [#11877](https://github.com/n8n-io/n8n/issues/11877) Code node doesn't show input data via false branch
* [#21334](https://github.com/n8n-io/n8n/issues/21334) Problem in IF/Switch node

## Symptoms
* IF node evaluates `"skip_crm" === "update_crm"` as TRUE
* Data always routes to output 0 (TRUE branch) regardless of condition
* Deactivating/reactivating workflow does not fix the issue
* Boolean and string comparisons both affected

## Canonical Solution
**ALWAYS use Switch node instead of IF node for routing decisions**

```json
{
  "type": "n8n-nodes-base.switch",
  "typeVersion": 3,
  "parameters": {
    "mode": "rules",
    "rules": {
      "values": [
        {
          "outputKey": "route_a",
          "conditions": {
            "conditions": [{"leftValue": "={{ $json.route_decision }}", "rightValue": "route_a", "operator": {"type": "string", "operation": "equals"}}]
          }
        },
        {
          "outputKey": "route_b", 
          "conditions": {
            "conditions": [{"leftValue": "={{ $json.route_decision }}", "rightValue": "route_b", "operator": {"type": "string", "operation": "equals"}}]
          }
        }
      ]
    }
  }
}
```

## Prevention Pattern
1. Use explicit string `route_decision` field in Code node output
2. Use Switch node with named outputs matching route values
3. Never use IF node for critical routing logic

## Discovery Date
2025-12-27 (Wranngle commercial pipeline)

## Affected Workflow
`elevenlabs-call-completed.json` (n8n ID: cEORduJCqCVDOKce)
