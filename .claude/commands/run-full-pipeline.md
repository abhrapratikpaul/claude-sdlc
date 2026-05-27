---
name: run-full-pipeline
description: Execute the complete 8-phase SDLC pipeline from requirements to PR
usage: "Run full SDLC pipeline" or "Execute complete pipeline"
---

# Run Full SDLC Pipeline

Executes all 8 phases in sequence:
1. Requirements extraction from Jira/user-story.md
2. Architecture design
3. Design review
4. Implementation planning
5. Code implementation
6. Code review
7. Verification testing
8. Pull request creation

## Usage

Natural language:
```
Run the full SDLC pipeline
Execute complete pipeline from requirements to PR
Start full development cycle
```

Skill invocation:
```
/sdlc
```

## What It Does

1. **Requirements Phase**
   - Fetches Jira ticket via MCP (if provided)
   - Reads user-story.md
   - Generates requirements.md with FR/NFR/AC

2. **Architecture Phase**
   - Reads requirements.md
   - Designs component structure
   - Generates architecture.md

3. **Design Review Phase**
   - Reviews architecture.md
   - Produces design-review.md with verdict

4. **Implementation Plan Phase**
   - Synthesizes requirements + architecture + design review
   - Generates impl-plan.md with task breakdown

5. **Implementation Phase**
   - Writes code in the source folder declared by architecture.md
   - Follows impl-plan.md

6. **Review Phase**
   - Self-reviews code for quality/security against requirements.md
   - Produces findings report

7. **Verification Phase**
   - Generates tests using the framework declared by architecture.md
   - Runs tests and produces report

8. **PR Phase**
   - Creates feature branch
   - Generates PR description
   - Opens GitHub PR (with user approval)

## Prerequisites

- Jira ticket ID provided (primary input — fetched via MCP)
- OR `user-story.md` exists at project root as fallback
- Environment variables set:
  - `GITHUB_PERSONAL_ACCESS_TOKEN`
  - `EPAM_JIRA_API_TOKEN`, `EPAM_JIRA_USERNAME`
  - `EPAM_CONFLUENCE_API_TOKEN`, `EPAM_CONFLUENCE_USERNAME` (if Confluence pages are linked)

## Expected Duration

~15-25 minutes for a typical feature (varies by complexity)

## Output

- `user-story.md` (fetched from Jira)
- `requirements.md`
- `architecture.md`
- `design-review.md`
- `impl-plan.md`
- Implementation code in the source folder declared by architecture.md
- Review findings (in chat)
- Verification tests in the test folder declared by architecture.md
- GitHub PR
