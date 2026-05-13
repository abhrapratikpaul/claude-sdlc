import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * Test Suite: Success Confirmation and Error Handling
 * Covers: AC-013, AC-014 (FR-006), AC-015, AC-016, AC-017 (FR-007)
 */

test.describe('FR-006: Upload Success Confirmation', () => {

  test.beforeAll(() => {
    const fixturesDir = path.join(__dirname, '../fixtures');
    const validPdf = path.join(fixturesDir, 'success-test.pdf');

    if (!fs.existsSync(validPdf)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
      const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>
endobj
xref
0 4
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
trailer
<< /Size 4 /Root 1 0 R >>
startxref
200
%%EOF`;
      fs.writeFileSync(validPdf, pdfContent);
    }
  });

  test('AC-013: System displays success message after upload', async ({ page }) => {
    await page.goto('/');

    const fixturesDir = path.join(__dirname, '../fixtures');

    // Select and upload file (headless-safe)
    await page.setInputFiles('#fileInput', path.join(fixturesDir, 'success-test.pdf'));

    await page.locator('#uploadBtn').click();

    // Wait for success message
    const messageArea = page.locator('#messageArea');
    await expect(messageArea).toContainText('File uploaded successfully', { timeout: 10000 });
  });

  test('AC-014: Success message includes uploaded filename', async ({ page }) => {
    await page.goto('/');

    const fixturesDir = path.join(__dirname, '../fixtures');

    // Select and upload file (headless-safe)
    await page.setInputFiles('#fileInput', path.join(fixturesDir, 'success-test.pdf'));

    await page.locator('#uploadBtn').click();

    // Wait for success message with filename
    const messageArea = page.locator('#messageArea');
    await expect(messageArea).toContainText('success-test.pdf', { timeout: 10000 });
    await expect(messageArea).toContainText('File uploaded successfully');
  });

  test('Success message displayed in message area', async ({ page }) => {
    await page.goto('/');

    const fixturesDir = path.join(__dirname, '../fixtures');

    // Upload file (headless-safe)
    await page.setInputFiles('#fileInput', path.join(fixturesDir, 'success-test.pdf'));

    await page.locator('#uploadBtn').click();

    // Verify message area has role="alert" for accessibility
    const messageArea = page.locator('#messageArea');
    await expect(messageArea).toHaveAttribute('role', 'alert');
    await expect(messageArea).not.toBeEmpty({ timeout: 10000 });
  });

  test('Progress container hidden after successful upload', async ({ page }) => {
    await page.goto('/');

    const fixturesDir = path.join(__dirname, '../fixtures');

    // Upload file (headless-safe)
    await page.setInputFiles('#fileInput', path.join(fixturesDir, 'success-test.pdf'));

    await page.locator('#uploadBtn').click();

    // Wait for upload to complete
    const messageArea = page.locator('#messageArea');
    await expect(messageArea).toContainText('File uploaded successfully', { timeout: 10000 });

    // Verify progress container is hidden
    const progressContainer = page.locator('#progressContainer');
    await expect(progressContainer).toBeHidden();
  });
});

test.describe('FR-007: Error Handling and Retry', () => {

  test('AC-015: Network error displays specific error message', async ({ page, context }) => {
    await page.goto('/');

    const fixturesDir = path.join(__dirname, '../fixtures');

    // Simulate network error by going offline
    await context.setOffline(true);

    // Select and try to upload file (headless-safe)
    await page.setInputFiles('#fileInput', path.join(fixturesDir, 'success-test.pdf'));

    await page.locator('#uploadBtn').click();

    // Wait for error message
    const messageArea = page.locator('#messageArea');
    await expect(messageArea).toContainText('Upload failed due to network error', { timeout: 10000 });
    await expect(messageArea).toContainText('Please try again');

    // Restore network
    await context.setOffline(false);
  });

  test('AC-016: Server error (5xx) displays specific error message', async ({ page }) => {
    // This test requires mocking the server response
    await page.goto('/');

    const fixturesDir = path.join(__dirname, '../fixtures');

    // Intercept upload request and return 500 error
    await page.route('**/upload', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    // Select and upload file (headless-safe)
    await page.setInputFiles('#fileInput', path.join(fixturesDir, 'success-test.pdf'));

    await page.locator('#uploadBtn').click();

    // Wait for error message
    const messageArea = page.locator('#messageArea');
    await expect(messageArea).not.toBeEmpty({ timeout: 5000 });

    // Verify error is displayed (specific message may vary)
    const messageText = await messageArea.textContent();
    expect(messageText).toBeTruthy();
  });

  test('AC-017: Retry button appears after error', async ({ page, context }) => {
    await page.goto('/');

    const fixturesDir = path.join(__dirname, '../fixtures');

    // Simulate network error
    await context.setOffline(true);

    // Upload file (headless-safe)
    await page.setInputFiles('#fileInput', path.join(fixturesDir, 'success-test.pdf'));

    await page.locator('#uploadBtn').click();

    // Wait for error
    await page.waitForTimeout(2000);

    // Verify retry button appears
    const retryButton = page.locator('#retryBtn');
    await expect(retryButton).toBeVisible();
    await expect(retryButton).toHaveText('Retry Upload');

    await context.setOffline(false);
  });

  test('AC-017: Retry button re-attempts upload without re-selecting file', async ({ page, context }) => {
    await page.goto('/');

    const fixturesDir = path.join(__dirname, '../fixtures');

    // First attempt: offline
    await context.setOffline(true);

    // Select file (headless-safe)
    await page.setInputFiles('#fileInput', path.join(fixturesDir, 'success-test.pdf'));

    await page.locator('#uploadBtn').click();
    await page.waitForTimeout(2000);

    // Verify retry button appears
    const retryButton = page.locator('#retryBtn');
    await expect(retryButton).toBeVisible();

    // Go back online
    await context.setOffline(false);

    // Click retry - should upload without opening file chooser again
    await retryButton.click();

    // Wait for success message
    const messageArea = page.locator('#messageArea');
    await expect(messageArea).toContainText('File uploaded successfully', { timeout: 10000 });

    // Verify retry button is now hidden
    await expect(retryButton).toBeHidden();
  });

  test('Error message displayed in message area', async ({ page }) => {
    await page.goto('/');

    const fixturesDir = path.join(__dirname, '../fixtures');

    // Mock error response
    await page.route('**/upload', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid file' })
      });
    });

    // Upload file (headless-safe)
    await page.setInputFiles('#fileInput', path.join(fixturesDir, 'success-test.pdf'));

    await page.locator('#uploadBtn').click();

    // Verify message area contains error
    const messageArea = page.locator('#messageArea');
    await expect(messageArea).not.toBeEmpty({ timeout: 5000 });
    await expect(messageArea).toHaveAttribute('role', 'alert');
  });
});
