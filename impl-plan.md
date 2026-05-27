# Implementation Plan: Task Manager Application

**Source artifacts**: `requirements.md`, `architecture.md`, `design-review.md`
**Date**: 2026-05-27
**Status**: Ready for implementation

---

## Overview

Deliver a static, browser-only Task Manager as four files under `dev/`:
- `dev/index.html` — DOM shell
- `dev/style.css` — presentation
- `dev/storage.js` — localStorage adapter
- `dev/app.js` — business logic + DOM controller

All production code lives exclusively under `dev/`. No build step required.

---

## Dependency Order

Tasks must be executed in the sequence below. Each task declares its inputs (prerequisites) and outputs (deliverables).

---

### TASK-01 — Create `dev/storage.js`

**Priority**: P0 — all other tasks depend on this
**Inputs**: architecture.md (storage.js interface contract)
**Outputs**: `dev/storage.js`

**Deliverable specification**:

- Export `loadTasks()`:
  - Reads `localStorage.getItem('tasks')`
  - Returns Task array; returns empty array on missing key or JSON parse error (catch block, log to console)
- Export `saveTasks(tasks)`:
  - Wraps `localStorage.setItem('tasks', JSON.stringify(tasks))` in try/catch
  - On failure: logs to console; calls injected callback registered via `setSaveErrorCallback(fn)`
  - Returns void
- Export `setSaveErrorCallback(fn)`:
  - Stores a callback so `saveTasks` can invoke it on failure

**Task shape (reference)**:

    Task {
      id        : string   // crypto.randomUUID() — DR-002: never Math.random()
      name      : string   // trimmed, non-empty
      completed : boolean  // false on creation
    }

**Constraints**:
- Use ES2020 module syntax (`export function`)
- No DOM access in this file
- No external imports

---

### TASK-02 — Create `dev/index.html`

**Priority**: P0
**Inputs**: architecture.md (DOM structure), TASK-01 (script src reference)
**Outputs**: `dev/index.html`

**Required DOM elements (IDs are the stable contract for Playwright tests)**:

| Element | Type | id | Notes |
|---------|------|----|-------|
| Task name input | input[type="text"] | #task-input | placeholder="Enter task name" |
| Add Task button | button | #add-task-btn | Text: "Add Task" |
| Error message area | p | #error-message | Hidden by default via CSS |
| Task list container | ul | #task-list | Empty on first load |
| Clear Completed button | button | #clear-completed-btn | Always visible |

**Script loading**:
- script type="module" src="app.js" — deferred automatically by ES module semantics
- link rel="stylesheet" href="style.css"

**Constraints**:
- Zero inline script blocks
- Zero inline style attributes
- Valid HTML5 (DOCTYPE html)

---

### TASK-03 — Create `dev/app.js`

**Priority**: P0
**Inputs**: TASK-01 (storage.js), TASK-02 (DOM IDs)
**Outputs**: `dev/app.js`

**Functions to implement** (all private, not exported):

#### `init()`
- Registered on DOMContentLoaded
- Calls loadTasks(), sorts, calls renderList(tasks)
- Attaches event listeners: #add-task-btn click -> handleAddTask, #clear-completed-btn click -> handleClearCompleted
- Calls setSaveErrorCallback(showPersistenceWarning) — DR-003 fix

#### `renderList(tasks)`
- Clears #task-list (innerHTML = '')
- Applies sort: incomplete first (insertion order), completed last (insertion order)
- For each task creates li containing:
  - input[type="checkbox"][data-id] checked if task.completed
  - span with task.name set via textContent (never innerHTML for user data)
  - button[data-id][class="delete-btn"] text "Delete"
  - Completed li receives CSS class "completed"
- Attaches per-item events: checkbox change -> handleToggleComplete, Delete click -> handleDelete

#### `handleAddTask()`
- Reads #task-input value, trims it
- If empty: sets #error-message textContent to "Task name is required", shows it, returns
- If valid:
  - Clears #error-message (hidden)
  - Creates Task with crypto.randomUUID() — DR-002 fix
  - Pushes to tasks array, calls saveTasks(tasks), calls renderList(tasks), clears input
- DR-001 fix: attach input event on #task-input in init() to clear #error-message on any keystroke

#### `handleToggleComplete(event)`
- Reads data-id from event.target
- Flips task.completed for matching task
- Calls saveTasks(tasks), renderList(tasks)

#### `handleDelete(event)`
- Reads data-id from event.target
- Filters task out of tasks array
- Calls saveTasks(tasks), renderList(tasks)

#### `handleClearCompleted()`
- Filters tasks to incomplete only
- Calls saveTasks(tasks), renderList(tasks)

#### `showPersistenceWarning()`
- Displays non-blocking warning message in UI
- Example: "Could not save — changes may not persist"
- DR-003 fix: called by storage.js on localStorage failure

**Constraints**:
- Import { loadTasks, saveTasks, setSaveErrorCallback } from './storage.js'
- Use textContent exclusively for user-generated content
- Module-level: let tasks = []
- Wrap all event handlers in try/catch; log errors to console

---

### TASK-04 — Create `dev/style.css`

**Priority**: P0
**Inputs**: TASK-02 (DOM IDs and classes)
**Outputs**: `dev/style.css`

**Required styles**:

| Target | Rule |
|--------|------|
| li.completed span | text-decoration: line-through; color: #888; |
| #error-message (default) | display: none |
| #error-message when shown | display: block; color: red |
| #task-input | Reasonable width, padding |
| #task-list | list-style: none; padding: 0 |
| General | Clean font, centered max-width container |

**Constraints**:
- Plain CSS3 only — no Sass, PostCSS
- No external font imports
- Responsive at viewport widths >= 320px

---

### TASK-05 — Manual smoke-test checkpoint

**Priority**: P0
**Inputs**: TASK-01 through TASK-04 complete
**Outputs**: No file artifact — validation checkpoint only

**Steps** (serve with `npx serve dev/` for ES module support):
1. Page loads with empty task list
2. Add a task — confirm it appears
3. Check checkbox — confirm strikethrough
4. Click Delete — confirm task removed
5. Submit empty input — confirm "Task name is required" appears
6. Type in input after error — confirm error clears (DR-001)
7. Add tasks, complete some, reload — confirm sort order and persistence (NFR-004, FR-006)
8. Click "Clear Completed" — confirm only incomplete tasks remain (FR-007)

**Pass criteria**: All 8 steps pass. Fix in the relevant TASK before proceeding.

---

## File Map

| Task | File | Requirements Covered |
|------|------|----------------------|
| TASK-01 | dev/storage.js | NFR-004 |
| TASK-02 | dev/index.html | FR-001 through FR-007 (DOM shell) |
| TASK-03 | dev/app.js | FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, DR-001, DR-002, DR-003 |
| TASK-04 | dev/style.css | FR-003 (strikethrough), NFR-002, NFR-003 |
| TASK-05 | (none) | All P0 FRs (smoke validation) |

---

## Design Review Finding Resolutions

| Finding | Severity | Resolution |
|---------|----------|------------|
| DR-001: error-message clearing lifecycle | minor | TASK-03: clear on valid submit + on input event |
| DR-002: UUID generation not named | minor | TASK-03: crypto.randomUUID() explicitly specified |
| DR-003: silent persistence failure | minor | TASK-01 + TASK-03: showPersistenceWarning via setSaveErrorCallback |

---

## Out of Scope

- Unit tests for storage.js (optional per architecture.md)
- Task name maximum length enforcement (no FR requirement)
- "Clear Completed" hidden-when-empty behavior (always visible)
- Any backend, server-side runtime, or build tooling

---

## Phase 5 Exit Criteria

Phase 5 (Implementation) is complete when:
1. All four files (dev/index.html, dev/app.js, dev/storage.js, dev/style.css) exist and are non-empty
2. TASK-05 smoke-test passes (all 8 steps)
3. textContent used exclusively for user-generated content
4. crypto.randomUUID() used for task IDs
5. No hardcoded secrets or external network calls
6. All event handlers wrapped in try/catch
7. dev/ folder contains no TypeScript, package.json, or test tooling