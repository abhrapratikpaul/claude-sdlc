import { test, expect } from '@playwright/test';

function ensureFixtureFile(relativeName: string, content: string | Buffer): string {
  const path = require('path');
  const fs = require('fs');

  const fixturesDir = path.join(__dirname, '../fixtures');
  if (!fs.existsSync(fixturesDir)) {
    fs.mkdirSync(fixturesDir, { recursive: true });
  }

  const filePath = path.join(fixturesDir, relativeName);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
  }
  return filePath;
}

/**
 * Test Suite: Non-Functional Requirements - Accessibility and UI
 * Covers: AC-023, AC-024 (NFR-001), AC-025, AC-026, AC-027 (NFR-002),
 *         AC-031, AC-032 (NFR-004), AC-033 (NFR-005), AC-034 (NFR-006)
 */

test.describe('NFR-001: Upload Timeout', () => {

  test('AC-023: Upload requests timeout after 2 minutes', async ({ page }) => {
    // This test simulates a slow upload by intercepting the request
    await page.goto('/');

    const validPdfPath = ensureFixtureFile(
      'valid.pdf',
      '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\nxref\n0 2\n0000000000 65535 f\n0000000009 00000 n\ntrailer\n<< /Size 2 /Root 1 0 R >>\nstartxref\n58\n%%EOF'
    );

    // Intercept upload and delay indefinitely
    await page.route('**/upload', async route => {
      // Don't fulfill - let it hang until timeout
      await new Promise(resolve => setTimeout(resolve, 130000)); // 2:10 minutes
      route.abort('timedout');
    });

    // Select and upload file (headless-safe)
    await page.setInputFiles('#fileInput', validPdfPath);

    const startTime = Date.now();
    await page.locator('#uploadBtn').click();

    // Wait for error message (timeout should occur around 120s)
    const messageArea = page.locator('#messageArea');
    await expect(messageArea).not.toBeEmpty({ timeout: 130000 });

    const elapsed = (Date.now() - startTime) / 1000;

    // Verify timeout occurred around 2 minutes (allow 10s variance)
    expect(elapsed).toBeGreaterThan(110);
    expect(elapsed).toBeLessThan(140);
  });

  test('AC-024: Timeout displays error and allows retry', async ({ page }) => {
    await page.goto('/');

    const validPdfPath = ensureFixtureFile(
      'valid.pdf',
      '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\nxref\n0 2\n0000000000 65535 f\n0000000009 00000 n\ntrailer\n<< /Size 2 /Root 1 0 R >>\nstartxref\n58\n%%EOF'
    );

    // Intercept and timeout
    await page.route('**/upload', route => route.abort('timedout'));

    // Upload file (headless-safe)
    await page.setInputFiles('#fileInput', validPdfPath);

    await page.locator('#uploadBtn').click();

    // Verify error message
    const messageArea = page.locator('#messageArea');
    await expect(messageArea).toContainText('Upload failed', { timeout: 5000 });

    // Verify retry button appears
    const retryButton = page.locator('#retryBtn');
    await expect(retryButton).toBeVisible();
  });
});

test.describe('NFR-002: Web Accessibility', () => {

  test('AC-025: Interface uses semantic HTML elements', async ({ page }) => {
    await page.goto('/');

    // Verify semantic elements
    const main = page.locator('main');
    await expect(main).toBeVisible();

    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toHaveText('PDF Document Upload');

    // Verify buttons use <button> element, not divs
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThanOrEqual(3); // select, upload, retry buttons
  });

  test('AC-026: All interactive elements are keyboard-navigable', async ({ page }) => {
    await page.goto('/');

    // Tab through elements
    await page.keyboard.press('Tab');
    let focused = await page.evaluate(() => document.activeElement?.id);
    expect(focused).toBe('selectFileBtn');

    await page.keyboard.press('Tab');
    focused = await page.evaluate(() => document.activeElement?.id);
    expect(focused).toBe('uploadBtn');

    // Verify select button triggers hidden input click via keyboard (headless-safe)
    await page.evaluate(() => {
      const fileInput = document.getElementById('fileInput') as HTMLInputElement | null;
      (window as any).__fileInputClicked = false;
      fileInput?.addEventListener('click', () => {
        (window as any).__fileInputClicked = true;
      });
    });

    await page.locator('#selectFileBtn').focus();
    await page.keyboard.press('Enter');

    const wasClicked = await page.evaluate(() => (window as any).__fileInputClicked);
    expect(wasClicked).toBe(true);
  });

  test('AC-027: Interface targets WCAG 2.1 Level AA compliance', async ({ page }) => {
    await page.goto('/');

    // Check ARIA attributes
    const fileInput = page.locator('#fileInput');
    await expect(fileInput).toHaveAttribute('aria-label');

    const messageArea = page.locator('#messageArea');
    await expect(messageArea).toHaveAttribute('role', 'alert');
    await expect(messageArea).toHaveAttribute('aria-live', 'assertive');

    const filenameDisplay = page.locator('#selectedFileName');
    await expect(filenameDisplay).toHaveAttribute('role', 'status');
    await expect(filenameDisplay).toHaveAttribute('aria-live', 'polite');

    const progressBar = page.locator('#progressBar');
    await expect(progressBar).toHaveAttribute('aria-label');

    // Check for valid HTML structure
    const html = await page.content();
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('lang="en"');
  });

  test('Buttons have visible focus indicators', async ({ page }) => {
    await page.goto('/');

    // Focus select button
    await page.locator('#selectFileBtn').focus();

    // Check computed styles (should have outline or visible focus style)
    const selectBtn = page.locator('#selectFileBtn');
    await expect(selectBtn).toBeFocused();

    // Verify focus is visually distinct (implementation-dependent)
    const outlineWidth = await selectBtn.evaluate(el => {
      return window.getComputedStyle(el).outlineWidth;
    });
    expect(outlineWidth).not.toBe('0px');
  });
});

test.describe('NFR-004: UI Simplicity', () => {

  test('AC-031: Interface is a single standalone web page', async ({ page }) => {
    await page.goto('/');

    // Verify no navigation to other pages
    const links = page.locator('a');
    const linkCount = await links.count();
    expect(linkCount).toBe(0); // No navigation links

    // Verify all functionality on one page
    await expect(page.locator('#selectFileBtn')).toBeVisible();
    await expect(page.locator('#uploadBtn')).toBeVisible();
    await expect(page.locator('#messageArea')).toBeVisible();
  });

  test('AC-032: Drag-and-drop is out of scope', async ({ page }) => {
    await page.goto('/');

    // Verify no drag-and-drop zone or instructions
    const content = await page.content();
    expect(content.toLowerCase()).not.toContain('drag');
    expect(content.toLowerCase()).not.toContain('drop');

    // File input should not have multiple attribute
    const fileInput = page.locator('#fileInput');
    const isMultiple = await fileInput.evaluate(el => (el as HTMLInputElement).multiple);
    expect(isMultiple).toBe(false);
  });

  test('UI contains only essential elements', async ({ page }) => {
    await page.goto('/');

    // Count total interactive elements
    const buttons = await page.locator('button').count();
    expect(buttons).toBe(3); // select, upload, retry

    const inputs = await page.locator('input').count();
    expect(inputs).toBe(1); // file input only
  });
});

test.describe('NFR-005: Performance', () => {

  test('AC-033: UI interactions respond within 200ms', async ({ page }) => {
    await page.goto('/');

    // Test button click responsiveness
    await page.evaluate(() => {
      const fileInput = document.getElementById('fileInput') as HTMLInputElement | null;
      (window as any).__fileInputClicked = false;
      fileInput?.addEventListener('click', () => {
        (window as any).__fileInputClicked = true;
      });
    });

    const startTime = Date.now();
    await page.locator('#selectFileBtn').click();
    const wasClicked = await page.evaluate(() => (window as any).__fileInputClicked);
    const elapsed = Date.now() - startTime;

    expect(wasClicked).toBe(true);
    expect(elapsed).toBeLessThan(200);
  });

  test('Validation feedback appears within 200ms', async ({ page }) => {
    await page.goto('/');

    const txtPath = ensureFixtureFile('document.txt', 'This is a text file, not a PDF');

    const startTime = Date.now();
    await page.setInputFiles('#fileInput', txtPath);

    // Wait for error message
    const messageArea = page.locator('#messageArea');
    await expect(messageArea).not.toBeEmpty({ timeout: 500 });

    const elapsed = Date.now() - startTime;
    expect(elapsed).toBeLessThan(200);
  });

  test('Page loads quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    const elapsed = Date.now() - startTime;

    // Page should load in under 2 seconds
    expect(elapsed).toBeLessThan(2000);
  });
});

test.describe('NFR-006: Browser Compatibility', () => {

  test('AC-034: Application works in modern browsers', async ({ page, browserName }) => {
    await page.goto('/');

    // Verify core functionality loads
    await expect(page.locator('#selectFileBtn')).toBeVisible();
    await expect(page.locator('#uploadBtn')).toBeVisible();

    // Test basic interaction (headless-safe)
    await page.evaluate(() => {
      const fileInput = document.getElementById('fileInput') as HTMLInputElement | null;
      (window as any).__fileInputClicked = false;
      fileInput?.addEventListener('click', () => {
        (window as any).__fileInputClicked = true;
      });
    });

    await page.locator('#selectFileBtn').click();
    const wasClicked = await page.evaluate(() => (window as any).__fileInputClicked);
    expect(wasClicked).toBe(true);

    // Log browser for verification
    console.log(`Test passed in browser: ${browserName}`);
  });

  test('JavaScript is enabled and functional', async ({ page }) => {
    await page.goto('/');

    // Verify JavaScript event handlers work
    await page.evaluate(() => {
      const fileInput = document.getElementById('fileInput') as HTMLInputElement | null;
      (window as any).__fileInputClicked = false;
      fileInput?.addEventListener('click', () => {
        (window as any).__fileInputClicked = true;
      });
    });

    await page.locator('#selectFileBtn').click();
    const wasClicked = await page.evaluate(() => (window as any).__fileInputClicked);
    expect(wasClicked).toBe(true);
  });

  test('CSS styles are applied', async ({ page }) => {
    await page.goto('/');

    // Check that button has styling
    const selectBtn = page.locator('#selectFileBtn');
    const backgroundColor = await selectBtn.evaluate(el => {
      return window.getComputedStyle(el).backgroundColor;
    });

    // Should have some background color (not default transparent)
    expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  });
});
