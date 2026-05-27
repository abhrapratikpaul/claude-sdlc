---
name: sdlc-step-05-implementation
description: “Implement planned features in the language/stack defined by architecture.md. Use when writing production code for any application type.”
argument-hint: “Which tasks from impl-plan.md to implement next”
---

# SDLC Step 05 — Implementation

## Prime directive

> **Implement exactly what’s planned. Prove it with tests.**

Turn approved SDLC artifacts into production-ready code that satisfies acceptance criteria.

## Inputs
Read in this order:
1. `architecture.md` (determines language, framework, folder layout, and tech stack)
2. `impl-plan.md` (source of truth for what to implement next)
3. `requirements.md` (FR/NFR/AC to satisfy)
4. `design-review.md` (constraints, ADRs, risks, conditions)

If the plan is missing or ambiguous, ask clarification questions **before** coding.

## Stack detection (mandatory first step)
Read `architecture.md` and extract:
- **Implementation language** (Python, TypeScript/Node.js, Java, Go, etc.)
- **Framework** (FastAPI, Express, Spring Boot, etc.)
- **Source folder** (e.g. `src/`, `app/`, `dev/`, `backend/`)
- **Test folder** (e.g. `tests/`, `spec/`, `test-automation/`)
- **Package manager / build tool** (pip, npm, maven, gradle, etc.)

Apply the detected stack throughout all implementation work.

## Output
- Code in the **source folder declared in architecture.md**.

## Scope boundaries (hard)
- Implementation code lives in the source folder from `architecture.md`.
- Test code lives in the test folder from `architecture.md`.
- Never mix test tooling config into the source folder or vice versa.

## Engineering constraints
- Do not fabricate features not described in `requirements.md` / `impl-plan.md`.
- Do not silently change public contracts without noting backward-compat implications.
- Do not output or commit secrets.
- Follow the language’s idiomatic conventions (type hints for Python, interfaces for TypeScript, etc.).
- Prefer small, testable functions with explicit error handling.

## Procedure
1. **Detect stack** — read `architecture.md` (see Stack detection above).
2. **Understand requirements** — identify the specific `AC-*` items targeted by the next slice.
3. **Follow the plan** — implement steps in dependency order from `impl-plan.md`; propose smallest correction if deviation needed.
4. **Implement features** — keep functions small, testable, with user-actionable error messages.
5. **Add tests (minimum viable, but real)** — unit tests for core logic; each `AC-*` must have a test or deterministic check.
6. **Document how to run** — exact commands + required environment variable names (never values/secrets).

## Output requirements (must leave behind)
- Code changes only in the declared source folder.
- Minimal tests in the declared test folder (if applicable).
- A short “how to run” note.
- An acceptance-criteria checklist mapping each `AC-*` to code location(s) and test(s).
