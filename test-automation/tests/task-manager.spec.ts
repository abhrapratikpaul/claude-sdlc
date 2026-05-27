import { test, expect, Page } from '@playwright/test';

/**
 * Task Manager — Acceptance Criteria Verification
 *
 * AC-001-1  FR-001  Task List Display
 * AC-002-1  FR-002  Add Task
 * AC-003-1  FR-003  Complete Task (checkbox + strikethrough)
 * AC-004-1  FR-004  Delete Task
 * AC-005-1  FR-005  Validation: empty task name
 * AC-006-1  FR-006  Completed tasks sorted to bottom
 * AC-007-1  FR-007  Clear Completed button removes all completed tasks
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function addTask(page: Page, name: string): Promise<void> {
  await page.fill('#task-input', name);
  await page.click('#add-task-btn');
}

async function getTaskNames(page: Page): Promise<string[]> {
  return page.locator('#task-list li span').allTextContents();
}

async function getCompletedTaskNames(page: Page): Promise<string[]> {
  return page.locator('#task-list li.completed span').allTextContents();
}

async function getIncompleteTaskNames(page: Page): Promise<string[]> {
  return page.locator('#task-list li:not(.completed) span').allTextContents();
}

// ---------------------------------------------------------------------------
// Test setup: navigate and clear localStorage before each test
// ---------------------------------------------------------------------------

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  // Wait for DOM attachment — the empty list has zero height so 'visible' state would fail
  await page.waitForSelector('#task-list', { state: 'attached' });
});

// ---------------------------------------------------------------------------
// AC-001-1  FR-001 — Task List Display
// ---------------------------------------------------------------------------

test('AC-001-1: page loads and renders stored tasks in a visible list', async ({ page }) => {
  await page.evaluate(() => {
    const tasks = [
      { id: 'id-a', name: 'Stored Task Alpha', completed: false },
      { id: 'id-b', name: 'Stored Task Beta', completed: false },
    ];
    localStorage.setItem('tasks', JSON.stringify(tasks));
  });

  await page.reload();
  await page.waitForSelector('#task-list', { state: 'attached' });

  const names = await getTaskNames(page);
  expect(names).toContain('Stored Task Alpha');
  expect(names).toContain('Stored Task Beta');

  await expect(page.locator('#task-list')).toBeVisible();
  const items = page.locator('#task-list li');
  await expect(items).toHaveCount(2);
  for (const item of await items.all()) {
    await expect(item).toBeVisible();
  }
});

// ---------------------------------------------------------------------------
// AC-002-1  FR-002 — Add Task
// ---------------------------------------------------------------------------

test('AC-002-1: entering a task name and clicking Add Task saves and shows it in the list', async ({ page }) => {
  await addTask(page, 'Buy groceries');

  const names = await getTaskNames(page);
  expect(names).toContain('Buy groceries');

  await expect(page.locator('#task-input')).toHaveValue('');

  await page.reload();
  await page.waitForSelector('#task-list', { state: 'attached' });
  const namesAfterReload = await getTaskNames(page);
  expect(namesAfterReload).toContain('Buy groceries');
});

// ---------------------------------------------------------------------------
// AC-003-1  FR-003 — Complete Task
// ---------------------------------------------------------------------------

test('AC-003-1: clicking the checkbox marks the task complete with strikethrough', async ({ page }) => {
  await addTask(page, 'Read a book');

  const checkbox = page.locator('#task-list li input[type="checkbox"]').first();
  await expect(checkbox).not.toBeChecked();

  await checkbox.check();

  const li = page.locator('#task-list li.completed').first();
  await expect(li).toBeVisible();

  const span = li.locator('span');
  await expect(span).toHaveCSS('text-decoration', /line-through/);
});

// ---------------------------------------------------------------------------
// AC-004-1  FR-004 — Delete Task
// ---------------------------------------------------------------------------

test('AC-004-1: clicking the Delete button removes the task from the list immediately', async ({ page }) => {
  await addTask(page, 'Task to delete');

  const initialCount = await page.locator('#task-list li').count();
  expect(initialCount).toBeGreaterThan(0);

  const deleteBtn = page.locator('#task-list li .delete-btn').first();
  await deleteBtn.click();

  const names = await getTaskNames(page);
  expect(names).not.toContain('Task to delete');

  const finalCount = await page.locator('#task-list li').count();
  expect(finalCount).toBe(initialCount - 1);
});

// ---------------------------------------------------------------------------
// AC-005-1  FR-005 — Validation: empty task name
// ---------------------------------------------------------------------------

test('AC-005-1: clicking Add Task with empty input shows error message', async ({ page }) => {
  await page.fill('#task-input', '');

  await expect(page.locator('#error-message')).toBeHidden();

  await page.click('#add-task-btn');

  const errorEl = page.locator('#error-message');
  await expect(errorEl).toBeVisible();
  await expect(errorEl).toHaveText('Task name is required');

  const count = await page.locator('#task-list li').count();
  expect(count).toBe(0);
});

test('AC-005-1 (DR-001): error message clears when user types after a failed empty submit', async ({ page }) => {
  await page.click('#add-task-btn');
  await expect(page.locator('#error-message')).toBeVisible();

  await page.fill('#task-input', 'x');

  await expect(page.locator('#error-message')).toBeHidden();
});

// ---------------------------------------------------------------------------
// AC-006-1  FR-006 — Completed tasks appear below incomplete tasks
// ---------------------------------------------------------------------------

test('AC-006-1: completed tasks appear below incomplete tasks after toggle', async ({ page }) => {
  await addTask(page, 'Task One');
  await addTask(page, 'Task Two');
  await addTask(page, 'Task Three');

  // Confirm 3 items with no completed tasks yet
  await expect(page.locator('#task-list li')).toHaveCount(3);
  await expect(page.locator('#task-list li.completed')).toHaveCount(0);

  // Complete "Task One" by clicking its checkbox — find the li containing that span
  const targetLi = page.locator('#task-list li', { has: page.locator('span', { hasText: 'Task One' }) });
  const checkbox = targetLi.locator('input[type="checkbox"]');
  await checkbox.check();

  // Wait for completed class to appear
  await expect(page.locator('#task-list li.completed')).toHaveCount(1);

  const names = await getTaskNames(page);
  const completedNames = await getCompletedTaskNames(page);
  const incompleteNames = await getIncompleteTaskNames(page);

  expect(completedNames.length).toBe(1);
  expect(incompleteNames.length).toBe(2);

  // Every incomplete task must precede every completed task in rendered order
  const lastIncompleteIndex = Math.max(...incompleteNames.map((n: string) => names.indexOf(n)));
  const firstCompletedIndex = Math.min(...completedNames.map((n: string) => names.indexOf(n)));
  expect(lastIncompleteIndex).toBeLessThan(firstCompletedIndex);
});

test('AC-006-1 (reload): sort order preserved after page reload', async ({ page }) => {
  await page.evaluate(() => {
    const tasks = [
      { id: 'id-1', name: 'Done Task', completed: true },
      { id: 'id-2', name: 'Pending Task', completed: false },
    ];
    localStorage.setItem('tasks', JSON.stringify(tasks));
  });

  await page.reload();
  await page.waitForSelector('#task-list', { state: 'attached' });

  const names = await getTaskNames(page);
  expect(names.indexOf('Pending Task')).toBeLessThan(names.indexOf('Done Task'));
});

// ---------------------------------------------------------------------------
// AC-007-1  FR-007 — Clear Completed removes all completed tasks
// ---------------------------------------------------------------------------

test('AC-007-1: Clear Completed removes all completed tasks and keeps incomplete ones', async ({ page }) => {
  await addTask(page, 'Keep me');
  await addTask(page, 'Delete me A');
  await addTask(page, 'Delete me B');

  const checkboxes = page.locator('#task-list li input[type="checkbox"]');
  const count = await checkboxes.count();
  await checkboxes.nth(count - 2).check();
  await checkboxes.nth(count - 1).check();

  const completedBefore = await getCompletedTaskNames(page);
  expect(completedBefore.length).toBeGreaterThan(0);

  await page.click('#clear-completed-btn');

  const completedAfter = await getCompletedTaskNames(page);
  expect(completedAfter).toHaveLength(0);

  const remaining = await getTaskNames(page);
  expect(remaining).toContain('Keep me');
  expect(remaining).not.toContain('Delete me A');
  expect(remaining).not.toContain('Delete me B');
});

// ---------------------------------------------------------------------------
// NFR-004 — Data persistence across reloads
// ---------------------------------------------------------------------------

test('NFR-004: tasks persist across page reloads', async ({ page }) => {
  await addTask(page, 'Persistent Task');

  await page.reload();
  await page.waitForSelector('#task-list', { state: 'attached' });

  const names = await getTaskNames(page);
  expect(names).toContain('Persistent Task');
});
