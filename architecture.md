# Architecture: Task Manager Application

**Source**: requirements.md (EPMCDMETST-41952)
**Date**: 2026-05-27
**Status**: Draft

---

## Goals

| Goal | NFR |
|------|-----|
| Runs in all modern browsers with no plugins | NFR-001 |
| Simple, intuitive — zero training required | NFR-002 |
| Add/complete/delete operations respond within 500 ms | NFR-003 |
| Tasks persist across page reloads | NFR-004 |
| Runnable with minimal setup (no build step required for dev) | NFR-005 |

---

## Proposed Solution

### Overview

A **single-page, static HTML/CSS/JavaScript** application that runs entirely in the browser. No server-side runtime is required. State is persisted in `localStorage`. The application is delivered as a small set of files that can be opened directly in a browser or served by any static file server.

---

### Components

#### 1. `index.html` — Shell / Entry Point

- **Responsibility**: Declares the DOM structure (task input, Add Task button, error area, task list, Clear Completed button).
- **Boundary**: Source folder only. Contains zero inline business logic; all logic lives in `app.js`.

#### 2. `app.js` — Application Controller

- **Responsibility**: Owns all business logic — add task, complete task, delete task, clear completed, sort order, validation, persistence read/write.
- **Boundary**: Source folder only. Imports `storage.js`; writes to DOM directly.
- **Interface**: Exposes no public API surface. Loaded as a module (`<script type="module">`).

#### 3. `storage.js` — Persistence Adapter

- **Responsibility**: Abstracts `localStorage` reads and writes. Serializes/deserializes the task array as JSON.
- **Boundary**: Source folder only. Has no DOM dependency; pure data layer.
- **Interface**:
  - `loadTasks()` — returns Task array
  - `saveTasks(tasks)` — returns void
  - Task shape: `{ id: string, name: string, completed: boolean }`

#### 4. `style.css` — Presentation

- **Responsibility**: Visual styling — layout, strikethrough for completed tasks, error state, responsive sizing.
- **Boundary**: Source folder only. No logic.

#### 5. `test-automation/` — Verification Test Suite

- **Responsibility**: End-to-end acceptance-criteria verification via Playwright + TypeScript.
- **Boundary**: Test folder only. No production code here.

---

### Data Flow

**Page load**: DOMContentLoaded fires -> app.js calls loadTasks() -> storage.js reads localStorage -> returns Task array -> app.js sorts (incomplete first, completed last) -> renders list to DOM.

**Add task**: User submits name -> app.js validates (non-empty) -> if invalid, shows error message -> if valid, creates Task with UUID, appends to array, calls saveTasks(), re-renders list.

**Toggle complete**: User clicks checkbox -> app.js flips task.completed -> calls saveTasks() -> re-renders list with sort applied.

**Delete task**: User clicks Delete -> app.js removes task from array -> calls saveTasks() -> re-renders list.

**Clear completed**: User clicks Clear Completed -> app.js filters to incomplete only -> calls saveTasks() -> re-renders list.

---

### Tech Stack

| Layer | Choice |
|-------|--------|
| Language | Vanilla JavaScript (ES2020 modules) |
| Markup | HTML5 |
| Styling | Plain CSS3 |
| Persistence | Browser localStorage |
| Verification | Playwright + TypeScript |
| Build tooling | None required |

---

### Folder Layout

```
CapstoneProject/
├── dev/                        <- SOURCE FOLDER (all production files)
│   ├── index.html
│   ├── app.js
│   ├── storage.js
│   └── style.css
└── test-automation/            <- TEST FOLDER (Playwright TS)
    ├── tests/
    │   └── task-manager.spec.ts
    ├── playwright.config.ts
    └── package.json
```

**Rule**: Implementation agents write ONLY under `dev/`. Test agents write ONLY under `test-automation/`.

---

## Contracts

### Task Data Shape

```
Task {
  id        : string   // UUID v4, generated on creation
  name      : string   // Non-empty, trimmed
  completed : boolean  // false on creation
}
```

### storage.js Interface

| Function | Input | Output | Error |
|----------|-------|--------|-------|
| `loadTasks()` | none | `Task[]` (empty array if nothing stored) | Never throws; returns `[]` on parse error |
| `saveTasks(tasks)` | `Task[]` | `void` | Silent fail if localStorage is unavailable |

### app.js Validation Contract

| Rule | Trigger | Response |
|------|---------|----------|
| Task name must not be empty or whitespace-only | `handleAddTask()` | Display "Task name is required" in `#error-message`; do not save |
| Task name is trimmed before saving | `handleAddTask()` | Stored name has no leading/trailing whitespace |

### Sort Order Contract

On every render, tasks are ordered: **incomplete first (insertion order preserved), completed last (insertion order preserved)**.

### Error Handling Strategy

- `loadTasks()` catches JSON parse errors and returns `[]` (graceful degradation).
- `saveTasks()` wraps `localStorage.setItem` in try/catch; logs to console, does not throw.
- DOM event handlers wrap logic in try/catch; log errors to console.
- No network calls; no async error surfaces.

---

## Decisions (ADRs)

### ADR-001 — Vanilla JS vs Framework (React/Vue/Svelte)

**Context**: The application is small (7 FRs, single user), requires minimal setup (NFR-005), and must run without a build step.

**Decision**: Vanilla JavaScript with ES2020 modules.

**Alternatives**:
1. **React (Vite)**: Familiar component model but requires Node.js build step, violating NFR-005 for simplest case.
2. **Vue 3 (CDN)**: Can run without build via CDN script, but adds a ~34 KB runtime dependency and extra learning overhead not warranted by this scope.

**Consequences**:
- No virtual DOM; DOM manipulation is manual but straightforward at this scale.
- No reactive data binding; re-render function called explicitly after state changes.
- Zero external production dependencies.

---

### ADR-002 — localStorage vs Backend Persistence

**Context**: NFR-004 requires task data to persist across page reloads. No multi-user or server requirement is stated. NFR-005 requires minimal setup.

**Decision**: `localStorage` (browser-native key/value store).

**Alternatives**:
1. **IndexedDB**: More powerful but significantly more complex API; not needed for a flat task array.
2. **Lightweight backend (Flask/Express + SQLite)**: Enables server-side persistence, but requires a running server, violating NFR-005 for simplest case.

**Consequences**:
- Data is browser-local and origin-scoped; not shared across devices.
- ~5 MB storage limit — sufficient for a personal task list.
- Data is lost if user clears browser storage; acceptable for stated scope.

---

### ADR-003 — Playwright for Verification

**Context**: Acceptance criteria are all UI behavioral (click, input, list render). The project standard specifies Playwright + TypeScript for the `test-automation/` folder.

**Decision**: Playwright + TypeScript.

**Alternatives**:
1. **Cypress**: Similar capability but heavier startup; TypeScript support is secondary.
2. **Manual QA only**: Not repeatable; fails the verification gate requirement.

**Consequences**:
- Tests spin up a local static server via Playwright `webServer` config.
- No additional framework decision needed; Playwright is the project standard.

---

## Testing Strategy

### Verification (mandatory)

- **Framework**: Playwright + TypeScript (project standard).
- **Location**: `test-automation/tests/task-manager.spec.ts`.
- **Coverage targets** (one test per AC):

| Test ID | AC | Scenario |
|---------|----|----------|
| T-001 | AC-001-1 | Page load renders existing tasks |
| T-002 | AC-002-1 | Add task saves and appears in list |
| T-003 | AC-003-1 | Checkbox toggles complete + strikethrough |
| T-004 | AC-004-1 | Delete button removes task |
| T-005 | AC-005-1 | Empty submit shows "Task name is required" |
| T-006 | AC-006-1 | Completed tasks sort to bottom on load |
| T-007 | AC-007-1 | Clear Completed removes all completed tasks |

### Unit Tests (optional)

- `storage.js` is testable in isolation. If added, use Vitest or plain browser assertions. Not required by current phase gates.

---

## Security Considerations

- **XSS prevention**: Task names are written as `textContent`, never `innerHTML`. No HTML injection possible.
- **Input validation**: Task name is trimmed and checked non-empty before any DOM write or persistence call.
- **No sensitive data**: localStorage contains only task name, id, and completed flag — no PII or tokens.
- **No external network calls**: Zero network attack surface.
- **No secrets**: No API keys or credentials in this application.

---

## Risks

| # | Risk | Severity | Mitigation |
|---|------|----------|------------|
| R-001 | `localStorage` unavailable (private/incognito mode in some browsers) | Medium | `saveTasks`/`loadTasks` silently degrade; user sees empty list on reload. Document in README. |
| R-002 | Large task lists may cause slow re-renders | Low | Out of scope for personal task manager at this scale. |
| R-003 | Playwright requires a static file server; `file://` URLs may not work | Medium | Use Playwright `webServer` config to auto-start `npx serve dev/` during test runs. |

---

## Open Questions

1. Should task names have a maximum length? (Not stated in requirements; assume 500 chars as a soft limit — to be confirmed.)
2. Should the "Clear Completed" button be hidden when no completed tasks exist, or always visible? (Requirements say "provide a button" — assume always visible for simplicity.)
3. Should unit tests for `storage.js` be added in implementation? (Optional; not required by phase gates.)
