# API Documentation Cache

This directory stores cached API documentation for services integrated via n8n workflows.

## Purpose
- Reduce repeated lookups of the same API documentation
- Provide offline reference for common integrations
- Speed up workflow development

## Naming Convention
```
{service-name}.md
```

Examples:
- `slack.md`
- `google-sheets.md`
- `hubspot.md`
- `stripe.md`

## Document Structure

Each API doc should include:

```markdown
# {Service Name} API Reference

## Source
- Official Docs: {url}
- Retrieved: {date}
- Via: [Context7 / Ref / Exa / WebFetch]

## Authentication
{auth method and setup}

## Base URL
{base url}

## Key Endpoints
{table of endpoints}

## Rate Limits
{limits if known}

## n8n Integration Notes
{tips for using in n8n}
```

## Maintenance
- Update docs when API versions change
- Note any breaking changes
- Remove obsolete documentation

## Auto-Population
When using `/lookup-api` command, documentation is automatically saved here.
