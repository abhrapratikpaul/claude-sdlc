---
name: sdlc-step-05-implementation
description: "Implement planned features in Python under dev/. Use when writing production code for the doc sync CLI/library."
argument-hint: "Which tasks from impl-plan.md to implement next"
---

# SDLC Step 05 — Implementation

## Prime directive

> **Implement exactly what’s planned. Prove it with tests.**

Turn approved SDLC artifacts into production-ready Python code that satisfies acceptance criteria.

## Inputs
Read in this order:
1. `impl-plan.md` (source of truth for what to implement next)
2. `requirements.md` (FR/NFR/AC to satisfy)
3. `architecture.md` + `design-review.md` (constraints, ADRs, risks, conditions)

If the plan is missing or ambiguous, ask clarification questions **before** coding.

## Output
- Python code under `dev/`.

## Scope boundaries (hard)
- All Python development code lives under `dev/`.
- All verification automation (Playwright + TypeScript) lives under `test-automation/`.
- Do not mix TS tooling/config into `dev/`.

## Engineering constraints
- Do not fabricate features not described in `requirements.md` / `impl-plan.md`.
- Do not silently change public contracts without noting backward-compat implications.
- Do not output or commit secrets.
- Python version: follow `dev/pyproject.toml` (currently `>=3.10`).
- Prefer type hints and clear function signatures.
- Prefer `pathlib.Path` for filesystem work.

## Procedure
1. **Understand requirements**
	- Identify the specific `AC-*` items targeted by the next slice.
	- Confirm inputs/outputs and failure modes.

2. **Follow the plan**
	- Implement steps in dependency order exactly as described in `impl-plan.md`.
	- If deviation is required (missing file path, unclear contract), stop and propose the smallest plan correction.

3. **Implement features**
	- Keep functions small and testable.
	- Prefer explicit error handling and clear, user-actionable messages.

4. **Add tests (minimum viable, but real)**
	- Add unit tests for core logic.
	- Add integration-style tests for CLI behavior when feasible.
	- Each targeted `AC-*` should have a verification method (test or deterministic check).

5. **Document how to run**
	- Provide exact command(s) to run locally.
	- Note required environment variables (names only; never secrets).

## Output requirements (must leave behind)
- Code changes only under `dev/`.
- Minimal tests (if applicable).
- A short “how to run” note.
- An acceptance-criteria checklist mapping each targeted `AC-*` to:
  - code location(s), and
  - test(s) or deterministic verification.
