# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: success-error-handling.spec.ts >> FR-006: Upload Success Confirmation >> AC-014: Success message includes uploaded filename
- Location: tests\success-error-handling.spec.ts:61:7

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
  2   | import path from 'path';
  3   | import fs from 'fs';
  4   | 
  5   | /**
  6   |  * Test Suite: Success Confirmation and Error Handling
  7   |  * Covers: AC-013, AC-014 (FR-006), AC-015, AC-016, AC-017 (FR-007)
  8   |  */
  9   | 
  10  | test.describe('FR-006: Upload Success Confirmation', () => {
  11  | 
  12  |   test.beforeAll(() => {
  13  |     const fixturesDir = path.join(__dirname, '../fixtures');
  14  |     const validPdf = path.join(fixturesDir, 'success-test.pdf');
  15  | 
  16  |     if (!fs.existsSync(validPdf)) {
  17  |       fs.mkdirSync(fixturesDir, { recursive: true });
  18  |       const pdfContent = `%PDF-1.4
  19  | 1 0 obj
  20  | << /Type /Catalog /Pages 2 0 R >>
  21  | endobj
  22  | 2 0 obj
  23  | << /Type /Pages /Kids [3 0 R] /Count 1 >>
  24  | endobj
  25  | 3 0 obj
  26  | << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>
  27  | endobj
  28  | xref
  29  | 0 4
  30  | 0000000000 65535 f
  31  | 0000000009 00000 n
  32  | 0000000058 00000 n
  33  | 0000000115 00000 n
  34  | trailer
  35  | << /Size 4 /Root 1 0 R >>
  36  | startxref
  37  | 200
  38  | %%EOF`;
  39  |       fs.writeFileSync(validPdf, pdfContent);
  40  |     }
  41  |   });
  42  | 
  43  |   test('AC-013: System displays success message after upload', async ({ page }) => {
  44  |     await page.goto('/');
  45  | 
  46  |     const fixturesDir = path.join(__dirname, '../fixtures');
  47  | 
  48  |     // Select and upload file
  49  |     // Use setInputFiles instead
  50  |     await page.locator('#selectFileBtn').click();
  51  |     const fileChooser = await fileChooserPromise;
  52  |     await fileChooser.setFiles(path.join(fixturesDir, 'success-test.pdf'));
  53  | 
  54  |     await page.locator('#uploadBtn').click();
  55  | 
  56  |     // Wait for success message
  57  |     const messageArea = page.locator('#messageArea');
  58  |     await expect(messageArea).toContainText('File uploaded successfully', { timeout: 10000 });
  59  |   });
  60  | 
  61  |   test('AC-014: Success message includes uploaded filename', async ({ page }) => {
  62  |     await page.goto('/');
  63  | 
  64  |     const fixturesDir = path.join(__dirname, '../fixtures');
  65  | 
  66  |     // Select and upload file
> 67  |     // Use setInputFiles instead
      |                                     ^ Error: page.waitForEvent: Test timeout of 30000ms exceeded.
  68  |     await page.locator('#selectFileBtn').click();
  69  |     const fileChooser = await fileChooserPromise;
  70  |     await fileChooser.setFiles(path.join(fixturesDir, 'success-test.pdf'));
  71  | 
  72  |     await page.locator('#uploadBtn').click();
  73  | 
  74  |     // Wait for success message with filename
  75  |     const messageArea = page.locator('#messageArea');
  76  |     await expect(messageArea).toContainText('success-test.pdf', { timeout: 10000 });
  77  |     await expect(messageArea).toContainText('File uploaded successfully');
  78  |   });
  79  | 
  80  |   test('Success message displayed in message area', async ({ page }) => {
  81  |     await page.goto('/');
  82  | 
  83  |     const fixturesDir = path.join(__dirname, '../fixtures');
  84  | 
  85  |     // Upload file
  86  |     // Use setInputFiles instead
  87  |     await page.locator('#selectFileBtn').click();
  88  |     const fileChooser = await fileChooserPromise;
  89  |     await fileChooser.setFiles(path.join(fixturesDir, 'success-test.pdf'));
  90  | 
  91  |     await page.locator('#uploadBtn').click();
  92  | 
  93  |     // Verify message area has role="alert" for accessibility
  94  |     const messageArea = page.locator('#messageArea');
  95  |     await expect(messageArea).toHaveAttribute('role', 'alert');
  96  |     await expect(messageArea).not.toBeEmpty({ timeout: 10000 });
  97  |   });
  98  | 
  99  |   test('Progress container hidden after successful upload', async ({ page }) => {
  100 |     await page.goto('/');
  101 | 
  102 |     const fixturesDir = path.join(__dirname, '../fixtures');
  103 | 
  104 |     // Upload file
  105 |     // Use setInputFiles instead
  106 |     await page.locator('#selectFileBtn').click();
  107 |     const fileChooser = await fileChooserPromise;
  108 |     await fileChooser.setFiles(path.join(fixturesDir, 'success-test.pdf'));
  109 | 
  110 |     await page.locator('#uploadBtn').click();
  111 | 
  112 |     // Wait for upload to complete
  113 |     const messageArea = page.locator('#messageArea');
  114 |     await expect(messageArea).toContainText('File uploaded successfully', { timeout: 10000 });
  115 | 
  116 |     // Verify progress container is hidden
  117 |     const progressContainer = page.locator('#progressContainer');
  118 |     await expect(progressContainer).toBeHidden();
  119 |   });
  120 | });
  121 | 
  122 | test.describe('FR-007: Error Handling and Retry', () => {
  123 | 
  124 |   test('AC-015: Network error displays specific error message', async ({ page, context }) => {
  125 |     await page.goto('/');
  126 | 
  127 |     const fixturesDir = path.join(__dirname, '../fixtures');
  128 | 
  129 |     // Simulate network error by going offline
  130 |     await context.setOffline(true);
  131 | 
  132 |     // Select and try to upload file
  133 |     // Use setInputFiles instead
  134 |     await page.locator('#selectFileBtn').click();
  135 |     const fileChooser = await fileChooserPromise;
  136 |     await fileChooser.setFiles(path.join(fixturesDir, 'success-test.pdf'));
  137 | 
  138 |     await page.locator('#uploadBtn').click();
  139 | 
  140 |     // Wait for error message
  141 |     const messageArea = page.locator('#messageArea');
  142 |     await expect(messageArea).toContainText('Upload failed due to network error', { timeout: 10000 });
  143 |     await expect(messageArea).toContainText('Please try again');
  144 | 
  145 |     // Restore network
  146 |     await context.setOffline(false);
  147 |   });
  148 | 
  149 |   test('AC-016: Server error (5xx) displays specific error message', async ({ page }) => {
  150 |     // This test requires mocking the server response
  151 |     await page.goto('/');
  152 | 
  153 |     const fixturesDir = path.join(__dirname, '../fixtures');
  154 | 
  155 |     // Intercept upload request and return 500 error
  156 |     await page.route('**/upload', route => {
  157 |       route.fulfill({
  158 |         status: 500,
  159 |         contentType: 'application/json',
  160 |         body: JSON.stringify({ error: 'Internal server error' })
  161 |       });
  162 |     });
  163 | 
  164 |     // Select and upload file
  165 |     // Use setInputFiles instead
  166 |     await page.locator('#selectFileBtn').click();
  167 |     const fileChooser = await fileChooserPromise;
```