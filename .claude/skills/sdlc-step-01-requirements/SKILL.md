---
name: sdlc-step-01-requirements
description: "Derive functional/non-functional requirements and acceptance criteria from user-story.md. Use when creating/updating requirements.md."
argument-hint: "Confirm where the user story came from and any constraints"
---

# SDLC Step 01 — Requirements

## Prime directive
Turn the user story into **testable, unambiguous requirements**.

## Inputs
- **Primary**: Jira story key provided by the user (e.g. `PROJ-1234`). Fetch via **epam-jira** MCP tool — pull `summary`, `description`, acceptance criteria, priority, labels, linked Confluence pages, and comments.
- **Fallback**: If MCP is unavailable or the Jira ticket lacks detail, ask the user to paste/export the content into chat or `user-story.md`.
- After fetching, write/update `user-story.md` with the fetched content for traceability.

## Fetch Jira/Confluence ticket context
Use the **epam-jira** MCP tool (`EPAM_JIRA_API_TOKEN` env var) as the first choice.

Pull at minimum: `summary`, `description`, acceptance criteria, labels, priority.  
Also pull: relevant comments, linked Confluence sections, and epic context when present.

Fallbacks (when MCP unavailable):
- Ask the user to paste/export the Jira/Confluence content into chat or `user-story.md`.
- Or use a local REST call via terminal with environment variables; never write tokens to files or echo them in logs.

## Output
- Update `user-story.md` with fetched Jira content (for traceability).
- Update `requirements.md` with FR/NFR/AC items **plus** a **Tech Stack Hints** section (inferred from the story domain, labels, and description).

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
