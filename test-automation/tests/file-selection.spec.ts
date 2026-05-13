import { test, expect } from '@playwright/test';

/**
 * Test Suite: File Selection Interface
 * Covers: AC-001, AC-002 (FR-001)
 */

test.describe('FR-001: File Selection Interface', () => {

  test('AC-001: Interface displays clearly labeled "Choose PDF File" button', async ({ page }) => {
    await page.goto('/');

    // Verify button exists and has correct text
    const selectButton = page.locator('#selectFileBtn');
    await expect(selectButton).toBeVisible();
    await expect(selectButton).toHaveText('Choose PDF File');

    // Verify button is interactive (not disabled)
    await expect(selectButton).toBeEnabled();
  });

  test('AC-002: Clicking button triggers file input dialog', async ({ page }) => {
    await page.goto('/');

    const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 5000 });
    await page.locator('#selectFileBtn').click();
    const fileChooser = await fileChooserPromise;

    expect(fileChooser).toBeTruthy();
  });

  test('File input has correct attributes', async ({ page }) => {
    await page.goto('/');

    // Verify hidden file input exists with correct attributes
    const fileInput = page.locator('#fileInput');
    await expect(fileInput).toHaveAttribute('type', 'file');
    await expect(fileInput).toHaveAttribute('accept', '.pdf');
    await expect(fileInput).toHaveAttribute('aria-label', 'Select PDF file');
  });

  test('Upload button is initially disabled', async ({ page }) => {
    await page.goto('/');

    const uploadButton = page.locator('#uploadBtn');
    await expect(uploadButton).toBeVisible();
    await expect(uploadButton).toBeDisabled();
  });
});
