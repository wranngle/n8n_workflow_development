# Git Integration for n8n Workflow Version Control

## Overview
All workflow changes should be tracked in git for:
- Version history
- Rollback capability  
- Collaboration
- Audit trail

## Repository Structure

```
n8n/
├── workflows/
│   ├── dev/           # Development workflows (git tracked)
│   ├── staging/       # Pre-production (git tracked)
│   └── production/    # Production exports (git tracked)
├── .gitignore
└── ...
```

## .gitignore Configuration

```gitignore
# Environment files
.env
.env.local
*.env

# Credentials (NEVER commit)
*credentials*.json
*secrets*

# Temporary files
*.tmp
*.bak

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Node modules (if any scripts)
node_modules/
```

## Commit Message Convention

Format:
```
[n8n] {action}: {workflow-name} - {description}
```

Actions:
- `create` - New workflow
- `update` - Modify existing workflow
- `deploy` - Deploy to production
- `fix` - Bug fix
- `refactor` - Code improvement without behavior change
- `disable` - Deactivate workflow
- `delete` - Remove workflow

Examples:
```
[n8n] create: slack-notifier - Webhook to Slack notification workflow
[n8n] update: data-sync - Add error handling and retry logic
[n8n] deploy: customer-onboarding - Production deployment v1.2
[n8n] fix: invoice-generator - Correct date formatting
```

## Workflow Lifecycle in Git

### 1. Development
```bash
# Create new workflow
git checkout -b workflow/new-feature-name

# Save workflow to dev/
# workflows/dev/new-feature.json

git add workflows/dev/new-feature.json
git commit -m "[n8n] create: new-feature - Initial implementation"
```

### 2. Testing & Staging
```bash
# After testing passes
cp workflows/dev/new-feature.json workflows/staging/

git add workflows/staging/new-feature.json
git commit -m "[n8n] stage: new-feature - Ready for review"

# Create PR for review
```

### 3. Production Deployment
```bash
# After approval
cp workflows/staging/new-feature.json workflows/production/

git add workflows/production/new-feature.json
git commit -m "[n8n] deploy: new-feature - Production release"

# Tag the release
git tag -a "workflow-new-feature-v1.0" -m "Production deployment of new-feature"
git push origin --tags
```

### 4. Updates
```bash
# Always backup before updating production
cp workflows/production/existing.json workflows/production/existing.backup.json

# Make changes
git add workflows/production/existing.json
git commit -m "[n8n] update: existing - Description of changes"
```

### 5. Rollback
```bash
# If issues in production
git checkout HEAD~1 -- workflows/production/problematic.json
git commit -m "[n8n] rollback: problematic - Reverting due to {reason}"

# Or restore from backup
cp workflows/production/problematic.backup.json workflows/production/problematic.json
```

## Automation with Claude Code

When deploying workflows, Claude Code should:

1. **Before changes**: Check git status
2. **After saving**: Stage changes
3. **Commit**: Use proper message format
4. **Tag**: Tag production deployments

Example commands:
```bash
# Check status
git status

# Stage workflow
git add workflows/{environment}/{workflow}.json

# Commit
git commit -m "[n8n] {action}: {name} - {description}"

# Tag (production only)
git tag -a "workflow-{name}-{date}" -m "{description}"
```

## Branch Strategy

```
main
├── workflow/feature-name     # New workflow development
├── workflow/update-name      # Updates to existing
└── workflow/fix-name         # Bug fixes
```

Merge to main after:
- Validation passes
- Testing complete
- Stakeholder approval (for production)

## Best Practices

1. **Never commit credentials** - Use .gitignore
2. **One workflow per commit** - Atomic changes
3. **Descriptive messages** - Future you will thank you
4. **Tag production releases** - Easy rollback points
5. **Keep backups** - Before any production changes
6. **Review before deploy** - PR process for production
