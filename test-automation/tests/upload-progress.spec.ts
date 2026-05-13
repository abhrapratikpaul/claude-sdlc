import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * Test Suite: Upload Progress Tracking
 * Covers: AC-010, AC-011, AC-012 (FR-005)
 */

test.describe('FR-005: Upload Progress Tracking', () => {

  test.beforeAll(() => {
    const fixturesDir = path.join(__dirname, '../fixtures');

    // Create a medium-sized PDF to allow observable progress
    const mediumPdf = path.join(fixturesDir, 'medium.pdf');
    if (!fs.existsSync(mediumPdf)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
      const size5MB = 5 * 1024 * 1024; // 5 MB
      const buffer = Buffer.alloc(size5MB);
      buffer.write('%PDF-1.4\n', 0);
      buffer.write('%%EOF', size5MB - 6);
      fs.writeFileSync(mediumPdf, buffer);
    }
  });

  test('AC-010: System displays progress indicator during upload', async ({ page }) => {
    await page.goto('/');

    const fixturesDir = path.join(__dirname, '../fixtures');

    // Select file (headless-safe)
    await page.setInputFiles('#fileInput', path.join(fixturesDir, 'medium.pdf'));

    // Start upload
    await page.locator('#uploadBtn').click();

    // Verify progress container becomes visible
    const progressContainer = page.locator('#progressContainer');
    await expect(progressContainer).toBeVisible({ timeout: 2000 });

    // Verify progress bar exists
    const progressBar = page.locator('#progressBar');
    await expect(progressBar).toBeVisible();

    // Verify progress text exists
    const progressText = page.locator('#progressText');
    await expect(progressText).toBeVisible();
  });

  test('AC-011: Progress indicator updates at least once per second', async ({ page }) => {
    await page.goto('/');

    const fixturesDir = path.join(__dirname, '../fixtures');

    // Select file (headless-safe)
    await page.setInputFiles('#fileInput', path.join(fixturesDir, 'medium.pdf'));

    // Start upload
    await page.locator('#uploadBtn').click();

    // Wait for progress to start
    const progressContainer = page.locator('#progressContainer');
    await expect(progressContainer).toBeVisible();

    // Track progress values over time
    const progressText = page.locator('#progressText');
    const initialValue = await progressText.textContent();

    // Wait 1 second
    await page.waitForTimeout(1000);

    const laterValue = await progressText.textContent();

    // Progress should have changed (or reached 100%)
    expect(initialValue !== laterValue || laterValue === '100%').toBe(true);
  });

  test('AC-012: Progress indicator accurately reflects percentage transmitted (0-100%)', async ({ page }) => {
    await page.goto('/');

    const fixturesDir = path.join(__dirname, '../fixtures');

    // Select file (headless-safe)
    await page.setInputFiles('#fileInput', path.join(fixturesDir, 'medium.pdf'));

    // Start upload
    await page.locator('#uploadBtn').click();

    // Wait for progress to appear
    const progressBar = page.locator('#progressBar');
    await expect(progressBar).toBeVisible();

    // Track progress values
    const progressValues: number[] = [];

    // Sample progress multiple times
    for (let i = 0; i < 5; i++) {
      await page.waitForTimeout(200);
      const progressText = page.locator('#progressText');
      const text = await progressText.textContent();
      if (text) {
        const percent = parseInt(text.replace('%', ''));
        progressValues.push(percent);
      }
    }

    // Verify all values are in range 0-100
    for (const value of progressValues) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    }

    // Verify progress is monotonically increasing (or stays at 100%)
    for (let i = 1; i < progressValues.length; i++) {
      expect(progressValues[i]).toBeGreaterThanOrEqual(progressValues[i - 1]);
    }
  });

  test('Progress bar has correct attributes', async ({ page }) => {
    await page.goto('/');

    const fixturesDir = path.join(__dirname, '../fixtures');

    // Select file (headless-safe)
    await page.setInputFiles('#fileInput', path.join(fixturesDir, 'medium.pdf'));

    // Start upload
    await page.locator('#uploadBtn').click();

    // Verify progress bar attributes
    const progressBar = page.locator('#progressBar');
    await expect(progressBar).toBeVisible();

    await expect(progressBar).toHaveAttribute('max', '100');
    await expect(progressBar).toHaveAttribute('aria-label', 'Upload progress');
  });

  test('Progress container hidden before upload starts', async ({ page }) => {
    await page.goto('/');

    // Verify progress container is initially hidden
    const progressContainer = page.locator('#progressContainer');
    await expect(progressContainer).toBeHidden();
  });
});
