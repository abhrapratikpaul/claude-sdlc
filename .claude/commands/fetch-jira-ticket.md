---
name: fetch-jira-ticket
description: Fetch EPAM Jira ticket and extract requirements
usage: "Fetch Jira ticket PROJ-1234" or "Get requirements from Jira"
tools: ["epam-jira/*"]
---

# Fetch Jira Ticket

Fetch ticket details from EPAM Jira and extract requirements.

## Usage

Natural language:
```
Fetch Jira ticket PROJ-1234
Get requirements from Jira story PROJ-1234
Load Jira ticket PROJ-1234 and start SDLC
Pull ticket PROJ-1234 from Jira
```

## What It Does

1. Connects to EPAM Jira via MCP server
2. Fetches ticket by ID (e.g., PROJ-1234)
3. Extracts:
   - Summary
   - Description
   - Acceptance criteria
   - Priority
   - Status
   - Assignee
   - Linked Confluence pages
4. Saves context to user-story.md
5. Optionally starts requirements phase

## Prerequisites

Environment variable must be set:
```bash
export EPAM_JIRA_API_TOKEN="your-token-here"
```

MCP server configured in `.mcp.json`:
```json
{
  "servers": {
    "epam-jira": {
      "command": "uvx",
      "args": ["mcp-atlassian"],
      "env": {
        "JIRA_URL": "https://jiraeu.epam.com",
        "JIRA_USERNAME": "your-email@epam.com",
        "JIRA_API_TOKEN": "${env:EPAM_JIRA_API_TOKEN}"
      }
    }
  }
}
```

## Example Workflow

```
User: "Fetch Jira ticket PROJ-1234 and start SDLC"

Claude:
1. Connects to epam-jira MCP
2. Fetches ticket PROJ-1234
3. Extracts requirements
4. Saves to user-story.md
5. Runs /sdlc-step-01-requirements
6. Generates requirements.md
7. Continues with architecture phase...
```

## Fallback (If MCP Unavailable)

If Jira MCP is not working:
```
"Please paste the Jira ticket content"
→ Claude will guide you to export ticket and paste into user-story.md
```

## Related Commands

- Fetch Confluence page: `"Fetch Confluence page <page-id>"`
- Start from user story: `"Start SDLC from user-story.md"`
