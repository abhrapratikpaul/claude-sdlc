# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: nfr-accessibility.spec.ts >> NFR-001: Upload Timeout >> AC-024: Timeout displays error and allows retry
- Location: tests\nfr-accessibility.spec.ts:44:7

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
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | /**
  4   |  * Test Suite: Non-Functional Requirements - Accessibility and UI
  5   |  * Covers: AC-023, AC-024 (NFR-001), AC-025, AC-026, AC-027 (NFR-002),
  6   |  *         AC-031, AC-032 (NFR-004), AC-033 (NFR-005), AC-034 (NFR-006)
  7   |  */
  8   | 
  9   | test.describe('NFR-001: Upload Timeout', () => {
  10  | 
  11  |   test('AC-023: Upload requests timeout after 2 minutes', async ({ page }) => {
  12  |     // This test simulates a slow upload by intercepting the request
  13  |     await page.goto('/');
  14  | 
  15  |     const fixturesDir = require('path').join(__dirname, '../fixtures');
  16  | 
  17  |     // Intercept upload and delay indefinitely
  18  |     await page.route('**/upload', async route => {
  19  |       // Don't fulfill - let it hang until timeout
  20  |       await new Promise(resolve => setTimeout(resolve, 130000)); // 2:10 minutes
  21  |       route.abort('timedout');
  22  |     });
  23  | 
  24  |     // Select and upload file
  25  |     // Use setInputFiles instead
  26  |     await page.locator('#selectFileBtn').click();
  27  |     const fileChooser = await fileChooserPromise;
  28  |     await fileChooser.setFiles(require('path').join(fixturesDir, 'valid.pdf'));
  29  | 
  30  |     const startTime = Date.now();
  31  |     await page.locator('#uploadBtn').click();
  32  | 
  33  |     // Wait for error message (timeout should occur around 120s)
  34  |     const messageArea = page.locator('#messageArea');
  35  |     await expect(messageArea).not.toBeEmpty({ timeout: 130000 });
  36  | 
  37  |     const elapsed = (Date.now() - startTime) / 1000;
  38  | 
  39  |     // Verify timeout occurred around 2 minutes (allow 10s variance)
  40  |     expect(elapsed).toBeGreaterThan(110);
  41  |     expect(elapsed).toBeLessThan(140);
  42  |   });
  43  | 
  44  |   test('AC-024: Timeout displays error and allows retry', async ({ page }) => {
  45  |     await page.goto('/');
  46  | 
  47  |     const fixturesDir = require('path').join(__dirname, '../fixtures');
  48  | 
  49  |     // Intercept and timeout
  50  |     await page.route('**/upload', route => route.abort('timedout'));
  51  | 
  52  |     // Upload file
> 53  |     // Use setInputFiles instead
      |                                     ^ Error: page.waitForEvent: Test timeout of 30000ms exceeded.
  54  |     await page.locator('#selectFileBtn').click();
  55  |     const fileChooser = await fileChooserPromise;
  56  |     await fileChooser.setFiles(require('path').join(fixturesDir, 'valid.pdf'));
  57  | 
  58  |     await page.locator('#uploadBtn').click();
  59  | 
  60  |     // Verify error message
  61  |     const messageArea = page.locator('#messageArea');
  62  |     await expect(messageArea).toContainText('Upload failed', { timeout: 5000 });
  63  | 
  64  |     // Verify retry button appears
  65  |     const retryButton = page.locator('#retryBtn');
  66  |     await expect(retryButton).toBeVisible();
  67  |   });
  68  | });
  69  | 
  70  | test.describe('NFR-002: Web Accessibility', () => {
  71  | 
  72  |   test('AC-025: Interface uses semantic HTML elements', async ({ page }) => {
  73  |     await page.goto('/');
  74  | 
  75  |     // Verify semantic elements
  76  |     const main = page.locator('main');
  77  |     await expect(main).toBeVisible();
  78  | 
  79  |     const h1 = page.locator('h1');
  80  |     await expect(h1).toBeVisible();
  81  |     await expect(h1).toHaveText('PDF Document Upload');
  82  | 
  83  |     // Verify buttons use <button> element, not divs
  84  |     const buttons = page.locator('button');
  85  |     const buttonCount = await buttons.count();
  86  |     expect(buttonCount).toBeGreaterThanOrEqual(3); // select, upload, retry buttons
  87  |   });
  88  | 
  89  |   test('AC-026: All interactive elements are keyboard-navigable', async ({ page }) => {
  90  |     await page.goto('/');
  91  | 
  92  |     // Tab through elements
  93  |     await page.keyboard.press('Tab');
  94  |     let focused = await page.evaluate(() => document.activeElement?.id);
  95  |     expect(focused).toBe('selectFileBtn');
  96  | 
  97  |     await page.keyboard.press('Tab');
  98  |     focused = await page.evaluate(() => document.activeElement?.id);
  99  |     expect(focused).toBe('uploadBtn');
  100 | 
  101 |     // Verify buttons can be activated with keyboard
  102 |     await page.locator('#selectFileBtn').focus();
  103 |     // Use setInputFiles instead
  104 |     await page.keyboard.press('Enter');
  105 |     const fileChooser = await fileChooserPromise;
  106 |     expect(fileChooser).toBeTruthy();
  107 |   });
  108 | 
  109 |   test('AC-027: Interface targets WCAG 2.1 Level AA compliance', async ({ page }) => {
  110 |     await page.goto('/');
  111 | 
  112 |     // Check ARIA attributes
  113 |     const fileInput = page.locator('#fileInput');
  114 |     await expect(fileInput).toHaveAttribute('aria-label');
  115 | 
  116 |     const messageArea = page.locator('#messageArea');
  117 |     await expect(messageArea).toHaveAttribute('role', 'alert');
  118 |     await expect(messageArea).toHaveAttribute('aria-live', 'assertive');
  119 | 
  120 |     const filenameDisplay = page.locator('#selectedFileName');
  121 |     await expect(filenameDisplay).toHaveAttribute('role', 'status');
  122 |     await expect(filenameDisplay).toHaveAttribute('aria-live', 'polite');
  123 | 
  124 |     const progressBar = page.locator('#progressBar');
  125 |     await expect(progressBar).toHaveAttribute('aria-label');
  126 | 
  127 |     // Check for valid HTML structure
  128 |     const html = await page.content();
  129 |     expect(html).toContain('<!DOCTYPE html>');
  130 |     expect(html).toContain('lang="en"');
  131 |   });
  132 | 
  133 |   test('Buttons have visible focus indicators', async ({ page }) => {
  134 |     await page.goto('/');
  135 | 
  136 |     // Focus select button
  137 |     await page.locator('#selectFileBtn').focus();
  138 | 
  139 |     // Check computed styles (should have outline or visible focus style)
  140 |     const selectBtn = page.locator('#selectFileBtn');
  141 |     await expect(selectBtn).toBeFocused();
  142 | 
  143 |     // Verify focus is visually distinct (implementation-dependent)
  144 |     const outlineWidth = await selectBtn.evaluate(el => {
  145 |       return window.getComputedStyle(el).outlineWidth;
  146 |     });
  147 |     expect(outlineWidth).not.toBe('0px');
  148 |   });
  149 | });
  150 | 
  151 | test.describe('NFR-004: UI Simplicity', () => {
  152 | 
  153 |   test('AC-031: Interface is a single standalone web page', async ({ page }) => {
```