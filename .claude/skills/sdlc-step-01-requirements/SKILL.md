---
name: sdlc-step-01-requirements
description: "Derive functional/non-functional requirements and acceptance criteria from user-story.md. Use when creating/updating requirements.md."
argument-hint: "Confirm where the user story came from and any constraints"
---

# SDLC Step 01 — Requirements

## Prime directive
Turn the user story into **testable, unambiguous requirements**.

## Inputs
- Primary: `user-story.md` at repo root (preferred source input)
- Optional: Jira/Confluence context (user-provided text/links/sanitized exports)

## Fetch Jira/Confluence ticket context (optional, only if user-story.md is insufficient)
Prefer using the **epam-jira** MCP tool configured to fetch JIRA ticket context.

- Jira: MCP server `epam-jira` (uses `EPAM_JIRA_API_TOKEN` from your environment)

Pull (at minimum) `summary` and `description`, plus acceptance criteria and relevant comments/linked Confluence sections when present.

Fallbacks (when MCP tools are not available in the current chat toolset):
- Ask the user to paste/export the Jira/Confluence content into chat or `user-story.md`.
- Or use a local REST call via terminal (e.g., PowerShell `Invoke-RestMethod`) with environment variables; never write tokens to files or echo them in logs.

## Output
- Update `requirements.md` with FR/NFR/AC items.

## Constraints (quality bar)
- Use **"shall"** language for requirements.
- Use priorities **P0/P1/P2**.
- Default: **1 AC per requirement** (split if needed).
- Do not accept vague requirements; ask clarifying questions until they are testable.
- Do not fabricate file paths, endpoints, numbers, or behaviors not evidenced.
- Never output or commit secrets. If you detect secrets, advise remediation without repeating values.
- Do not propose breaking changes without explicit user approval.

## Procedure
1. **Load story context**
	- Read `user-story.md`.
	- If `user-story.md` is empty/missing details, ask the user to paste the Jira/Confluence story text (sanitized) into `user-story.md` or directly into chat.

2. **Silent assessment (before asking anything)**
	Categorize what is specified vs missing for:
	- Actors / personas
	- Problem statement and desired outcome
	- In-scope vs out-of-scope
	- Acceptance criteria and success signals
	- Data inputs/outputs (files, formats)
	- Constraints (security, performance, reliability)
	- Edge cases and failure modes
	- Backward compatibility considerations

3. **Interrogation rounds (max 3)**
	- Ask 1–4 related questions per round.
	- End with: **"Your answers:"** and wait.
	- After the user replies, echo back what you understood in 1–2 sentences.

4. **Draft requirements (approval gate)**
	When mandatory categories are covered, present a readable draft containing:
	- Summary
	- Requirements list with **P0/P1/P2** and **AC-*** mappings
	- Non-goals / out-of-scope
	- Assumptions
	- Edge cases
	- Backward-compatibility verdict

	End with: **"Reply `approved` to write requirements.md, or describe changes."**
	STOP.

5. **Write `requirements.md`**
	Only after the user replies `approved`, update `requirements.md` with stable IDs:
	- FR-1, FR-2, …
	- NFR-1, NFR-2, …
	- AC-1, AC-2, …

## Output format (in chat)
Provide a structured list of proposed requirements using:
- **Category**
- **Requirement** (shall language)
- **Impact**
- **Priority** (P0/P1/P2)
- **Acceptance Criteria** (AC-*)
- **Assumptions / Notes** (if needed)
