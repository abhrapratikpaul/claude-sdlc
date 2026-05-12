---
name: claude-code-best-practices
description: Core Claude Code best practices for AI-powered SDLC automation
priority: high
---

# Claude Code Best Practices

## Tool Selection
- NEVER use `cat`, `grep`, `find` in Bash when dedicated tools exist
- Use `Read` instead of `cat/head/tail`
- Use `Grep` instead of `grep/rg` commands
- Use `Glob` instead of `find/ls -R`
- Use `Edit` instead of `sed/awk` for file modifications
- Use `Write` for new files only, prefer `Edit` for existing files

## Bash Command Safety
- NEVER skip git hooks (--no-verify, --no-gpg-sign)
- NEVER use `git reset --hard` or `git push --force` without explicit user approval
- NEVER run `rm -rf` without confirmation
- Always create NEW commits, not `--amend` (unless explicitly requested)
- Chain dependent commands with `&&`, independent with separate tool calls in parallel

## File Operations
- Always use ABSOLUTE paths, never relative
- Read existing files with `Read` before using `Write` or `Edit`
- Quote paths with spaces using double quotes
- Prefer `Edit` for modifications (sends only diffs)
- Only create documentation/README files when explicitly requested

## Agent Usage
- Use specialized agents for domain-specific tasks (sdlc-step-*, qa-self-healing)
- Spawn agents in parallel when tasks are independent
- Use `run_in_background: true` for long-running tasks
- Never duplicate work that subagents are doing

## Context Management
- Keep text between tool calls ≤25 words
- Keep final responses ≤100 words unless detail required
- Use `TaskCreate` for multi-step tasks (≥3 steps)
- Mark tasks `in_progress` BEFORE starting work
- Mark tasks `completed` IMMEDIATELY after finishing

## Memory Guidelines
- Save to `.claude/projects/*/memory/` for cross-session persistence
- Memory types: user, feedback, project, reference
- Each memory = separate file with frontmatter + entry in MEMORY.md
- Verify memory relevance before using (may be stale)
- Update/remove outdated memories

## Security
- NEVER output or commit secrets (.env, tokens, API keys)
- Use environment variables: ${env:VAR_NAME}
- Validate user inputs at system boundaries
- No command injection, XSS, SQL injection vulnerabilities
- Default to secure-by-default patterns

## Code Quality
- No premature abstractions or future-proofing
- No comments unless WHY is non-obvious
- No error handling for impossible scenarios
- No backwards-compatibility hacks for unused code
- Write minimal, correct, secure code only

## Testing & Verification
- For UI changes: start dev server and test in browser
- Test golden path AND edge cases
- Type checking verifies code correctness, not feature correctness
- If you can't test UI, say so explicitly

## Communication
- Before first tool call: state in 1 sentence what you'll do
- Give brief updates at key moments (findings, direction changes, blockers)
- End-of-turn summary: 1-2 sentences (what changed, what's next)
- Match response depth to task complexity
- Never narrate internal deliberation to user
