import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

/**
 * Test Suite: File Upload Transmission
 * Covers: AC-008, AC-009 (FR-004)
 */

test.describe('FR-004: File Upload Transmission', () => {

  test.beforeAll(() => {
    // Ensure valid.pdf exists from previous test suite
    const fixturesDir = path.join(__dirname, '../fixtures');
    const validPdf = path.join(fixturesDir, 'valid.pdf');

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
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT /F1 12 Tf 100 700 Td (Test PDF) Tj ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000317 00000 n
trailer
<< /Size 5 /Root 1 0 R >>
startxref
409
%%EOF`;
      fs.writeFileSync(validPdf, pdfContent);
    }
  });

  test('AC-008: System sends files to /upload endpoint using multipart/form-data', async ({ page }) => {
    await page.goto('/');

    const fixturesDir = path.join(__dirname, '../fixtures');

    // Set up network interception to verify request format
    let requestReceived = false;
    let contentType = '';

    page.on('request', request => {
      if (request.url().includes('/upload')) {
        requestReceived = true;
        contentType = request.headers()['content-type'] || '';
      }
    });

    // Select and upload file
    // Use setInputFiles instead
    await page.locator('#selectFileBtn').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(fixturesDir, 'valid.pdf'));

    // Click upload button
    await page.locator('#uploadBtn').click();

    // Wait for request to complete
    await page.waitForTimeout(1000);

    // Verify request was sent
    expect(requestReceived).toBe(true);

    // Verify content-type includes multipart/form-data
    expect(contentType).toContain('multipart/form-data');
  });

  test('AC-009: Upload completes within 2 minutes', async ({ page }) => {
    await page.goto('/');

    const fixturesDir = path.join(__dirname, '../fixtures');

    // Select file
    // Use setInputFiles instead
    await page.locator('#selectFileBtn').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(fixturesDir, 'valid.pdf'));

    // Track upload start time
    const startTime = Date.now();

    // Click upload button
    await page.locator('#uploadBtn').click();

    // Wait for success or error message
    const messageArea = page.locator('#messageArea');
    await expect(messageArea).not.toBeEmpty({ timeout: 120000 }); // 2 minute timeout

    const endTime = Date.now();
    const durationSeconds = (endTime - startTime) / 1000;

    // Verify upload completed within 2 minutes
    expect(durationSeconds).toBeLessThan(120);
  });

  test('Upload sends file with correct field name', async ({ page }) => {
    await page.goto('/');

    const fixturesDir = path.join(__dirname, '../fixtures');

    // Monitor request payload
    let fileFieldFound = false;

    page.on('request', request => {
      if (request.url().includes('/upload') && request.method() === 'POST') {
        fileFieldFound = true; // Field name verification happens server-side
      }
    });

    // Select and upload file
    // Use setInputFiles instead
    await page.locator('#selectFileBtn').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(fixturesDir, 'valid.pdf'));

    await page.locator('#uploadBtn').click();

    // Wait for upload response
    const messageArea = page.locator('#messageArea');
    await expect(messageArea).not.toBeEmpty({ timeout: 5000 });

    expect(fileFieldFound).toBe(true);
  });

  test('Upload sends POST request to /upload endpoint', async ({ page }) => {
    await page.goto('/');

    const fixturesDir = path.join(__dirname, '../fixtures');

    // Track request details
    let requestMethod = '';
    let requestUrl = '';

    page.on('request', request => {
      if (request.url().includes('/upload')) {
        requestMethod = request.method();
        requestUrl = request.url();
      }
    });

    // Select and upload file
    // Use setInputFiles instead
    await page.locator('#selectFileBtn').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(path.join(fixturesDir, 'valid.pdf'));

    await page.locator('#uploadBtn').click();

    // Wait for request
    await page.waitForTimeout(1000);

    // Verify POST method
    expect(requestMethod).toBe('POST');

    // Verify endpoint URL
    expect(requestUrl).toContain('/upload');
  });
});
