# PLAN: Unified Hook-Driven Architecture v2.0

**Problem**: 7 overlapping systems with no single source of truth, hooks output text that gets ignored, skills never invoked.

**Solution**: Merge everything into one hook-driven deterministic flow where hooks FORCE skill invocation.

---

## PART 1: CURRENT STATE ANALYSIS (What We Have)

### 1.1 File Inventory (87 files analyzed)

#### Hooks (8 files) - THE FOUNDATION
| File | Hook Event | Current Behavior | Problem |
|------|------------|------------------|---------|
| `detect-workflow-intent.js` | UserPromptSubmit | Outputs text reminder | Text gets ignored |
| `session-init.js` | SessionStart | Checks n8n health, creates dirs | Works well |
| `pre-deploy-check.js` | PreToolUse (create_workflow) | Unknown | Not verified |
| `post-deploy-log.js` | PostToolUse (create/update) | Logs deployments | Works |
| `workflow-file-guard.js` | PreToolUse (Write) | Guards workflow files | Works |
| `auto-git-stage.js` | PostToolUse (Write) | Auto-stages changes | Works |
| `analyze-before-build.js` | NOT WIRED | Utility module only | Orphaned code |
| `hook-utils.js` | N/A | Shared utilities | Works |

#### Skills (8 directories, 24 files) - THE KNOWLEDGE
| Skill | Purpose | Currently Used? |
|-------|---------|-----------------|
| `n8n-workflow-dev` | Master protocol | NO - never invoked |
| `n8n-workflow-patterns` | 5 core patterns | NO - never invoked |
| `n8n-validation-expert` | Error interpretation | NO - never invoked |
| `n8n-mcp-tools-expert` | Tool selection | NO - never invoked |
| `n8n-expression-syntax` | Expression writing | NO - never invoked |
| `n8n-node-configuration` | Node config | NO - never invoked |
| `n8n-code-javascript` | Code node patterns | NO - never invoked |
| `n8n-code-python` | Python code | NO - never invoked |

#### Commands (10 files) - THE SHORTCUTS
| Command | Purpose | Duplicates |
|---------|---------|------------|
| `/workflow` | 10-stage lifecycle | RUNBOOK.md |
| `/new-workflow` | 7-step process | Subset of /workflow |
| `/preflight` | System checks | Session-init hook |
| `/validate` | Validation | Skill: n8n-validation-expert |
| `/deploy` | Deployment | Stage 9 of /workflow |
| `/search-library` | Search workflows | Skill: n8n-workflow-dev |
| `/quick-node` | Node lookup | Skill: n8n-mcp-tools-expert |
| `/lookup-api` | API docs | Documentation waterfall |
| `/screenshot-to-workflow` | Screenshot conversion | Agent capability |
| `/analyze-workflow` | Workflow analysis | analyze-before-build.js |

#### Agents (9 files) - THE SPECIALISTS
| Agent | Purpose | Overlaps |
|-------|---------|----------|
| `n8n-workflow-architect` | Build workflows | Skills + CLAUDE.md |
| `code-reviewer` | Review code | Generic |
| `context-manager` | Manage context | Generic |
| `debugger` | Debug issues | Generic |
| `deployment-engineer` | CI/CD | Generic |
| `mcp-backend-engineer` | MCP work | Generic |
| `n8n-mcp-tester` | Test MCP tools | Specific |
| `technical-researcher` | Research | Generic |
| `test-automator` | Write tests | Generic |

#### Knowledge Bases (context/) - THE DATA
| Directory | Contents | Utilized? |
|-----------|----------|-----------|
| `youtube-knowledge/` | 10,279 videos indexed | Partially (Step 2 in CLAUDE.md) |
| `discord-knowledge/` | 2,930 Q&A indexed | Partially (Step 3 in CLAUDE.md) |
| `reddit-knowledge/` | Protocol only | Partially (Step 4 in CLAUDE.md) |
| `api-docs/` | Cached docs | Empty README only |
| `workflow-patterns/` | Analysis files | Not referenced |
| `n8n-mcp-knowledge.md` | MCP insights | Not referenced |
| `knowledge-seed.md` | Initial context | Not referenced |

#### Root Documents - THE CONFLICTING PROTOCOLS
| File | Purpose | Problem |
|------|---------|---------|
| `CLAUDE.md` | Master playbook + Calibration Engine | Has Steps 0-7, no build step |
| `RUNBOOK.md` | 10-stage lifecycle | Duplicates /workflow command |
| `INVENTORY.md` | Asset inventory | Outdated |
| `CONTRIBUTING.md` | Contribution guide | Basic |
| `README.md` | Project readme | Unknown state |

### 1.2 The Core Problem: 7 Competing Protocols

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ USER: "Build a workflow that..."                                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ HOOK: detect-workflow-intent.js                                             │
│ OUTPUT: "🔍 Search first: list_workflows → search_templates → list_tasks"  │
│ RESULT: Claude ignores this and does whatever it wants                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────────────┐
                    ▼                                       ▼
    ┌───────────────────────────────┐       ┌───────────────────────────────┐
    │ IF Claude reads CLAUDE.md:    │       │ IF Claude doesn't read it:    │
    │ - Calibration Engine (0-7)    │       │ - Random behavior             │
    │ - But no build step!          │       │ - Skills never invoked        │
    │ - Skills never invoked        │       │ - Duplicate work              │
    └───────────────────────────────┘       └───────────────────────────────┘
```

### 1.3 Why Hooks Are Essential

**User Quote**: "I have proof that non-hook based Claude Code requests will ignore complex instructions"

Hooks are the ONLY reliable mechanism to:
1. Intercept user prompts BEFORE Claude processes them
2. Inject mandatory instructions that Claude CANNOT skip
3. Gate tool usage (PreToolUse) to enforce validation
4. Track actions (PostToolUse) for logging

**Without hooks**: Claude may or may not follow CLAUDE.md instructions
**With hooks**: Claude receives mandatory systemMessage every time

---

## PART 2: UNIFIED ARCHITECTURE DESIGN

### 2.1 Design Principles

1. **Single Source of Truth**: One master protocol, everything else references it
2. **Hook-Driven**: Hooks FORCE skill invocation, not optional
3. **Deterministic**: Same input → same protocol → same output
4. **Composable Skills**: Skills are modules called at specific steps
5. **No Duplication**: Delete redundant files, consolidate remaining

### 2.2 The New Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ USER: "Build a workflow that..."                                            │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ HOOK: detect-workflow-intent.js (ENHANCED)                                  │
│                                                                             │
│ DETECTION: Keywords [workflow, n8n, automation, webhook, trigger...]        │
│                                                                             │
│ OUTPUT: {                                                                   │
│   continue: true,                                                           │
│   systemMessage: `                                                          │
│     ⚠️ WORKFLOW REQUEST DETECTED                                            │
│     ━━━━━━━━━━━━━━━━━━━━━━━━━━                                              │
│     MANDATORY: You MUST invoke Skill("n8n-workflow-dev") NOW.               │
│     DO NOT proceed without invoking this skill.                             │
│     DO NOT attempt to build workflows manually.                             │
│     The skill contains the complete protocol.                               │
│   `                                                                         │
│ }                                                                           │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ SKILL: n8n-workflow-dev (MASTER ORCHESTRATOR)                               │
│                                                                             │
│ This skill IS the unified protocol. It contains:                            │
│ - Calibration Engine (research + complexity estimation)                     │
│ - Design Protocol (pattern selection + template analysis)                   │
│ - Build Protocol (node configuration + assembly)                            │
│ - Validation Protocol (iterative validation)                                │
│ - Deployment Protocol (test → stage → production)                           │
│                                                                             │
│ At each phase, it invokes OTHER skills deterministically.                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│ PHASE 1       │         │ PHASE 2       │         │ PHASE 3       │
│ CALIBRATE     │         │ DESIGN        │         │ BUILD         │
│               │         │               │         │               │
│ Steps 0-7     │         │ Steps 8-10    │         │ Steps 11-14   │
│ Search all    │         │ Pattern +     │         │ Configure +   │
│ knowledge     │         │ Template      │         │ Assemble      │
│ bases         │         │ Analysis      │         │ JSON          │
│               │         │               │         │               │
│ Invokes:      │         │ Invokes:      │         │ Invokes:      │
│ - YouTube KB  │         │ - patterns    │         │ - node-config │
│ - Discord KB  │         │ - mcp-tools   │         │ - mcp-tools   │
│ - Reddit KB   │         │               │         │ - expressions │
│ - MCP tools   │         │               │         │ - code-js     │
└───────────────┘         └───────────────┘         └───────────────┘
        │                           │                           │
        └───────────────────────────┼───────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌───────────────┐         ┌───────────────┐         ┌───────────────┐
│ PHASE 4       │         │ PHASE 5       │         │ PHASE 6       │
│ VALIDATE      │         │ TEST          │         │ DEPLOY        │
│               │         │               │         │               │
│ Steps 15-16   │         │ Steps 17-18   │         │ Steps 19-21   │
│ Iterative     │         │ Dev instance  │         │ Stage + Prod  │
│ validation    │         │ testing       │         │ + Git         │
│               │         │               │         │               │
│ Invokes:      │         │ Triggers:     │         │ Triggers:     │
│ - validation  │         │ - MCP create  │         │ - pre-deploy  │
│ - expressions │         │ - MCP trigger │         │ - post-deploy │
└───────────────┘         └───────────────┘         └───────────────┘
```

### 2.3 File Consolidation Plan

#### DELETE (Redundant)
```
.claude/commands/workflow.md          → Duplicates RUNBOOK, use skill instead
.claude/commands/new-workflow.md      → Subset of workflow, use skill instead
.claude/commands/preflight.md         → Duplicates session-init hook
.claude/commands/validate.md          → Use skill instead
.claude/commands/deploy.md            → Use skill instead
.claude/commands/search-library.md    → Use skill instead
RUNBOOK.md                            → Merge into skill, delete file
scripts/n8n-workflow-skill.md         → Orphaned draft, delete
```

#### KEEP & ENHANCE
```
.claude/hooks/detect-workflow-intent.js  → ENHANCE to force skill invocation
.claude/hooks/session-init.js            → Keep as-is
.claude/hooks/pre-deploy-check.js        → Keep, verify functionality
.claude/hooks/post-deploy-log.js         → Keep as-is
.claude/hooks/workflow-file-guard.js     → Keep as-is
.claude/hooks/auto-git-stage.js          → Keep as-is
.claude/hooks/analyze-before-build.js    → Wire into settings.json or delete

.claude/skills/n8n-workflow-dev/         → REWRITE as master orchestrator
.claude/skills/n8n-workflow-patterns/    → Keep, called by master skill
.claude/skills/n8n-validation-expert/    → Keep, called by master skill
.claude/skills/n8n-mcp-tools-expert/     → Keep, called by master skill
.claude/skills/n8n-expression-syntax/    → Keep, called by master skill
.claude/skills/n8n-node-configuration/   → Keep, called by master skill
.claude/skills/n8n-code-javascript/      → Keep, called by master skill
.claude/skills/n8n-code-python/          → Keep, called by master skill

.claude/commands/quick-node.md           → Keep as shortcut
.claude/commands/lookup-api.md           → Keep as shortcut
.claude/commands/screenshot-to-workflow.md → Keep as shortcut
.claude/commands/analyze-workflow.md     → Keep as shortcut

.claude/agents/n8n-workflow-architect.md → REWRITE to invoke skill
.claude/agents/*                         → Keep generic agents

CLAUDE.md                                → REWRITE to reference skill system
context/*                                → Keep all knowledge bases
```

### 2.4 The 21-Step Unified Protocol

Located in: `.claude/skills/n8n-workflow-dev/SKILL.md`

```
PHASE 1: CALIBRATE (Complexity Estimation)
──────────────────────────────────────────
Step 0:  PARSE INPUT → Search Vector
Step 0.5: VERIFY NODES → MIF Detection + Gap Research
Step 1:  SEARCH INSTANCE → n8n_list_workflows
Step 2:  SEARCH YOUTUBE → context/youtube-knowledge/
Step 3:  SEARCH DISCORD → context/discord-knowledge/
Step 4:  SEARCH REDDIT → mcp__reddit tools
Step 5:  SEARCH COMMUNITY → GitHub Zie619 API
Step 6:  SEARCH TEMPLATES → mcp__n8n-mcp__search_templates
Step 7:  CALCULATE METRICS → TAS, RNC, MIF, Risk

PHASE 2: DESIGN (Architecture)
──────────────────────────────
Step 8:  SELECT PATTERN → Invoke Skill(n8n-workflow-patterns)
Step 9:  RETRIEVE TEMPLATE → get_template + deep analysis
Step 10: MAP REQUIREMENTS → Gap analysis + implementation plan

PHASE 3: BUILD (Construction)
─────────────────────────────
Step 11: CONFIGURE NODES → Invoke Skill(n8n-node-configuration)
Step 12: WRITE EXPRESSIONS → Invoke Skill(n8n-expression-syntax)
Step 13: WRITE CODE NODES → Invoke Skill(n8n-code-javascript)
Step 14: ASSEMBLE WORKFLOW → JSON construction

PHASE 4: VALIDATE (Quality)
───────────────────────────
Step 15: VALIDATE ITERATIVELY → Invoke Skill(n8n-validation-expert)
Step 16: SECURITY CHECKLIST → Hardcoded keys, credentials, PII

PHASE 5: TEST (Verification)
────────────────────────────
Step 17: SAVE TO DEV → workflows/dev/{name}.json
Step 18: DEPLOY TO TEST → n8n_create_workflow + test execution

PHASE 6: DEPLOY (Production)
────────────────────────────
Step 19: STAGE FOR REVIEW → workflows/staging/ + approval
Step 20: PRODUCTION DEPLOY → Trigger pre-deploy hook + deploy
Step 21: ARCHIVE & DOCUMENT → workflows/production/ + git tag
```

---

## PART 3: IMPLEMENTATION PLAN

### 3.1 Phase 1: Hook Enhancement (Critical Path)

**File**: `.claude/hooks/detect-workflow-intent.js`

**Changes**:
1. Enhance keyword detection with Calibration Engine's Search Vector concept
2. Output MANDATORY skill invocation instruction
3. Include session context (n8n status, workflow count)
4. Log to enable debugging

**New Output Format**:
```javascript
outputResult({
  continue: true,
  systemMessage: `
⚠️ WORKFLOW REQUEST DETECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You MUST invoke Skill("n8n-workflow-dev") IMMEDIATELY.

DO NOT:
- Skip this instruction
- Build workflows manually
- Use MCP tools directly without the skill

The skill contains the complete 21-step protocol:
1. CALIBRATE - Search all knowledge bases, estimate complexity
2. DESIGN - Select pattern, analyze templates
3. BUILD - Configure nodes, assemble JSON
4. VALIDATE - Iterative validation, security checklist
5. TEST - Dev deployment, execution testing
6. DEPLOY - Stage, production, git archive

Session Context:
- n8n Instance: ${n8nUp ? '✅ Online' : '⚠️ Offline'}
- Local Workflows: ${workflowCount}
- Knowledge Bases: YouTube (10,279), Discord (2,930), Templates (2,709)

Invoke the skill now: Skill("n8n-workflow-dev")
`
});
```

### 3.2 Phase 2: Master Skill Rewrite

**File**: `.claude/skills/n8n-workflow-dev/SKILL.md`

**Structure**:
```markdown
---
name: n8n-workflow-dev
description: [Updated with full capability list]
---

# n8n Workflow Development Protocol

## Preamble
This skill is the SINGLE SOURCE OF TRUTH for n8n workflow development.
It orchestrates the complete 21-step protocol from intent to production.

## Phase 1: CALIBRATE (Steps 0-7)
[Merge Calibration Engine from CLAUDE.md]
[Reference knowledge bases explicitly]
[Include Search Vector concept]

## Phase 2: DESIGN (Steps 8-10)
[Pattern selection: Invoke Skill(n8n-workflow-patterns)]
[Template analysis protocol]
[Implementation plan generation]

## Phase 3: BUILD (Steps 11-14)
[Node configuration: Invoke Skill(n8n-node-configuration)]
[Expression writing: Invoke Skill(n8n-expression-syntax)]
[Code nodes: Invoke Skill(n8n-code-javascript)]
[JSON assembly protocol]

## Phase 4: VALIDATE (Steps 15-16)
[Validation loop: Invoke Skill(n8n-validation-expert)]
[Security checklist]

## Phase 5: TEST (Steps 17-18)
[Dev deployment protocol]
[Test execution protocol]

## Phase 6: DEPLOY (Steps 19-21)
[Staging protocol]
[Production deployment]
[Git archival]

## Knowledge Base References
- YouTube: context/youtube-knowledge/video-index.json (10,279 videos)
- Discord: context/discord-knowledge/discord-questions.json (2,930 Q&A)
- Reddit: mcp__reddit tools
- Community: GitHub Zie619 (4,343 workflows)
- Templates: mcp__n8n-mcp (2,709 templates)
- Patterns: context/workflow-patterns/

## Skill Invocation Map
| Step | Condition | Skill to Invoke |
|------|-----------|-----------------|
| 8 | Always | n8n-workflow-patterns |
| 11 | Always | n8n-node-configuration |
| 11 | Using MCP tools | n8n-mcp-tools-expert |
| 12 | Has expressions | n8n-expression-syntax |
| 13 | Has Code nodes | n8n-code-javascript |
| 15 | Always | n8n-validation-expert |
```

### 3.3 Phase 3: CLAUDE.md Update

**Changes**:
1. Remove Calibration Engine (moved to skill)
2. Add "Hook-Driven Architecture" section
3. Reference skill as the master protocol
4. Keep only:
   - Repository structure
   - Tool registry
   - Environment configuration
   - Known limitations

**New Structure**:
```markdown
# CLAUDE.md - n8n Workflow Development Command Center

## Hook-Driven Architecture
This repository uses hooks to FORCE deterministic behavior.
When a workflow request is detected, the hook outputs a MANDATORY
instruction to invoke Skill("n8n-workflow-dev").

The skill contains the complete 21-step protocol. DO NOT bypass it.

## Repository Structure
[Keep existing]

## Tool Registry
[Keep existing]

## Environment Configuration
[Keep existing]

## Known Limitations
[Keep existing]

## Skills Reference
The protocol is implemented in skills, not this file.
Master skill: .claude/skills/n8n-workflow-dev/SKILL.md
```

### 3.4 Phase 4: Command Cleanup

**Delete**:
- workflow.md (use skill)
- new-workflow.md (use skill)
- preflight.md (session-init hook does this)
- validate.md (use skill)
- deploy.md (use skill)
- search-library.md (use skill)

**Keep & Update**:
- quick-node.md → Add "Or use Skill(n8n-mcp-tools-expert)"
- lookup-api.md → Keep as documentation waterfall shortcut
- screenshot-to-workflow.md → Keep as specialized command
- analyze-workflow.md → Keep, uses analyze-before-build.js

### 3.5 Phase 5: Agent Update

**File**: `.claude/agents/n8n-workflow-architect.md`

**Changes**:
```markdown
---
name: n8n-workflow-architect
description: [Same triggers, but now invokes skill]
---

You are n8n-workflow-architect. Your FIRST action for ANY workflow
request is to invoke Skill("n8n-workflow-dev").

DO NOT build workflows without the skill.
The skill contains the complete 21-step protocol.

After invoking the skill, follow its instructions exactly.
```

### 3.6 Phase 6: Wire analyze-before-build.js

**Option A**: Add to settings.json as PreToolUse hook for n8n_create_workflow
**Option B**: Have skill call it programmatically
**Option C**: Delete if unused

**Recommendation**: Option A - wire into settings.json

### 3.7 Phase 7: Settings.json Update

Add analyze-before-build.js to the hook chain:
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "mcp__n8n-mcp__n8n_create_workflow",
        "hooks": [
          {
            "type": "command",
            "command": "node .claude/hooks/analyze-before-build.js",
            "timeout": 5
          },
          {
            "type": "command",
            "command": "node .claude/hooks/pre-deploy-check.js",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

---

## PART 4: FILE-BY-FILE UTILIZATION MAP

Every file in the repository now has a clear role:

### Hooks (Deterministic Enforcement)
| File | Role in Unified Protocol |
|------|--------------------------|
| detect-workflow-intent.js | GATE: Forces skill invocation |
| session-init.js | INIT: Prepares session state |
| pre-deploy-check.js | GATE: Validates before deploy |
| post-deploy-log.js | LOG: Records deployments |
| workflow-file-guard.js | GATE: Protects workflow files |
| auto-git-stage.js | LOG: Auto-stages changes |
| analyze-before-build.js | GATE: Analyzes workflow structure |
| hook-utils.js | UTIL: Shared helpers |

### Skills (Protocol Modules)
| Skill | Role | Invoked At Step |
|-------|------|-----------------|
| n8n-workflow-dev | MASTER: Orchestrates all steps | Step 0 (start) |
| n8n-workflow-patterns | MODULE: Pattern selection | Step 8 |
| n8n-mcp-tools-expert | MODULE: MCP tool usage | Steps 1-7, 11 |
| n8n-node-configuration | MODULE: Node config | Step 11 |
| n8n-expression-syntax | MODULE: Expression writing | Step 12 |
| n8n-code-javascript | MODULE: Code nodes | Step 13 |
| n8n-code-python | MODULE: Python (rare) | Step 13 |
| n8n-validation-expert | MODULE: Validation loop | Step 15 |

### Commands (Shortcuts)
| Command | Maps To |
|---------|---------|
| /quick-node | Direct to n8n-mcp-tools-expert |
| /lookup-api | Documentation waterfall |
| /screenshot-to-workflow | Specialized conversion |
| /analyze-workflow | Uses analyze-before-build.js |

### Knowledge Bases (Data Sources)
| Location | Used At Step |
|----------|--------------|
| context/youtube-knowledge/ | Step 2 |
| context/discord-knowledge/ | Step 3 |
| context/reddit-knowledge/ | Step 4 |
| context/workflow-patterns/ | Step 8 |
| context/api-docs/ | Step 10 (new APIs) |
| context/n8n-mcp-knowledge.md | Reference |

### Root Documents (Reference)
| File | Purpose |
|------|---------|
| CLAUDE.md | Architecture reference, tool registry |
| INVENTORY.md | Asset tracking (update after changes) |
| CONTRIBUTING.md | Contribution guide |
| README.md | Project overview |

### Workflow Storage (Artifacts)
| Directory | Used At Step |
|-----------|--------------|
| workflows/dev/ | Step 17 |
| workflows/staging/ | Step 19 |
| workflows/production/ | Step 21 |

---

## PART 5: EXECUTION SEQUENCE

### Order of Implementation

1. **detect-workflow-intent.js** (CRITICAL)
   - Must be done first
   - Everything depends on this forcing skill invocation

2. **n8n-workflow-dev/SKILL.md** (CRITICAL)
   - Rewrite as master orchestrator
   - Include all 21 steps
   - Add skill invocation map

3. **CLAUDE.md** (HIGH)
   - Simplify to reference skill
   - Remove Calibration Engine (moved to skill)

4. **settings.json** (HIGH)
   - Wire analyze-before-build.js
   - Verify all hooks are configured

5. **Delete redundant commands** (MEDIUM)
   - workflow.md, new-workflow.md, preflight.md, etc.

6. **Update remaining commands** (MEDIUM)
   - Add skill references

7. **Update n8n-workflow-architect agent** (MEDIUM)
   - Force skill invocation

8. **Delete RUNBOOK.md** (LOW)
   - After skill has all content

9. **Update INVENTORY.md** (LOW)
   - Reflect new architecture

### Estimated Effort
- Phase 1 (Hook): 30 minutes
- Phase 2 (Skill): 2 hours
- Phase 3 (CLAUDE.md): 1 hour
- Phase 4 (Commands): 30 minutes
- Phase 5 (Agent): 15 minutes
- Phase 6-7 (Settings): 15 minutes

**Total**: ~4.5 hours

---

## PART 6: SUCCESS CRITERIA

After implementation:

1. **Hook Test**: Any prompt with "workflow", "n8n", "automation" triggers skill invocation instruction
2. **Skill Test**: Skill("n8n-workflow-dev") executes complete 21-step protocol
3. **No Manual Building**: Claude cannot build workflows without going through skill
4. **All Files Utilized**: Every file has a clear role, no orphans
5. **No Duplication**: Single protocol, referenced everywhere
6. **Deterministic Output**: Same request → same steps → predictable result

---

## PART 7: RISKS AND MITIGATIONS

| Risk | Mitigation |
|------|------------|
| Hook output still ignored | Make message more emphatic, test with user |
| Skill too long, gets truncated | Split into phases, reference sub-files |
| Breaking existing workflows | Git branch, test before merge |
| Knowledge bases outdated | Schedule periodic updates |
| Claude doesn't invoke skills | Add more explicit language in hook output |

---

*Plan Version: 1.0*
*Created: 2025-12-17*
*Status: Ready for Review*
