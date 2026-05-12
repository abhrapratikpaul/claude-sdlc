# Migration Guide: GitHub Copilot → Claude Code

This guide documents the transformation from a GitHub Copilot-based AI-in-SDLC project to a Claude Code-native implementation.

## Table of Contents
1. [Overview](#overview)
2. [Key Differences](#key-differences)
3. [Migration Steps](#migration-steps)
4. [Feature Mapping](#feature-mapping)
5. [Best Practices](#best-practices)
6. [Troubleshooting](#troubleshooting)

## Overview

### What Changed
This project was originally designed for GitHub Copilot but has been **completely transformed** to leverage Claude Code's advanced capabilities:

- **Agent system** with specialized roles
- **MCP (Model Context Protocol)** integrations
- **Rules-based enforcement** of best practices
- **Skills & commands** for reusable workflows
- **Memory system** for cross-session context
- **Advanced tool usage** (Read/Edit/Grep/Glob)

### Why Migrate?
Claude Code offers significant advantages:

| Feature | GitHub Copilot | Claude Code |
|---------|---------------|-------------|
| **Agents** | Single assistant | 8+ specialized agents |
| **Tool Selection** | Manual bash commands | Dedicated tools (Read/Edit/Grep) |
| **Rules** | Implicit guidelines | Explicit, enforced rules |
| **MCP Integration** | Manual API calls | Native MCP support |
| **Memory** | Chat history only | Persistent memory system |
| **Parallel Execution** | Sequential only | Parallel agent spawning |
| **Self-Healing** | Manual fixes | Auto-healing Playwright tests |
| **Context Management** | Limited | TaskCreate/TaskUpdate tracking |

## Key Differences

### 1. Project Structure

#### Before (Copilot)
```
.github/
  copilot-instructions.md
  workflows/
src/
  *.py
tests/
  *.spec.ts
```

#### After (Claude)
```
.claude/
  agents/              # 8 SDLC agents
  commands/            # Usage guides
  rules/               # Enforced rules
  skills/              # Reusable workflows
  prompts/             # Phase prompts
  instructions/        # Code guidelines
dev/                   # Python code
test-automation/       # Playwright tests
.mcp.json             # MCP config
CLAUDE.md             # Workspace instructions
```

### 2. Invocation Method

#### Before (Copilot)
```
# Chat-based only
User: "Create requirements from the Jira ticket"
Copilot: [responds in chat]
```

#### After (Claude)
```
# Skill-based
/sdlc-step-01-requirements

# Agent-based
@sdlc-step-01-requirements

# Natural language (still works!)
"Fetch Jira ticket and create requirements"
```

### 3. Tool Usage

#### Before (Copilot)
```bash
# Bash commands
cat user-story.md
grep "FR-" requirements.md
find . -name "*.py"
sed -i 's/old/new/' file.py
```

#### After (Claude)
```
# Dedicated tools
Read(file_path="user-story.md")
Grep(pattern="FR-", path="requirements.md")
Glob(pattern="**/*.py")
Edit(file_path="file.py", old_string="old", new_string="new")
```

**Why?** Dedicated tools:
- Provide better user experience
- Are easier to review and approve
- Have built-in safety checks
- Support permission management

### 4. Agent Architecture

#### Before (Copilot)
Single assistant handling all tasks

#### After (Claude)
8 specialized agents:

1. **sdlc-step-01-requirements** - Requirements extraction
2. **sdlc-step-02-architecture** - System design
3. **sdlc-step-03-design-review** - Critical review
4. **sdlc-step-04-impl-plan** - Implementation planning
5. **sdlc-step-05-implementation** - Code writing
6. **sdlc-step-06-review** - Code review
7. **sdlc-step-07-verify** - Test generation/execution
8. **sdlc-step-08-pr** - PR creation

Plus:
- **sdlc** - Orchestrator (runs all phases)
- **sdlc-qa-self-healing-agent** - Test repair

### 5. Rules System

#### Before (Copilot)
Guidelines in markdown, manually enforced

#### After (Claude)
Explicit rules in `.claude/rules/`:

- **claude-code-best-practices.md**
  - Tool selection (never use cat/grep/find)
  - Bash command safety
  - Agent usage patterns
  - Context management

- **sdlc-workflow.md**
  - Phase sequencing (1→2→3→4→5→6→7→8)
  - File location constraints
  - Quality gates per phase
  - Forbidden actions

- **mcp-integration.md**
  - MCP server usage
  - Authentication patterns
  - Fallback strategies

### 6. MCP Integration

#### Before (Copilot)
Manual REST API calls or ask user to paste content

#### After (Claude)
Native MCP support via `.mcp.json`:

```json
{
  "servers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${env:GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    },
    "epam-jira": {
      "command": "uvx",
      "args": ["mcp-atlassian"],
      "env": {
        "JIRA_URL": "https://jiraeu.epam.com",
        "JIRA_USERNAME": "reetanshu_kumar@epam.com",
        "JIRA_API_TOKEN": "${env:EPAM_JIRA_API_TOKEN}"
      }
    }
  }
}
```

**Benefits:**
- Automatic authentication
- Type-safe API calls
- Error handling built-in
- Credential management via env vars

## Migration Steps

### Step 1: Set Up Environment

```bash
# Install Claude Code
# Download from https://claude.ai/code

# Set environment variables
export GITHUB_PERSONAL_ACCESS_TOKEN="ghp_..."
export EPAM_JIRA_API_TOKEN="..."
export EPAM_CONFLUENCE_API_TOKEN="..."

# Verify Claude Code installation
claude --version
```

### Step 2: Create .claude/ Directory Structure

```bash
mkdir -p .claude/{agents,commands,rules,skills,prompts,instructions,hooks}
```

### Step 3: Migrate Copilot Instructions → Claude Agents

**Before:** `.github/copilot-instructions.md`
```markdown
# Instructions
You are helping with SDLC automation...
```

**After:** `.claude/agents/sdlc-step-01-requirements.agent.md`
```markdown
---
name: sdlc-step-01-requirements
description: "Use when: deriving requirements from user-story.md"
tools: [read, edit, search, todo, mcp, epam-jira/*, epam-confluence/*]
---

You are the **Requirements Agent** for this agentic SDLC pipeline.

## Prime Directive
Convert the user story into testable requirements.

[...]
```

### Step 4: Convert Prompts → Skills

**Before:** Manual prompts in chat

**After:** `.claude/skills/sdlc-step-01-requirements/SKILL.md`
```markdown
---
name: sdlc-step-01-requirements
description: "Derive functional/non-functional requirements"
argument-hint: "Confirm where the user story came from"
---

# SDLC Step 01 — Requirements

## Prime directive
Turn the user story into **testable, unambiguous requirements**.

## Inputs
- Primary: `user-story.md`
- Optional: Jira/Confluence context

[...]
```

### Step 5: Add Rules

Create `.claude/rules/claude-code-best-practices.md`:
```markdown
---
name: claude-code-best-practices
description: Core Claude Code best practices
priority: high
---

# Claude Code Best Practices

## Tool Selection
- NEVER use `cat`, use `Read` instead
- NEVER use `grep`, use `Grep` instead
[...]
```

### Step 6: Configure MCP Servers

Create `.mcp.json`:
```json
{
  "servers": {
    "github": { /* config */ },
    "epam-jira": { /* config */ },
    "epam-confluence": { /* config */ }
  }
}
```

### Step 7: Update CLAUDE.md

Replace generic instructions with structured workspace guide:
```markdown
# Claude Code Workspace Instructions

## Project Overview
AI-Powered SDLC Pipeline for Automated Documentation Sync

## Hard Constraints
- Python code ONLY under `dev/`
- TypeScript tests ONLY under `test-automation/`
[...]
```

### Step 8: Add Commands & Examples

Create `.claude/commands/quick-start.md`:
```markdown
# Quick Start Commands

## Full SDLC Pipeline
/sdlc

## Individual Phases
/sdlc-step-01-requirements
/sdlc-step-02-architecture
[...]
```

### Step 9: Test the Migration

```bash
# In Claude Code
/sdlc-step-01-requirements

# Should:
# 1. Read user-story.md
# 2. Optionally fetch from Jira MCP
# 3. Generate requirements.md
# 4. Use Functional Requirements (FR), Non-Functional (NFR), Acceptance Criteria (AC)
```

## Feature Mapping

### Commands

| Copilot | Claude Code | Notes |
|---------|-------------|-------|
| "Create requirements" | `/sdlc-step-01-requirements` | Now a skill |
| "Design architecture" | `/sdlc-step-02-architecture` | Now a skill |
| "Review design" | `/sdlc-step-03-design-review` | New phase! |
| "Create plan" | `/sdlc-step-04-impl-plan` | Now a skill |
| "Implement feature" | `/sdlc-step-05-implementation` | Now a skill |
| "Review code" | `/sdlc-step-06-review` | New phase! |
| "Run tests" | `/sdlc-step-07-verify` | Now a skill |
| "Create PR" | `/sdlc-step-08-pr` | Uses GitHub MCP |

### Tools

| Copilot Command | Claude Tool | Example |
|----------------|-------------|---------|
| `cat file.txt` | `Read(file_path="file.txt")` | Read file |
| `grep "pattern" file` | `Grep(pattern="pattern", path="file")` | Search content |
| `find . -name "*.py"` | `Glob(pattern="**/*.py")` | Find files |
| `sed -i 's/old/new/' file` | `Edit(file_path="file", old_string="old", new_string="new")` | Edit file |
| `echo "content" > file` | `Write(file_path="file", content="content")` | Write file |
| Manual API calls | MCP servers | Jira/Confluence/GitHub |

### Workflows

| Task | Copilot Approach | Claude Approach |
|------|-----------------|----------------|
| **Fetch Jira ticket** | Ask user to paste | MCP: `epam-jira/getIssue` |
| **Create requirements** | Chat back-and-forth | Skill: `/sdlc-step-01-requirements` |
| **Parallel tasks** | Sequential only | Spawn multiple agents in parallel |
| **Test fixing** | Manual selector updates | Self-healing agent auto-fixes |
| **Context persistence** | Chat history | Memory system in `.claude/projects/*/memory/` |
| **Task tracking** | Manual notes | `TaskCreate`/`TaskUpdate` tools |

## Best Practices

### ✅ DO: Use Dedicated Tools

```
# Good (Claude)
Read(file_path="user-story.md")
Grep(pattern="FR-", output_mode="content")
Glob(pattern="dev/**/*.py")
Edit(file_path="cli.py", old_string="old", new_string="new")
```

```bash
# Bad (Copilot style)
cat user-story.md
grep "FR-" requirements.md
find dev -name "*.py"
sed -i 's/old/new/' cli.py
```

### ✅ DO: Use Skills for Reusable Workflows

```
# Good
/sdlc-step-01-requirements
/sdlc-step-05-implementation
```

```
# Less optimal
"Please create requirements from the user story following these steps: 1. Read user-story.md 2. Extract FR/NFR/AC 3. ..."
```

### ✅ DO: Leverage MCP Servers

```
# Good (with MCP)
"Fetch Jira ticket PROJ-1234"
→ Claude uses epam-jira MCP server

# Less optimal (without MCP)
"Here's the Jira ticket content: [paste]"
```

### ✅ DO: Use Agents for Specialized Tasks

```
# Good
@sdlc-step-02-architecture  # Specialized architecture agent
@sdlc-step-06-review        # Specialized review agent
```

```
# Less optimal
"Review the architecture and also review the code"  # Single agent doing two specialized tasks
```

### ✅ DO: Create Rules for Enforcement

```markdown
# Good: .claude/rules/python-style.md
---
name: python-style
applyTo: "dev/**/*.py"
---

- Use type hints on all functions
- Validate inputs at boundaries
- No hardcoded secrets
```

```markdown
# Less optimal: Reminder in chat
"Remember to use type hints and validate inputs"
```

### ❌ DON'T: Mix Copilot and Claude Patterns

```bash
# Bad: Using bash when tools exist
Bash(command="cat user-story.md")

# Good: Use dedicated tool
Read(file_path="user-story.md")
```

### ❌ DON'T: Skip SDLC Phases

```
# Bad
/sdlc-step-05-implementation  # Skipping requirements, architecture, design review, planning

# Good
/sdlc  # Runs all phases in order
# OR
/sdlc-step-01-requirements
/sdlc-step-02-architecture
/sdlc-step-03-design-review
/sdlc-step-04-impl-plan
/sdlc-step-05-implementation
```

### ❌ DON'T: Hardcode Credentials

```python
# Bad
JIRA_TOKEN = "abc123"
CONFLUENCE_URL = "https://kb.epam.com"
```

```json
# Good: .mcp.json
{
  "servers": {
    "epam-jira": {
      "env": {
        "JIRA_API_TOKEN": "${env:EPAM_JIRA_API_TOKEN}"
      }
    }
  }
}
```

## Troubleshooting

### Issue: "Skills not found"

**Cause:** Skills not registered or wrong directory structure

**Fix:**
```bash
# Verify structure
ls .claude/skills/
# Should show: sdlc-step-01-requirements/, sdlc-step-02-architecture/, etc.

# Each should have SKILL.md
ls .claude/skills/sdlc-step-01-requirements/
# Should show: SKILL.md
```

### Issue: "MCP server not responding"

**Cause:** Environment variables not set or MCP not configured

**Fix:**
```bash
# Check env vars
echo $EPAM_JIRA_API_TOKEN
echo $EPAM_CONFLUENCE_API_TOKEN
echo $GITHUB_PERSONAL_ACCESS_TOKEN

# Verify .mcp.json exists
cat .mcp.json

# Test in Claude
"Test Jira MCP connection"
```

### Issue: "Agent using bash instead of tools"

**Cause:** Rules not loaded or agent not following them

**Fix:**
```bash
# Verify rules exist
ls .claude/rules/
# Should show: claude-code-best-practices.md, sdlc-workflow.md, mcp-integration.md

# Check rule frontmatter
cat .claude/rules/claude-code-best-practices.md
# Should have:
# ---
# name: claude-code-best-practices
# priority: high
# ---
```

### Issue: "Phases running out of order"

**Cause:** Using individual skills without checking prerequisites

**Fix:**
```
# Use full pipeline
/sdlc

# OR manually check prerequisites
"What phase am I in?"
"Show SDLC status"
/sdlc from=<correct-phase>
```

### Issue: "Tests failing with selector issues"

**Cause:** Playwright selectors changed in UI

**Fix:**
```
# Use self-healing agent
"Run self-healing agent on failing test"

# OR manually
@sdlc-qa-self-healing-agent
# Agent will:
# 1. Detect failing selectors
# 2. Use Playwright CLI first to discover new selectors (fallback to Playwright MCP if needed)
# 3. Update POM classes
# 4. Re-run tests
```

## Verification Checklist

After migration, verify:

- [ ] `.claude/` directory structure exists
- [ ] 8 SDLC agents in `.claude/agents/`
- [ ] 8 SDLC skills in `.claude/skills/`
- [ ] Rules in `.claude/rules/`
- [ ] Commands in `.claude/commands/`
- [ ] `.mcp.json` configured with GitHub, Jira, Confluence
- [ ] Environment variables set
- [ ] `CLAUDE.md` updated
- [ ] `README.md` created
- [ ] Test: `/sdlc-step-01-requirements` works
- [ ] Test: MCP servers connect
- [ ] Test: Skills invocable with `/skill-name`
- [ ] Test: Agents invocable with `@agent-name`
- [ ] Test: Rules enforced (e.g., Read used instead of cat)

## Next Steps

1. **Run Full Pipeline**: `/sdlc`
2. **Test Individual Phases**: `/sdlc-step-01-requirements`, etc.
3. **Customize Agents**: Edit `.claude/agents/*.agent.md` for your needs
4. **Add Custom Rules**: Create new rules in `.claude/rules/`
5. **Extend Workflows**: Add new commands to `.claude/commands/`
6. **Integrate More MCP Servers**: Add to `.mcp.json`

## Resources

- **Claude Code Docs**: https://claude.ai/docs
- **MCP Specification**: https://modelcontextprotocol.io
- **Example Project**: This repository!
- **Support**: https://github.com/anthropics/claude-code/issues

---

**Migration Complete!** 🎉

You now have a Claude Code-native AI-in-SDLC pipeline with:
- 8 specialized agents
- MCP integrations
- Rules-based enforcement
- Reusable skills & commands
- Self-healing tests
- Memory system
- Advanced tool usage

Enjoy the enhanced developer experience!
