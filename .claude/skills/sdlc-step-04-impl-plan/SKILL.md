---
name: sdlc-step-04-impl-plan
description: "Create a dependency-ordered implementation plan from architecture.md + design-review.md. Use when updating impl-plan.md."
argument-hint: "Optional: milestone/timebox"
---

# SDLC Step 04 — Implementation Plan

## Prime directive

> **Plan everything. Code nothing.**

Produce an implementation plan with enough context that a **fresh session** (no prior chat history) can execute it correctly.

## Inputs
Read in this order:
1. `requirements.md` — focus on FR/NFR/AC and constraints
2. `architecture.md` — focus on components, contracts, ADRs, data flow
3. `design-review.md` — focus on verdict, blocking issues, recommended actions

If any are missing, HALT and report:

```
Missing artifact: <file> at repo root
Cannot produce impl-plan.md. Run the preceding phase first.
```

## Output
- Update `impl-plan.md` with dependency-ordered tasks and blockers.

## Constraints
- No implementation code.
- Do not create new architectures; implement what’s approved.
- Respect repo boundaries:
	- Python dev work stays in `dev/`
	- Playwright+TypeScript verification stays in `test-automation/`
- Do not run git commands or create branches unless the user explicitly asks.

## Procedure
### 1) Build the step list (files + responsibilities)
- From `architecture.md`, extract components and where they live.
- Produce a concrete list of files to **create/modify**.
	- If exact paths are missing, propose explicit paths using this repo’s layout.

### 2) Compute dependencies and “waves”
- Create a dependency ordering for steps.
- Assign each step to a wave:
	- Wave 0 has no dependencies
	- Wave N depends only on waves 0..N-1
- If a circular dependency exists, HALT and report the cycle.

### 3) Map acceptance criteria → steps
- For each `AC-*` in `requirements.md`, identify which step(s) satisfy it.
- Record mapping per step.

### 4) Define verification per step
- For each step, define a concrete `Verify:` command.
	- Python unit/integration checks belong to `dev/`.
	- Doc-quality / pipeline verification belongs to `test-automation/`.
- If no test strategy exists, WARN and set `Verify: not defined`.

### 5) Identify risks, blockers, and backward compatibility
- Pull blocking issues/concerns from `design-review.md`.
- Add migration/compat notes if interfaces or document structures change.

### 6) Approval gate (required)
Before writing `impl-plan.md`, present a brief draft summary in chat:

> "Draft plan ready — <N> steps across <W> waves. Reply `approved` to write impl-plan.md, or describe changes."

Wait for approval; revise if requested.

## Required sections in `impl-plan.md`
- `## Pipeline Context` (which artifacts this plan depends on)
- `## Problem Summary`
- `## Key Requirements & Constraints`
- `## Architecture Summary`
- `## Design Review Conditions`
- `## Pre-Implementation Baseline`
- `## Implementation Steps`
- `## Wave Plan` (required when >8 steps or multiple waves)
- `## Risks`
- `## Non-Functional Hardening Tasks`
- `## Post-Implementation Checklist`
- `## Pipeline Continuation`

## Step format
Each step MUST include:
- Step number + exact file path + `(new|modify)`
- Purpose
- Dependencies (step numbers or component IDs)
- Acceptance criteria mapping (`AC-*`)
- Verify command

## Completion report (in chat)
```
Impl plan ready — impl-plan.md
- Steps: <N> (new <M>, modify <K>)
- Waves: <W>
- Blocking issues addressed: <yes/no>
```
