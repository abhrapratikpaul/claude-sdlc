---
name: mcp-integration
description: Rules for Model Context Protocol (MCP) server usage in Claude Code
priority: medium
paths: ["**/*.mcp.json", "**/*.agent.md", "**/*.SKILL.md"]
---

# MCP Integration Rules

## Available MCP Servers
Configured in `.mcp.json`:
1. **github** - GitHub API access (PRs, issues, repos)
2. **epam-jira** - EPAM Jira ticket management
3. **epam-confluence** - EPAM Confluence documentation

## Authentication
- Use environment variables for tokens:
  - `GITHUB_PERSONAL_ACCESS_TOKEN`
  - `EPAM_JIRA_API_TOKEN`
  - `EPAM_CONFLUENCE_API_TOKEN`
- NEVER hardcode tokens in files
- NEVER echo tokens in bash output
- NEVER commit .env files

## GitHub MCP Usage
Prefer github MCP tools for GitHub interactions:

## EPAM Jira MCP Usage
Use for requirements phase:
- Fetch ticket context: `epam-jira/getIssue`
- Pull summary, description, acceptance criteria
- Extract priority, status, assignee
- Link to Confluence docs if referenced

Fallback when MCP unavailable:
- Ask user to paste Jira content into `user-story.md`
- Or use REST API via PowerShell with env vars

## EPAM Confluence MCP Usage
Use for gathering context:
- Fetch page content: `epam-confluence/getPage`
- Search for related docs
- Extract requirements, specs, diagrams

Fallback when MCP unavailable:
- Ask user to export/paste content
- Use Confluence REST API with credentials from env

## Tool Selection Priority
1. Use MCP tool if available (check current toolset)
2. Use CLI tool (gh, jira) via Bash
3. Use REST API with env vars
4. Ask user to provide content manually

## Error Handling
- If MCP server unreachable: try fallback method
- If authentication fails: verify env var is set
- If rate limited: wait and retry with exponential backoff
- If tool not available: inform user and suggest alternatives

## MCP Tool Discovery
Check available MCP tools at session start:
- List available tools from MCP servers
- Verify authentication works
- Log any connection issues
- Inform user if servers are down

## Best Practices
- Always prefer MCP over scraping/manual copy-paste
- Cache MCP responses to avoid redundant calls
- Respect rate limits (especially GitHub)
- Use MCP for reads, CLI for writes (safer)
- Document MCP usage in code comments when non-obvious
