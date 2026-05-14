# Claude Code AI-in-SDLC Capstone Project

> **An intelligent, agentic SDLC pipeline powered by Claude Code**

This project demonstrates a production-ready implementation of AI-assisted software development lifecycle automation using Claude Code's agent system, Model Context Protocol (MCP) integrations, and specialized skills.

## 🎯 What This Project Does

Transforms a Jira user story into production-ready code through an automated 8-phase SDLC pipeline:

```
Jira Ticket → Requirements → Architecture → Design Review → 
Implementation Plan → Implementation → Code Review → Verification → Pull Request
```

Each phase is handled by a specialized Claude agent that:
- Reads outputs from previous phases
- Performs its designated task with domain expertise
- Produces structured, reviewable artifacts
- Hands off cleanly to the next phase

## 🚀 Quick Start

### Prerequisites
```bash
# Install Claude Code
# Download from https://claude.ai/code

# Set up environment variables
export GITHUB_PERSONAL_ACCESS_TOKEN="ghp_..."
export EPAM_JIRA_API_TOKEN="..."
export EPAM_CONFLUENCE_API_TOKEN="..."
```

### Run the Full Pipeline
```bash
# In Claude Code, simply type:
/sdlc

# Or use natural language:
"Fetch Jira ticket PROJ-1234 and run the full SDLC"
```

### Run Individual Phases
```bash
/sdlc-step-01-requirements  # Extract requirements from Jira
/sdlc-step-02-architecture  # Design system architecture
/sdlc-step-05-implementation # Write Python code
/sdlc-step-07-verify        # Generate and run tests
/sdlc-step-08-pr            # Create GitHub PR
```

## 📋 The 8 SDLC Phases

| Phase | Skill | Input | Output | Purpose |
|-------|-------|-------|--------|---------|
| 1️⃣ Requirements | `/sdlc-step-01-requirements` | user-story.md, Jira | requirements.md | Extract testable FR/NFR/AC |
| 2️⃣ Architecture | `/sdlc-step-02-architecture` | requirements.md | architecture.md | Design components & data flow |
| 3️⃣ Design Review | `/sdlc-step-03-design-review` | architecture.md | design-review.md | Critical review with verdict |
| 4️⃣ Implementation Plan | `/sdlc-step-04-impl-plan` | requirements.md, architecture.md | impl-plan.md | Dependency-ordered task list |
| 5️⃣ Implementation | `/sdlc-step-05-implementation` | impl-plan.md | dev/**/*.py | Write production Python code |
| 6️⃣ Review | `/sdlc-step-06-review` | dev/ code | review findings | Self-review for quality/security |
| 7️⃣ Verification | `/sdlc-step-07-verify` | requirements.md, dev/ | test-automation/**/*.spec.ts | Generate & run Playwright tests |
| 8️⃣ Pull Request | `/sdlc-step-08-pr` | all artifacts | GitHub PR | Create PR with description/checklist |

## 🏗️ Architecture

### Project Structure
```
CapstoneProject/
├── .claude/                    # Claude Code configuration
│   ├── agents/                 # 8 SDLC phase agents
│   │   ├── sdlc.agent.md              # Orchestrator agent
│   │   ├── sdlc-step-01-requirements.agent.md
│   │   ├── sdlc-step-02-architecture.agent.md
│   │   ├── ...
│   │   └── sdlc-step-08-pr.agent.md
│   ├── commands/               # Usage guides
│   │   ├── quick-start.md
│   │   ├── common-workflows.md
│   │   └── example-prompts.md
│   ├── rules/                  # Enforcement rules
│   │   ├── claude-code-best-practices.md
│   │   ├── sdlc-workflow.md
│   │   └── mcp-integration.md
│   ├── skills/                 # 8 SDLC phase skills
│       ├── sdlc-step-01-requirements/SKILL.md
│       ├── ...
│       └── sdlc-step-08-pr/SKILL.md
│
├── dev/                        # Python implementation
│   └── src/docsync/           # Documentation sync tool
├── test-automation/            # Playwright tests
│   └── tests/
├── .mcp.json                  # MCP server config
├── CLAUDE.md                  # Claude workspace instructions
├── user-story.md              # Input: feature description
├── requirements.md            # Phase 1 output
├── architecture.md            # Phase 2 output
├── design-review.md           # Phase 3 output
└── impl-plan.md              # Phase 4 output
```

### MCP Integration
Configured in `.mcp.json`:
- **GitHub MCP**: PR creation, issue management
- **EPAM Jira MCP**: Ticket fetching, requirements extraction
- **EPAM Confluence MCP**: Documentation retrieval

#### 1. Agent System
- Clear role definitions
- Tool restrictions per agent
- Phase-specific expertise
- Handoff protocols

#### 2. Tool Usage
- `Read` instead of `cat`
- `Grep` instead of `grep/rg`
- `Glob` instead of `find`
- `Edit` instead of `sed/awk`

#### 3. Rules System
- `claude-code-best-practices.md` - Tool selection, agent patterns
- `sdlc-workflow.md` - Phase sequencing, quality gates
- `mcp-integration.md` - MCP server usage

#### 4. Commands & Workflows
- `quick-start.md` - Getting started commands
- `common-workflows.md` - Standard patterns
- `example-prompts.md` - Natural language examples

#### 5. Skills vs Prompts
- Reusable skills in `.claude/skills/`
- Invoked with `/skill-name`
- Parameterized and composable
- Built-in context management

#### 6. MCP Integration
Configured in `.mcp.json`:
- **GitHub MCP**: PR creation, issue management
- **EPAM Jira MCP**: Ticket fetching, requirements extraction
- **EPAM Confluence MCP**: Documentation retrieval

## 📚 Usage Examples

### Example 1: New Feature from Jira
```
User: "Fetch EPAM Jira ticket PROJ-1234 and implement it"

Claude:
1. Fetches ticket via epam-jira MCP
2. Runs /sdlc-step-01-requirements → generates requirements.md
3. Runs /sdlc-step-02-architecture → generates architecture.md
4. Runs /sdlc-step-03-design-review → validates design
5. Runs /sdlc-step-04-impl-plan → creates task breakdown
6. Runs /sdlc-step-05-implementation → writes Python code
7. Runs /sdlc-step-06-review → finds/fixes issues
8. Runs /sdlc-step-07-verify → generates/runs tests
9. Runs /sdlc-step-08-pr → creates GitHub PR

Result: Production-ready PR in ~10 minutes
```

### Example 2: Bug Fix with Tests
```
User: "Fix bug in sync engine and add regression test"

Claude:
1. Analyzes bug in dev/src/docsync/sync.py
2. Proposes fix (shows diff)
3. Generates Playwright regression test
4. Runs verification tests
5. Creates commit + PR

Result: Bug fixed with test coverage
```

### Example 3: Architecture Review
```
User: "Review the architecture for scalability issues"

Claude:
1. Reads architecture.md
2. Runs /sdlc-step-03-design-review
3. Produces design-review.md with:
   - Scalability concerns (rated by severity)
   - Bottleneck identification
   - Recommended mitigations
   - Verdict: approve_with_concerns

Result: Actionable architecture feedback
```

## 🔒 Security & Best Practices

### Security Rules (Enforced by `.claude/rules/`)
- ✅ Never commit secrets (.env, tokens, keys)
- ✅ Use environment variables: `${env:VAR_NAME}`
- ✅ Never skip git hooks (--no-verify)
- ✅ Never use destructive git commands without approval
- ✅ Validate inputs at system boundaries
- ✅ No command injection, XSS, SQL injection

### Code Quality Rules
- ✅ Type hints on all Python functions
- ✅ Error handling for external I/O
- ✅ No premature abstractions
- ✅ No comments unless WHY is non-obvious
- ✅ Test coverage for acceptance criteria

### SDLC Workflow Rules
- ✅ Execute phases in strict order (1→2→3→4→5→6→7→8)
- ✅ Never skip phases
- ✅ Never implement before planning
- ✅ Never create PR before verification
- ✅ Keep commits scoped to current phase

## 🛠️ Advanced Features

### Self-Healing Playwright Tests
The `sdlc-qa-self-healing-agent` automatically:
1. Detects failing selectors in Playwright tests
2. Uses Playwright CLI first to discover resilient locators (falls back to Playwright MCP if needed)
3. Patches the Page Object Model (POM) with new selectors
4. Re-runs tests to verify fix

Usage:
```
"The test for login is failing with selector not found"
→ Agent auto-heals selector and updates test
```

### Parallel Phase Execution
Independent phases run concurrently:
```bash
# Claude spawns 3 agents in parallel
- Architecture agent (reads requirements.md)
- Documentation agent (updates README)
- Test agent (runs existing tests)
```

### Memory System
Cross-session persistence in `.claude/projects/*/memory/`:
```
- user_preferences.md (code style, review preferences)
- project_context.md (current sprint, deadlines)
- feedback_history.md (what worked, what didn't)
- reference_links.md (Jira queries, Confluence pages)
```

### Task Management
Built-in task tracking:
```
TaskCreate("Implement sync engine")
TaskUpdate(task_id, status="in_progress")
TaskUpdate(task_id, status="completed")
TaskList() → shows remaining work
```

## 📖 Documentation

### For Users
- **Commands**: `.claude/commands/` (6 focused commands)
- **Workspace Guide**: `CLAUDE.md`
- **Quick Start**: `.claude/commands/run-full-pipeline.md`

### For Developers
- **Agent Specs**: `.claude/agents/*.agent.md`
- **Skill Specs**: `.claude/skills/*/SKILL.md`
- **Rules**: `.claude/rules/*.md`
- **Instructions**: `.claude/instructions/*.md`

### For Architects
- **Architecture**: `architecture.md` (generated by phase 2)
- **Design Review**: `design-review.md` (generated by phase 3)
- **Implementation Plan**: `impl-plan.md` (generated by phase 4)

## 🧪 Testing

### Run Verification Tests
```bash
# In Claude Code
/sdlc-step-07-verify

# Or natural language
"Run all verification tests"
"Test the sync feature"
"Verify acceptance criteria AC-003"
```

### Test Structure
```
test-automation/
├── tests/
│   ├── test-confluence-sync.spec.ts
│   ├── test-rate-limiting.spec.ts
│   └── test-error-handling.spec.ts
├── fixtures/
└── playwright.config.ts
```

## 🤝 Contributing

### Adding a New SDLC Phase
1. Create agent: `.claude/agents/sdlc-step-XX-newphase.agent.md`
2. Create skill: `.claude/skills/sdlc-step-XX-newphase/SKILL.md`
3. Create prompt: `.claude/prompts/sdlc-XX-newphase.prompt.md`
4. Update `CLAUDE.md` with new phase
5. Update `.claude/rules/sdlc-workflow.md` with phase rules

### Customizing Agents
Edit agent frontmatter in `.claude/agents/*.agent.md`:
```yaml
---
name: sdlc-step-05-implementation
description: "Use when: implementing code under dev/"
tools: [read, edit, search, execute, todo]
model: sonnet  # or opus, haiku
---
```

### Adding Rules
Create new rule in `.claude/rules/`:
```yaml
---
name: my-custom-rule
description: Enforces X when Y
priority: high
applyTo: "**/*.py"
---

# Rule content here
```

## 📊 Project Status

### Current Implementation
- ✅ 8 SDLC phase agents
- ✅ MCP integration (GitHub, Jira, Confluence)
- ✅ Self-healing Playwright tests
- ✅ Comprehensive rules system
- ✅ Command reference docs
- ✅ Example workflows

### Roadmap
- [ ] Phase 9: Deployment automation
- [ ] Phase 10: Monitoring & alerting
- [ ] Integration with CI/CD pipelines
- [ ] Multi-language support (beyond Python)
- [ ] Visual architecture diagrams

## 🐛 Troubleshooting

### MCP Servers Not Working
```bash
# Check MCP configuration
cat .mcp.json

# Verify environment variables
echo $GITHUB_PERSONAL_ACCESS_TOKEN
echo $EPAM_JIRA_API_TOKEN

# Test connection in Claude
"Check MCP server status"
"Test Jira connection"
```

### Tests Failing
```bash
# Triage failures
/sdlc-step-07-verify

# Run self-healing
"Run self-healing agent on failing test"

# Manual debugging
cd test-automation
npx playwright test --debug
```

### Phase Stuck
```bash
# Check status
"What phase am I in?"
"Show SDLC progress"

# Resume from phase
/sdlc from=implementation

# Start over
"Restart from requirements phase"
```

## 📝 License

This project is part of an EPAM AI-in-SDLC capstone and is intended for educational and internal use.

## 🙏 Acknowledgments

- **Claude Code** by Anthropic for the agent platform
- **Model Context Protocol (MCP)** for integrations
- **EPAM Systems** for the capstone opportunity
- **Playwright** for test automation framework

## 📞 Support

- **Claude Code Issues**: https://github.com/anthropics/claude-code/issues
- **EPAM Confluence**: https://kb.epam.com
- **EPAM Jira**: https://jiraeu.epam.com

---

**Built with ❤️ using Claude Code**
