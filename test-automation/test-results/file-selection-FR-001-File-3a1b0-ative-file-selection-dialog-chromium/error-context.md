# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: file-selection.spec.ts >> FR-001: File Selection Interface >> AC-002: Clicking button opens native file selection dialog
- Location: tests\file-selection.spec.ts:22:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForEvent: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for event "filechooser"
============================================================
```

# Page snapshot

```yaml
- main [ref=e2]:
  - heading "PDF Document Upload" [level=1] [ref=e3]
  - generic [ref=e4]:
    - button "Choose PDF File" [active] [ref=e5]
    - status
    - button "Upload File" [disabled] [ref=e6]
  - alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | /**
  4  |  * Test Suite: File Selection Interface
  5  |  * Covers: AC-001, AC-002 (FR-001)
  6  |  */
  7  | 
  8  | test.describe('FR-001: File Selection Interface', () => {
  9  | 
  10 |   test('AC-001: Interface displays clearly labeled "Choose PDF File" button', async ({ page }) => {
  11 |     await page.goto('/');
  12 | 
  13 |     // Verify button exists and has correct text
  14 |     const selectButton = page.locator('#selectFileBtn');
  15 |     await expect(selectButton).toBeVisible();
  16 |     await expect(selectButton).toHaveText('Choose PDF File');
  17 | 
  18 |     // Verify button is interactive (not disabled)
  19 |     await expect(selectButton).toBeEnabled();
  20 |   });
  21 | 
  22 |   test('AC-002: Clicking button opens native file selection dialog', async ({ page }) => {
  23 |     await page.goto('/');
  24 | 
  25 |     // Set up file chooser listener before clicking
> 26 |     const fileChooserPromise = page.waitForEvent('filechooser');
     |                                     ^ Error: page.waitForEvent: Test timeout of 30000ms exceeded.
  27 | 
  28 |     // Click the visible button
  29 |     await page.locator('#selectFileBtn').click();
  30 | 
  31 |     // Verify file chooser opens
  32 |     const fileChooser = await fileChooserPromise;
  33 |     expect(fileChooser).toBeTruthy();
  34 | 
  35 |     // Verify it accepts .pdf files
  36 |     expect(fileChooser.isMultiple()).toBe(false);
  37 |   });
  38 | 
  39 |   test('File input has correct attributes', async ({ page }) => {
  40 |     await page.goto('/');
  41 | 
  42 |     // Verify hidden file input exists with correct attributes
  43 |     const fileInput = page.locator('#fileInput');
  44 |     await expect(fileInput).toHaveAttribute('type', 'file');
  45 |     await expect(fileInput).toHaveAttribute('accept', '.pdf');
  46 |     await expect(fileInput).toHaveAttribute('aria-label', 'Select PDF file');
  47 |   });
  48 | 
  49 |   test('Upload button is initially disabled', async ({ page }) => {
  50 |     await page.goto('/');
  51 | 
  52 |     const uploadButton = page.locator('#uploadBtn');
  53 |     await expect(uploadButton).toBeVisible();
  54 |     await expect(uploadButton).toBeDisabled();
  55 |   });
  56 | });
  57 | 
```