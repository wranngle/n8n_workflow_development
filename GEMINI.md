# GEMINI.md - n8n Workflow Development Context

## 1. Project Overview
This is a specialized development environment for **n8n workflows**, designed with a "Hook-Driven Architecture" originally intended for Claude Code. It features extensive knowledge bases (YouTube, Discord, Reddit), structured workflow management (Dev/Staging/Prod), and validaton protocols.

**Core Goal:** Create, validate, and deploy n8n workflow JSON files using a deterministic, high-quality process.

## 2. Gemini Adaptation (Crucial)
This project relies heavily on **MCP Servers** (`n8n-mcp`, `youtube`) and **Claude Hooks** (`.claude/hooks`). As Gemini, you likely **do not** have direct access to `mcp__*` tools or automatic hook execution.

**Your Role:** You must **manually simulate** the "Master Orchestrator" role defined in `PLAN-unified-architecture.md` and `CLAUDE.md`.

### Protocol Simulation
When a user asks to build or modify a workflow:
1.  **Acknowledge Intent:** Recognize this is a workflow task.
2.  **Consult the Master Protocol:** Refer to the logic in `.claude/skills/n8n-workflow-dev/SKILL.md` (conceptually).
3.  **Simulate Skills:** Instead of "invoking" a skill, **read the relevant `SKILL.md` file** to understand the rules and patterns for that step.
    *   *Pattern Selection:* Read `.claude/skills/n8n-workflow-patterns/SKILL.md`.
    *   *Node Config:* Read `.claude/skills/n8n-node-configuration/SKILL.md`.
    *   *Validation:* Read `.claude/skills/n8n-validation-expert/SKILL.md`.
4.  **Action:** Create or modify JSON files in `workflows/dev/`.

## 3. Workflow Development Lifecycle

**Standard Operating Procedure (SOP):**

1.  **Calibrate & Search:**
    *   Check `workflows/` for existing similar workflows.
    *   Search `context/youtube-knowledge/` (JSON files) for implementation details if needed.
    *   Search `context/workflow-patterns/` for architectural guidance.

2.  **Design & Build:**
    *   **Location:** Always start in `workflows/dev/`.
    *   **File Naming:** `kebab-case-descriptive.json` (e.g., `sync-hubspot-to-slack.json`).
    *   **Structure:** Follow the standard n8n JSON structure (Nodes, Connections, Settings, Meta).
    *   **Reference:** Use `workflows/dev/hello-world-minimal.json` as a structural template.

3.  **Validate (Manual/Simulated):**
    *   **Security:** Check for hardcoded credentials. **NEVER** write API keys directly into the JSON. Use n8n credential references (e.g., `credentials: { "slackApi": "id" }`).
    *   **Syntax:** Ensure JSON is valid.
    *   **Logic:** Verify node connections against `n8n-workflow-patterns`.

4.  **Deploy (File Management):**
    *   Move confirmed workflows to `workflows/staging/` or `workflows/production/` upon user request.

## 4. Key Directories & Files

*   **`workflows/`**: The core output directory.
    *   `dev/`: Workspace for active development.
    *   `staging/` & `production/`: Stable releases.
*   **`.claude/skills/`**: The "Brain" of the project. **Read these** to learn how to write good workflows.
    *   `n8n-workflow-patterns/`: Best practices for structure.
    *   `n8n-expression-syntax/`: Guide for `{{ $json.body.data }}` syntax.
*   **`context/`**: Knowledge bases.
    *   `youtube-knowledge/`: Indexed tutorials.
    *   `technical-research/`: Integration research reports.

## 5. Development Conventions

*   **Credentials:** All credentials must be managed via n8n's internal credential store. In JSON, they appear as references, not secrets.
*   **Expressions:** Use valid n8n JavaScript expressions. Be careful with `$json` vs `$node`.
*   **Node Versions:** Use recent but stable `typeVersion` for nodes (check existing workflows for examples).

## 6. CLI & Tools
Since you cannot use MCP tools:
*   **Searching:** Use `grep` (via `search_file_content`) to find node types or patterns in `context/` or existing workflows.
*   **Validation:** You must perform static analysis of the JSON file you create.
*   **n8n Interaction:** If the user provides a `curl` command or API key in the chat, you can use `run_shell_command` to interact with the n8n API. Otherwise, focus on **generating valid workflow files** for the user to import.
