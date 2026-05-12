---
name: sdlc-step-08-pr
description: "Prepare a GitHub PR description (Summary/Changes/Test Evidence/Known Limitations/Reviewer Checklist) for the capstone."
argument-hint: "Optional: target branch + highlights"
---

# SDLC Step 08 — PR

## Prime directive

> **Produce a PR package that can be merged confidently.**

## Inputs
- Repo diff context (files changed)
- `requirements.md` (scope + acceptance criteria)
- Test results (local output and/or CI link), if available

## Output
- PR created in GitHub (URL) when GitHub MCP tools and permissions are available.
- PR description text (also output in chat, ready to paste).
- Changelog entry text.

## Constraints
- Do not fabricate test evidence.
	- If tests were not run, say so and list the exact command(s) to run.
- Do not claim features are complete if requirements mark them out-of-scope.
- Do not perform any remote write (branch creation, commit, PR creation) until the user confirms:
	- repository (owner/name)
	- base branch
	- PR branch name
	- whether to include current workspace changes in the PR

## Required PR description sections (must include all)
- **Summary** — 2–3 sentences: what was built and why.
- **Changes Made** — bulleted list of all files added/modified and the reason.
- **Test Evidence** — paste test output or link to CI results.
- **Known Limitations** — anything marked “Not Found”, deferred, or out of scope.
- **Reviewer Checklist** — a tick-list a reviewer must complete before approving.

## Changelog entry (required)
Provide a short changelog entry suitable for release notes.

If the repo does not yet have a changelog file:
- output the entry text only, and
- propose a filename/location.

## Procedure
1. Summarize why the change exists (tie back to `requirements.md`).
2. Confirm repo + base branch + PR branch name with the user.
3. Collect the list of files to include in the PR.
	- Prefer using repo diff context when available.
	- If the toolset cannot determine changed files, ask the user for an explicit file list (paths) to include.
4. (If requested) create the PR branch and commit the selected files to it using GitHub MCP.
	- If GitHub MCP PR/commit tooling is unavailable in the current chat toolset, stop remote actions and provide manual commands/steps.
5. Open the PR from the PR branch to the base branch using GitHub MCP.
6. List all files changed with a one-line reason each.
7. Add test evidence (paste output or link). If not run, provide commands.
8. List known limitations (out-of-scope, deferred, "Not Found").
9. Provide a reviewer checklist that is concrete and verifiable.
10. Provide a changelog entry.

## Output format (required)
Return two blocks. If a PR was created, include the PR URL at the top of the PR description.

1) PR description (ready to paste)
```
## Summary
PR: <url-if-created>
...

## Changes Made
- ...

## Test Evidence
...

## Known Limitations
- ...

## Reviewer Checklist
- [ ] ...
```

2) Changelog entry
```
- ...
```

